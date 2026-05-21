"use client";

import { useEffect, useRef, useState } from "react";
import ToolShell from "@/components/ToolShell";
import { bySlug } from "@/lib/tools";

const tool = bySlug("qr-generator")!;

export default function Page() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [text, setText] = useState("https://example.com");
  const [size, setSize] = useState(256);
  const [level, setLevel] = useState<"L" | "M" | "Q" | "H">("M");
  const [fg, setFg] = useState("#000000");
  const [bg, setBg] = useState("#ffffff");
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (!ref.current || !text) return;
    let cancelled = false;
    (async () => {
      const QR = await import("qrcode");
      if (cancelled) return;
      await QR.toCanvas(ref.current!, text, { width: size, errorCorrectionLevel: level, color: { dark: fg, light: bg } });
      setUrl(ref.current!.toDataURL("image/png"));
    })();
    return () => { cancelled = true; };
  }, [text, size, level, fg, bg]);

  return (
    <ToolShell tool={tool}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <label className="label">Text or URL</label>
            <textarea className="field" value={text} onChange={(e) => setText(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Size: {size}</label>
              <input type="range" min={128} max={1024} step={32} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full" />
            </div>
            <div>
              <label className="label">Error correction</label>
              <select className="field" value={level} onChange={(e) => setLevel(e.target.value as any)}>
                <option value="L">L (7%)</option>
                <option value="M">M (15%)</option>
                <option value="Q">Q (25%)</option>
                <option value="H">H (30%)</option>
              </select>
            </div>
            <div>
              <label className="label">Foreground</label>
              <input type="color" className="field h-10 p-1" value={fg} onChange={(e) => setFg(e.target.value)} />
            </div>
            <div>
              <label className="label">Background</label>
              <input type="color" className="field h-10 p-1" value={bg} onChange={(e) => setBg(e.target.value)} />
            </div>
          </div>
          {url && <a download="qr.png" href={url} className="btn">Download PNG</a>}
        </div>
        <div className="flex items-start justify-center">
          <canvas ref={ref} className="bg-white rounded" />
        </div>
      </div>
    </ToolShell>
  );
}
