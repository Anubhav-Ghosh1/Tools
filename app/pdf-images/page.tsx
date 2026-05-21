"use client";

import { useState } from "react";
import ToolShell from "@/components/ToolShell";
import { bySlug } from "@/lib/tools";

const tool = bySlug("pdf-images")!;

export default function Page() {
  const [pages, setPages] = useState<string[]>([]);
  const [scale, setScale] = useState(2);
  const [fmt, setFmt] = useState<"image/png" | "image/jpeg">("image/png");
  const [quality, setQuality] = useState(0.92);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const render = async (file: File) => {
    setErr(""); setBusy(true); setPages([]);
    try {
      const pdfjs: any = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.7.76/pdf.worker.min.mjs`;
      const buf = await file.arrayBuffer();
      const doc = await pdfjs.getDocument({ data: buf }).promise;
      const out: string[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const vp = page.getViewport({ scale });
        const c = document.createElement("canvas");
        c.width = vp.width; c.height = vp.height;
        const ctx = c.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport: vp }).promise;
        out.push(c.toDataURL(fmt, quality));
      }
      setPages(out);
    } catch (e: any) {
      setErr(e.message);
    } finally { setBusy(false); }
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-4">
        <input type="file" accept="application/pdf" onChange={(e) => e.target.files?.[0] && render(e.target.files[0])} className="block text-sm" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-2xl">
          <div>
            <label className="label">Scale (DPI proxy): {scale}×</label>
            <input type="range" min={1} max={4} step={0.5} value={scale} onChange={(e) => setScale(Number(e.target.value))} className="w-full" />
          </div>
          <div>
            <label className="label">Format</label>
            <select className="field" value={fmt} onChange={(e) => setFmt(e.target.value as any)}>
              <option value="image/png">PNG</option>
              <option value="image/jpeg">JPEG</option>
            </select>
          </div>
          <div>
            <label className="label">Quality (JPEG): {Math.round(quality * 100)}%</label>
            <input type="range" min={0.1} max={1} step={0.05} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full" />
          </div>
        </div>
        {busy && <div className="ok">Rendering…</div>}
        {err && <div className="err">{err}</div>}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {pages.map((p, i) => (
            <a key={i} href={p} download={`page-${i + 1}.${fmt.split("/")[1]}`} className="block rounded border border-neutral-800 p-1 hover:border-neutral-500">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p} alt={`page ${i + 1}`} className="w-full" />
              <div className="text-xs text-center text-neutral-400 mt-1">Page {i + 1}</div>
            </a>
          ))}
        </div>
      </div>
    </ToolShell>
  );
}
