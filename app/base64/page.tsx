"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/components/ToolShell";
import CopyButton from "@/components/CopyButton";
import { bySlug } from "@/lib/tools";

const tool = bySlug("base64")!;

function encode(text: string, urlSafe: boolean) {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  let out = btoa(bin);
  if (urlSafe) out = out.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  return out;
}

function decode(text: string, urlSafe: boolean) {
  let s = text.trim();
  if (urlSafe) s = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = s.length % 4;
  if (pad) s += "=".repeat(4 - pad);
  const bin = atob(s);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export default function Page() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("");
  const [urlSafe, setUrlSafe] = useState(false);

  const { output, error } = useMemo(() => {
    if (!input) return { output: "", error: "" };
    try {
      return { output: mode === "encode" ? encode(input, urlSafe) : decode(input, urlSafe), error: "" };
    } catch (e: any) {
      return { output: "", error: e.message || "Invalid input" };
    }
  }, [input, mode, urlSafe]);

  return (
    <ToolShell tool={tool}>
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <div className="inline-flex rounded-md border border-neutral-700 overflow-hidden">
          <button className={`px-3 py-1.5 text-sm ${mode === "encode" ? "bg-neutral-700" : "bg-neutral-900"}`} onClick={() => setMode("encode")}>Encode</button>
          <button className={`px-3 py-1.5 text-sm ${mode === "decode" ? "bg-neutral-700" : "bg-neutral-900"}`} onClick={() => setMode("decode")}>Decode</button>
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-neutral-300">
          <input type="checkbox" checked={urlSafe} onChange={(e) => setUrlSafe(e.target.checked)} />
          URL-safe
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Input</label>
          <textarea className="field" value={input} onChange={(e) => setInput(e.target.value)} placeholder={mode === "encode" ? "Plain text…" : "Base64…"} />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="label">Output</label>
            <CopyButton value={output} />
          </div>
          <textarea className="field" value={output} readOnly />
          {error && <div className="err mt-2">{error}</div>}
        </div>
      </div>
    </ToolShell>
  );
}
