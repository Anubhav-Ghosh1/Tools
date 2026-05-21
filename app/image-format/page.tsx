"use client";

import { useRef, useState } from "react";
import ToolShell from "@/components/ToolShell";
import { bySlug } from "@/lib/tools";

const tool = bySlug("image-format")!;

const FORMATS = [
  { value: "image/png", label: "PNG" },
  { value: "image/jpeg", label: "JPEG" },
  { value: "image/webp", label: "WebP" },
];

export default function Page() {
  const [src, setSrc] = useState("");
  const [out, setOut] = useState("");
  const [fmt, setFmt] = useState("image/png");
  const [quality, setQuality] = useState(0.92);
  const [maxW, setMaxW] = useState<number | "">("");
  const [info, setInfo] = useState({ inSize: 0, outSize: 0, w: 0, h: 0 });
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (f: File) => {
    const r = new FileReader();
    r.onload = () => {
      const url = String(r.result);
      setSrc(url);
      setInfo((p) => ({ ...p, inSize: f.size }));
    };
    r.readAsDataURL(f);
  };

  const convert = async () => {
    if (!src) return;
    const img = new Image();
    img.src = src;
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });
    let w = img.width, h = img.height;
    if (maxW && Number(maxW) && Number(maxW) < w) {
      const ratio = Number(maxW) / w;
      w = Number(maxW); h = Math.round(h * ratio);
    }
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const ctx = c.getContext("2d")!;
    ctx.drawImage(img, 0, 0, w, h);
    const blob = await new Promise<Blob>((res) => c.toBlob((b) => res(b!), fmt, quality));
    const url = URL.createObjectURL(blob);
    setOut(url);
    setInfo({ ...info, outSize: blob.size, w, h });
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
                <label className="label">Output format</label>
                <select className="field" value={fmt} onChange={(e) => setFmt(e.target.value)}>
                  {FORMATS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Quality: {Math.round(quality * 100)}%</label>
                <input type="range" min={0.1} max={1} step={0.01} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full" />
              </div>
              <div>
                <label className="label">Max width (optional)</label>
                <input className="field" type="number" value={maxW} onChange={(e) => setMaxW(e.target.value ? Number(e.target.value) : "")} />
              </div>
            </div>
            <button className="btn-primary" onClick={convert}>Convert</button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Original ({(info.inSize / 1024).toFixed(1)} KB)</label>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="src" className="max-w-full rounded border border-neutral-800" />
              </div>
              <div>
                <label className="label">Output {out && `(${(info.outSize / 1024).toFixed(1)} KB · ${info.w}×${info.h})`}</label>
                {out ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={out} alt="out" className="max-w-full rounded border border-neutral-800" />
                    <a href={out} download={`converted.${fmt.split("/")[1]}`} className="btn mt-2">Download</a>
                  </>
                ) : <div className="text-sm text-neutral-500">Click Convert</div>}
              </div>
            </div>
          </>
        )}
      </div>
    </ToolShell>
  );
}
