"use client";
import { useEffect, useRef, useState } from "react";
import ToolShell from "@/components/ToolShell";
import { bySlug } from "@/lib/tools";
import { Upload, ArrowDownToLine, ZoomIn } from "lucide-react";

const tool = bySlug("image-compressor")!;

function fmt(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// ── Probe sizes at different quality levels ───────────
async function probeQualities(src: string, mime: string, w: number, h: number) {
  const img = new Image();
  img.src = src;
  await new Promise(res => { img.onload = res; });
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, w, h);
  const results: { q: number; label: string; bytes: number }[] = [];
  for (const [q, label] of [[0.9,"90%"],[0.75,"75%"],[0.6,"60%"],[0.4,"40%"],[0.25,"25%"]] as [number,string][]) {
    const blob: Blob = await new Promise(res => canvas.toBlob(b => res(b!), mime, q));
    results.push({ q, label, bytes: blob.size });
  }
  return results;
}

// ── Compress to target size ───────────────────────────
async function compressToTarget(src: string, targetBytes: number, mime: string): Promise<{blob:Blob;scale:number}|null> {
  const img = new Image();
  img.src = src;
  await new Promise(res => { img.onload = res; });
  let { width: w, height: h } = img;
  let scale = 1;
  for (let pass = 0; pass < 8; pass++) {
    let lo = 0.05, hi = 1, best: Blob | null = null;
    for (let i = 0; i < 12; i++) {
      const q = (lo + hi) / 2;
      const c = document.createElement("canvas");
      c.width = Math.round(w * scale); c.height = Math.round(h * scale);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      const blob: Blob = await new Promise(res => c.toBlob(b => res(b!), mime, q));
      if (blob.size <= targetBytes) { best = blob; lo = q; } else { hi = q; }
    }
    if (best) return { blob: best, scale };
    scale *= 0.85;
    if (scale < 0.1) break;
  }
  return null;
}

// ── Upscale ───────────────────────────────────────────
async function upscaleImage(src: string, scaleX: number, scaleY: number, mime: string, quality: number): Promise<Blob> {
  const img = new Image();
  img.src = src;
  await new Promise(res => { img.onload = res; });
  const newW = Math.round(img.width * scaleX);
  const newH = Math.round(img.height * scaleY);
  const canvas = document.createElement("canvas");
  canvas.width = newW; canvas.height = newH;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, newW, newH);
  return new Promise(res => canvas.toBlob(b => res(b!), mime, quality));
}

// ── Image info ───────────────────────────────────────
interface ImgInfo { w: number; h: number; size: number; name: string; mime: string }
interface ProbeResult { q: number; label: string; bytes: number }
interface Result { url: string; size: number; w: number; h: number }

