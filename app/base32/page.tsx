"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/components/ToolShell";
import CopyButton from "@/components/CopyButton";
import { bySlug } from "@/lib/tools";

const tool = bySlug("base32")!;
const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function encode(text: string) {
  const bytes = new TextEncoder().encode(text);
  let bits = 0, value = 0, out = "";
  for (const b of bytes) {
    value = (value << 8) | b;
    bits += 8;
    while (bits >= 5) {
      out += ALPHA[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += ALPHA[(value << (5 - bits)) & 31];
  while (out.length % 8) out += "=";
  return out;
}

function decode(text: string) {
  const s = text.toUpperCase().replace(/=+$/g, "").replace(/\s+/g, "");
  let bits = 0, value = 0;
  const out: number[] = [];
  for (const c of s) {
    const i = ALPHA.indexOf(c);
    if (i < 0) throw new Error(`Invalid char: ${c}`);
    value = (value << 5) | i;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return new TextDecoder().decode(new Uint8Array(out));
}

export default function Page() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    if (!input) return { output: "", error: "" };
    try {
      return { output: mode === "encode" ? encode(input) : decode(input), error: "" };
    } catch (e: any) {
      return { output: "", error: e.message };
    }
  }, [input, mode]);

  return (
    <ToolShell tool={tool}>
      <div className="inline-flex rounded-md border border-neutral-700 overflow-hidden mb-3">
        <button className={`px-3 py-1.5 text-sm ${mode === "encode" ? "bg-neutral-700" : "bg-neutral-900"}`} onClick={() => setMode("encode")}>Encode</button>
        <button className={`px-3 py-1.5 text-sm ${mode === "decode" ? "bg-neutral-700" : "bg-neutral-900"}`} onClick={() => setMode("decode")}>Decode</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Input</label>
          <textarea className="field" value={input} onChange={(e) => setInput(e.target.value)} />
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
