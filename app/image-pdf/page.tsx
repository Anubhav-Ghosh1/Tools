"use client";

import { useState } from "react";
import ToolShell from "@/components/ToolShell";
import { bySlug } from "@/lib/tools";

const tool = bySlug("image-pdf")!;

type Pic = { url: string; name: string };
const PAGES = { A4: [595, 842], Letter: [612, 792] } as const;

export default function Page() {
  const [pics, setPics] = useState<Pic[]>([]);
  const [pageSize, setPageSize] = useState<"A4" | "Letter" | "Image">("A4");
  const [margin, setMargin] = useState(20);
  const [busy, setBusy] = useState(false);

  const add = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((f) => {
      const r = new FileReader();
      r.onload = () => setPics((p) => [...p, { url: String(r.result), name: f.name }]);
      r.readAsDataURL(f);
    });
  };

  const move = (i: number, dir: -1 | 1) => {
    setPics((p) => {
      const arr = [...p];
      const j = i + dir;
      if (j < 0 || j >= arr.length) return arr;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return arr;
    });
  };

  const remove = (i: number) => setPics((p) => p.filter((_, idx) => idx !== i));

  const build = async () => {
    setBusy(true);
    try {
      const { jsPDF } = await import("jspdf");
      let pdf: any = null;
      for (let i = 0; i < pics.length; i++) {
        const img = new Image();
        img.src = pics[i].url;
        await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });

        let pw: number, ph: number;
        if (pageSize === "Image") {
          pw = img.width; ph = img.height;
        } else {
          [pw, ph] = PAGES[pageSize] as unknown as [number, number];
        }
        if (i === 0) {
          pdf = new jsPDF({ unit: "pt", format: pageSize === "Image" ? [pw, ph] : pageSize.toLowerCase(), orientation: pw > ph ? "landscape" : "portrait" });
        } else {
          pdf.addPage(pageSize === "Image" ? [pw, ph] : pageSize.toLowerCase(), pw > ph ? "landscape" : "portrait");
        }
        const m = pageSize === "Image" ? 0 : margin;
        const maxW = pw - m * 2, maxH = ph - m * 2;
        const ratio = Math.min(maxW / img.width, maxH / img.height);
        const w = img.width * ratio, h = img.height * ratio;
        const x = (pw - w) / 2, y = (ph - h) / 2;
        pdf.addImage(pics[i].url, "JPEG", x, y, w, h, undefined, "FAST");
      }
      pdf?.save("images.pdf");
    } finally { setBusy(false); }
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-4">
        <input type="file" accept="image/*" multiple onChange={(e) => add(e.target.files)} className="block text-sm" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-2xl">
          <div>
            <label className="label">Page size</label>
            <select className="field" value={pageSize} onChange={(e) => setPageSize(e.target.value as any)}>
              <option>A4</option><option>Letter</option><option>Image</option>
            </select>
          </div>
          <div>
            <label className="label">Margin (pt)</label>
            <input type="number" className="field" value={margin} min={0} onChange={(e) => setMargin(Number(e.target.value))} />
          </div>
        </div>
        <ul className="space-y-2">
          {pics.map((p, i) => (
            <li key={i} className="flex items-center gap-3 rounded-md border border-neutral-800 p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={p.name} className="w-16 h-16 object-cover rounded" />
              <span className="flex-1 truncate text-sm">{p.name}</span>
              <button className="btn" onClick={() => move(i, -1)}>↑</button>
              <button className="btn" onClick={() => move(i, 1)}>↓</button>
              <button className="btn" onClick={() => remove(i)}>×</button>
            </li>
          ))}
        </ul>
        <button className="btn-primary" disabled={!pics.length || busy} onClick={build}>{busy ? "Building…" : "Download PDF"}</button>
      </div>
    </ToolShell>
  );
}
