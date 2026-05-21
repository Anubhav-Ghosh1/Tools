"use client";

import { useRef, useState } from "react";
import ToolShell from "@/components/ToolShell";
import { bySlug } from "@/lib/tools";

const tool = bySlug("image-compressor")!;

async function compressToTarget(src: string, targetBytes: number, mime: string) {
  const img = new Image();
  img.src = src;
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });
  let { width: w, height: h } = img;
  let scale = 1;
  for (let pass = 0; pass < 8; pass++) {
    let lo = 0.05, hi = 1, best: Blob | null = null;
    for (let i = 0; i < 12; i++) {
      const q = (lo + hi) / 2;
      const c = document.createElement("canvas");
      c.width = Math.round(w * scale); c.height = Math.round(h * scale);
      const ctx = c.getContext("2d")!;
      ctx.drawImage(img, 0, 0, c.width, c.height);
      const blob: Blob = await new Promise((res) => c.toBlob((b) => res(b!), mime, q));
      if (blob.size <= targetBytes) { best = blob; lo = q; } else { hi = q; }
    }
    if (best) return best;
    scale *= 0.85;
    if (scale < 0.1) break;
  }
  return null;
}

export default function Page() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [src, setSrc] = useState("");
  const [inSize, setInSize] = useState(0);
  const [target, setTarget] = useState(500);
  const [unit, setUnit] = useState<"KB" | "MB">("KB");
  const [fmt, setFmt] = useState("image/jpeg");
  const [out, setOut] = useState<{ url: string; size: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const onFile = (f: File) => {
    setInSize(f.size);
    const r = new FileReader();
    r.onload = () => setSrc(String(r.result));
    r.readAsDataURL(f);
  };

  const run = async () => {
    setErr(""); setOut(null); setBusy(true);
    try {
      const bytes = target * (unit === "KB" ? 1024 : 1024 * 1024);
      const blob = await compressToTarget(src, bytes, fmt);
      if (!blob) throw new Error("Could not reach target size");
      setOut({ url: URL.createObjectURL(blob), size: blob.size });
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-4">
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
        <button className="btn" onClick={() => fileRef.current?.click()}>Choose image</button>
        {src && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="label">Target size</label>
                <input className="field" type="number" min={1} value={target} onChange={(e) => setTarget(Number(e.target.value))} />
              </div>
              <div>
                <label className="label">Unit</label>
                <select className="field" value={unit} onChange={(e) => setUnit(e.target.value as any)}>
                  <option>KB</option><option>MB</option>
                </select>
              </div>
              <div>
                <label className="label">Format</label>
                <select className="field" value={fmt} onChange={(e) => setFmt(e.target.value)}>
                  <option value="image/jpeg">JPEG</option>
                  <option value="image/webp">WebP</option>
                  <option value="image/png">PNG</option>
                </select>
              </div>
            </div>
            <button className="btn-primary" disabled={busy} onClick={run}>{busy ? "Compressing…" : "Compress"}</button>
            <div className="text-sm text-neutral-400">Original: {(inSize / 1024).toFixed(1)} KB</div>
            {err && <div className="err">{err}</div>}
            {out && (
              <div className="rounded-md border border-neutral-800 p-3 space-y-2">
                <div className="text-sm">Output: {(out.size / 1024).toFixed(1)} KB ({((1 - out.size / inSize) * 100).toFixed(0)}% smaller)</div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={out.url} alt="out" className="max-w-full max-h-96" />
                <a href={out.url} download={`compressed.${fmt.split("/")[1]}`} className="btn">Download</a>
              </div>
            )}
          </>
        )}
      </div>
    </ToolShell>
  );
}
