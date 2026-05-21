"use client";

import { useState } from "react";
import ToolShell from "@/components/ToolShell";
import { bySlug } from "@/lib/tools";

const tool = bySlug("file-compressor")!;

async function streamThrough(input: ReadableStream<Uint8Array>, transform: TransformStream<Uint8Array, Uint8Array>) {
  const out = input.pipeThrough(transform);
  const reader = out.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    chunks.push(value); total += value.length;
  }
  const buf = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) { buf.set(c, off); off += c.length; }
  return buf;
}

export default function Page() {
  const [mode, setMode] = useState<"compress" | "decompress">("compress");
  const [algo, setAlgo] = useState<"gzip" | "deflate" | "deflate-raw">("gzip");
  const [inSize, setInSize] = useState(0);
  const [outBlob, setOutBlob] = useState<{ url: string; size: number; name: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const run = async (f: File) => {
    setErr(""); setBusy(true); setOutBlob(null); setInSize(f.size);
    try {
      const stream = f.stream();
      const ts = mode === "compress" ? new CompressionStream(algo as any) : new DecompressionStream(algo as any);
      const buf = await streamThrough(stream, ts);
      const blob = new Blob([buf]);
      const name = mode === "compress" ? `${f.name}.${algo === "gzip" ? "gz" : "zz"}` : f.name.replace(/\.(gz|zz)$/, "");
      setOutBlob({ url: URL.createObjectURL(blob), size: blob.size, name });
    } catch (e: any) {
      setErr(e.message);
    } finally { setBusy(false); }
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-4">
        <div className="flex gap-3 flex-wrap">
          <div className="inline-flex rounded-md border border-neutral-700 overflow-hidden">
            <button className={`px-3 py-1.5 text-sm ${mode === "compress" ? "bg-neutral-700" : "bg-neutral-900"}`} onClick={() => setMode("compress")}>Compress</button>
            <button className={`px-3 py-1.5 text-sm ${mode === "decompress" ? "bg-neutral-700" : "bg-neutral-900"}`} onClick={() => setMode("decompress")}>Decompress</button>
          </div>
          <select className="field max-w-xs" value={algo} onChange={(e) => setAlgo(e.target.value as any)}>
            <option value="gzip">gzip</option>
            <option value="deflate">deflate</option>
            <option value="deflate-raw">deflate-raw</option>
          </select>
        </div>
        <input type="file" onChange={(e) => e.target.files?.[0] && run(e.target.files[0])} className="block text-sm" />
        {busy && <div className="ok">Working…</div>}
        {err && <div className="err">{err}</div>}
        {outBlob && (
          <div className="rounded-md border border-neutral-800 p-3 space-y-2">
            <div className="text-sm">In: {inSize.toLocaleString()} B → Out: {outBlob.size.toLocaleString()} B {mode === "compress" && `(${((1 - outBlob.size / inSize) * 100).toFixed(1)}% smaller)`}</div>
            <a href={outBlob.url} download={outBlob.name} className="btn">Download {outBlob.name}</a>
          </div>
        )}
      </div>
    </ToolShell>
  );
}
