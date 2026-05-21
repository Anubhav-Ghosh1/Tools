"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/components/ToolShell";
import CopyButton from "@/components/CopyButton";
import { bySlug } from "@/lib/tools";

const tool = bySlug("hex-text")!;

function textToHex(s: string) {
  const b = new TextEncoder().encode(s);
  return [...b].map((x) => x.toString(16).padStart(2, "0")).join(" ");
}

function hexToText(s: string) {
  const clean = s.replace(/0x/g, "").replace(/\s+/g, "");
  if (clean.length % 2) throw new Error("Hex length must be even");
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    const v = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
    if (Number.isNaN(v)) throw new Error("Invalid hex");
    out[i] = v;
  }
  return new TextDecoder().decode(out);
}

export default function Page() {
  const [mode, setMode] = useState<"toHex" | "toText">("toHex");
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    if (!input) return { output: "", error: "" };
    try {
      return { output: mode === "toHex" ? textToHex(input) : hexToText(input), error: "" };
    } catch (e: any) { return { output: "", error: e.message }; }
  }, [input, mode]);

  return (
    <ToolShell tool={tool}>
      <div className="inline-flex rounded-md border border-neutral-700 overflow-hidden mb-3">
        <button className={`px-3 py-1.5 text-sm ${mode === "toHex" ? "bg-neutral-700" : "bg-neutral-900"}`} onClick={() => setMode("toHex")}>Text → Hex</button>
        <button className={`px-3 py-1.5 text-sm ${mode === "toText" ? "bg-neutral-700" : "bg-neutral-900"}`} onClick={() => setMode("toText")}>Hex → Text</button>
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
