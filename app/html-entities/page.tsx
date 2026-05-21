"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/components/ToolShell";
import CopyButton from "@/components/CopyButton";
import { bySlug } from "@/lib/tools";

const tool = bySlug("html-entities")!;

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function unescapeHtml(s: string) {
  const doc = new DOMParser().parseFromString(s, "text/html");
  return doc.documentElement.textContent || "";
}

export default function Page() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("");

  const output = useMemo(() => {
    if (!input) return "";
    return mode === "encode" ? escapeHtml(input) : unescapeHtml(input);
  }, [input, mode]);

  return (
    <ToolShell tool={tool}>
      <div className="inline-flex rounded-md border border-neutral-700 overflow-hidden mb-3">
        <button className={`px-3 py-1.5 text-sm ${mode === "encode" ? "bg-neutral-700" : "bg-neutral-900"}`} onClick={() => setMode("encode")}>Escape</button>
        <button className={`px-3 py-1.5 text-sm ${mode === "decode" ? "bg-neutral-700" : "bg-neutral-900"}`} onClick={() => setMode("decode")}>Unescape</button>
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
        </div>
      </div>
    </ToolShell>
  );
}
