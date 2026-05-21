"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/components/ToolShell";
import CopyButton from "@/components/CopyButton";
import { bySlug } from "@/lib/tools";

const tool = bySlug("url-encode")!;

export default function Page() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [component, setComponent] = useState(true);
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    if (!input) return { output: "", error: "" };
    try {
      if (mode === "encode") {
        return { output: component ? encodeURIComponent(input) : encodeURI(input), error: "" };
      }
      return { output: component ? decodeURIComponent(input) : decodeURI(input), error: "" };
    } catch (e: any) {
      return { output: "", error: e.message };
    }
  }, [input, mode, component]);

  return (
    <ToolShell tool={tool}>
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <div className="inline-flex rounded-md border border-neutral-700 overflow-hidden">
          <button className={`px-3 py-1.5 text-sm ${mode === "encode" ? "bg-neutral-700" : "bg-neutral-900"}`} onClick={() => setMode("encode")}>Encode</button>
          <button className={`px-3 py-1.5 text-sm ${mode === "decode" ? "bg-neutral-700" : "bg-neutral-900"}`} onClick={() => setMode("decode")}>Decode</button>
        </div>
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={component} onChange={(e) => setComponent(e.target.checked)} />
          Component (encodeURIComponent)
        </label>
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
