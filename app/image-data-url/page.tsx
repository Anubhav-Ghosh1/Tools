"use client";

import { useState } from "react";
import ToolShell from "@/components/ToolShell";
import CopyButton from "@/components/CopyButton";
import { bySlug } from "@/lib/tools";

const tool = bySlug("image-data-url")!;

export default function Page() {
  const [dataUrl, setDataUrl] = useState("");
  const [err, setErr] = useState("");

  const onFile = (f: File) => {
    setErr("");
    const r = new FileReader();
    r.onload = () => setDataUrl(String(r.result || ""));
    r.onerror = () => setErr("Failed to read file");
    r.readAsDataURL(f);
  };

  const isImg = dataUrl.startsWith("data:image/");

  return (
    <ToolShell tool={tool}>
      <div className="space-y-4">
        <label className="block rounded-md border-2 border-dashed border-neutral-700 p-6 text-center cursor-pointer hover:border-neutral-500"
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f) onFile(f);
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
            }}
          />
          <div className="text-sm text-neutral-400">Drop an image or click to choose</div>
        </label>
        <div>
          <div className="flex items-center justify-between">
            <label className="label">Data URL</label>
            <CopyButton value={dataUrl} />
          </div>
          <textarea className="field" rows={6} value={dataUrl} onChange={(e) => setDataUrl(e.target.value)} placeholder="data:image/png;base64,…" />
        </div>
        {err && <div className="err">{err}</div>}
        {isImg && (
          <div>
            <label className="label">Preview</label>
            <div className="rounded-md border border-neutral-800 bg-neutral-950 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={dataUrl} alt="preview" className="max-w-full max-h-96 mx-auto" />
            </div>
          </div>
        )}
      </div>
    </ToolShell>
  );
}