export default function Page() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [src,   setSrc]   = useState("");
  const [info,  setInfo]  = useState<ImgInfo | null>(null);
  const [probes,setProbes] = useState<ProbeResult[]>([]);
  const [mode,  setMode]  = useState<"compress" | "upscale">("compress");

  // Compress state
  const [target, setTarget] = useState(500);
  const [unit,   setUnit]   = useState<"KB" | "MB">("KB");
  const [cFmt,   setCFmt]   = useState("image/jpeg");

  // Upscale state
  const [scale,  setScale]  = useState("2");
  const [uFmt,   setUFmt]   = useState("image/png");
  const [uQual,  setUQual]  = useState(0.95);

  const [result, setResult] = useState<Result | null>(null);
  const [busy,   setBusy]   = useState(false);
  const [err,    setErr]    = useState("");

  async function loadFile(f: File) {
    setResult(null); setErr(""); setProbes([]);
    const url = await new Promise<string>(res => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.readAsDataURL(f);
    });
    const img = new Image();
    img.src = url;
    await new Promise(res => { img.onload = res; });
    const mime = f.type || "image/jpeg";
    const inf: ImgInfo = { w: img.width, h: img.height, size: f.size, name: f.name, mime };
    setSrc(url);
    setInfo(inf);
    setCFmt(mime.includes("png") ? "image/png" : mime.includes("webp") ? "image/webp" : "image/jpeg");
    // Background probe
    probeQualities(url, mime.includes("png") ? "image/png" : "image/jpeg", img.width, img.height)
      .then(setProbes);
  }

  // Revoke old result blob URL
  useEffect(() => {
    return () => { if (result?.url) URL.revokeObjectURL(result.url); };
  }, [result]);

  async function runCompress() {
    setBusy(true); setErr(""); setResult(null);
    try {
      const bytes = target * (unit === "KB" ? 1024 : 1024 * 1024);
      const r = await compressToTarget(src, bytes, cFmt);
      if (!r) throw new Error("Cannot reach target — too small for this image content");
      const img = new Image();
      img.src = URL.createObjectURL(r.blob);
      await new Promise(res => { img.onload = res; });
      setResult({ url: img.src, size: r.blob.size, w: img.width, h: img.height });
    } catch (e: unknown) { setErr((e as Error).message); }
    finally { setBusy(false); }
  }

  async function runUpscale() {
    setBusy(true); setErr(""); setResult(null);
    try {
      const s = parseFloat(scale);
      if (isNaN(s) || s <= 0 || s > 8) throw new Error("Scale must be between 0.1 and 8");
      const blob = await upscaleImage(src, s, s, uFmt, uQual);
      const url  = URL.createObjectURL(blob);
      const img  = new Image(); img.src = url;
      await new Promise(res => { img.onload = res; });
      setResult({ url, size: blob.size, w: img.width, h: img.height });
    } catch (e: unknown) { setErr((e as Error).message); }
    finally { setBusy(false); }
  }

  const ext = (mime: string) => mime.split("/")[1] === "jpeg" ? "jpg" : mime.split("/")[1];

  return (
    <ToolShell tool={tool}>
      <div className="space-y-5">

        {/* Drop zone */}
        <div
          className="rounded-xl border-2 border-dashed border-neutral-700 bg-neutral-900/30 hover:border-neutral-500 hover:bg-neutral-900/50 transition cursor-pointer flex flex-col items-center justify-center gap-3 py-10"
          onClick={() => fileRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith("image/")) loadFile(f); }}
        >
          <Upload size={28} className="text-neutral-600" />
          <p className="text-sm text-neutral-500">Drop an image here or <span className="text-emerald-400 hover:underline">browse</span></p>
          <p className="text-xs text-neutral-700">PNG, JPEG, WebP</p>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && loadFile(e.target.files[0])} />
        </div>

        {info && (
          <>
            {/* ── Before / After preview ───────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original */}
              <div className="rounded-xl border border-neutral-800 overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 bg-neutral-900/60 border-b border-neutral-800">
                  <span className="text-xs font-medium text-neutral-400">Original</span>
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <span>{info.w} × {info.h}px</span>
                    <span className="font-semibold text-neutral-300">{fmt(info.size)}</span>
                  </div>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="original" className="w-full object-contain max-h-64 bg-checkerboard" />
              </div>

              {/* Result */}
              <div className="rounded-xl border border-neutral-800 overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 bg-neutral-900/60 border-b border-neutral-800">
                  <span className="text-xs font-medium text-neutral-400">{mode === "compress" ? "Compressed" : "Upscaled"}</span>
                  {result && (
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <span>{result.w} × {result.h}px</span>
                      <span className="font-semibold text-emerald-400">{fmt(result.size)}</span>
                      {mode === "compress" && (
                        <span className="text-emerald-500">↓ {((1 - result.size / info.size) * 100).toFixed(0)}%</span>
                      )}
                      {mode === "upscale" && (
                        <span className="text-blue-400">↑ {(result.size / info.size).toFixed(1)}×</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="max-h-64 flex items-center justify-center bg-checkerboard min-h-32">
                  {result ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={result.url} alt="result" className="w-full object-contain max-h-64" />
                  ) : (
                    <p className="text-xs text-neutral-600">{busy ? "Processing…" : "Output will appear here"}</p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Quality analysis (probe) ─────────── */}
            {probes.length > 0 && mode === "compress" && (
              <div className="panel space-y-2">
                <p className="text-xs font-medium text-neutral-400">Suggested targets <span className="text-neutral-600 font-normal">(JPEG quality estimate)</span></p>
                <div className="flex flex-wrap gap-2">
                  {probes.map(p => (
                    <button
                      key={p.q}
                      onClick={() => {
                        const kb = p.bytes / 1024;
                        if (kb < 1024) { setTarget(Math.ceil(kb)); setUnit("KB"); }
                        else { setTarget(parseFloat((p.bytes / (1024*1024)).toFixed(1))); setUnit("MB"); }
                      }}
                      className="flex flex-col items-center rounded-lg border border-neutral-700 hover:border-emerald-700/60 hover:bg-emerald-950/20 transition px-3 py-2 min-w-[72px]"
                    >
                      <span className="text-xs font-semibold text-neutral-300">{fmt(p.bytes)}</span>
                      <span className="text-[10px] text-neutral-600 mt-0.5">q={p.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Mode toggle ──────────────────────── */}
            <div className="flex rounded-lg border border-neutral-700 overflow-hidden w-fit">
              {(["compress","upscale"] as const).map(m => (
                <button key={m} onClick={() => { setMode(m); setResult(null); setErr(""); }}
                  className={`flex items-center gap-2 px-5 py-2 text-sm font-medium transition ${mode===m?"bg-emerald-600 text-white":"text-neutral-400 hover:bg-neutral-800"}`}>
                  {m === "compress" ? <ArrowDownToLine size={14} /> : <ZoomIn size={14} />}
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>

            {/* ── Compress controls ────────────────── */}
            {mode === "compress" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="label">Target size</label>
                    <input className="field" type="number" min={1} value={target} onChange={e => setTarget(Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="label">Unit</label>
                    <select className="field" value={unit} onChange={e => setUnit(e.target.value as "KB"|"MB")}>
                      <option>KB</option><option>MB</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Output format</label>
                    <select className="field" value={cFmt} onChange={e => setCFmt(e.target.value)}>
                      <option value="image/jpeg">JPEG</option>
                      <option value="image/webp">WebP</option>
                      <option value="image/png">PNG (lossless)</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[["50 KB",50,"KB"],["100 KB",100,"KB"],["200 KB",200,"KB"],["500 KB",500,"KB"],["1 MB",1,"MB"],["2 MB",2,"MB"]].map(([label,v,u])=>(
                    <button key={label as string} onClick={()=>{setTarget(v as number);setUnit(u as "KB"|"MB")}}
                      className="text-xs border border-neutral-700 rounded-full px-3 py-1 text-neutral-500 hover:border-neutral-500 hover:text-neutral-300 transition">
                      {label as string}
                    </button>
                  ))}
                </div>
                <button className="btn-primary" disabled={busy} onClick={runCompress}>
                  {busy ? "Compressing…" : "Compress"}
                </button>
              </div>
            )}

            {/* ── Upscale controls ─────────────────── */}
            {mode === "upscale" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="label">Scale factor</label>
                    <input className="field" type="number" min={0.1} max={8} step={0.5} value={scale} onChange={e=>setScale(e.target.value)} placeholder="2" />
                  </div>
                  <div>
                    <label className="label">Output format</label>
                    <select className="field" value={uFmt} onChange={e=>setUFmt(e.target.value)}>
                      <option value="image/png">PNG (lossless)</option>
                      <option value="image/jpeg">JPEG</option>
                      <option value="image/webp">WebP</option>
                    </select>
                  </div>
                  {uFmt !== "image/png" && (
                    <div>
                      <label className="label">Quality: {Math.round(uQual*100)}%</label>
                      <input type="range" min={0.5} max={1} step={0.05} value={uQual} onChange={e=>setUQual(Number(e.target.value))} className="w-full mt-2" />
                    </div>
                  )}
                </div>
                {info && !isNaN(parseFloat(scale)) && parseFloat(scale) > 0 && (
                  <p className="text-xs text-neutral-500">
                    Output dimensions: <span className="font-mono text-neutral-300">{Math.round(info.w * parseFloat(scale))} × {Math.round(info.h * parseFloat(scale))}px</span>
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {[["1.5×","1.5"],["2×","2"],["3×","3"],["4×","4"]].map(([label,v])=>(
                    <button key={label} onClick={()=>setScale(v)}
                      className="text-xs border border-neutral-700 rounded-full px-3 py-1 text-neutral-500 hover:border-neutral-500 hover:text-neutral-300 transition">
                      {label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-neutral-600">Uses canvas high-quality bicubic interpolation. Best for line art and UI assets. Photos benefit less.</p>
                <button className="btn-primary" disabled={busy} onClick={runUpscale}>
                  {busy ? "Upscaling…" : "Upscale"}
                </button>
              </div>
            )}

            {err && <div className="err">{err}</div>}

            {result && (
              <a
                href={result.url}
                download={`${mode === "compress" ? "compressed" : "upscaled"}.${ext(mode === "compress" ? cFmt : uFmt)}`}
                className="btn-primary w-fit flex items-center gap-2"
              >
                <ArrowDownToLine size={14} />
                Download ({fmt(result.size)})
              </a>
            )}
          </>
        )}
      </div>
    </ToolShell>
  );
}
