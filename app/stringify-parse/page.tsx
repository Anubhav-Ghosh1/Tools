"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/components/ToolShell";
import CopyButton from "@/components/CopyButton";
import { bySlug } from "@/lib/tools";

const tool = bySlug("stringify-parse")!;

export default function Page() {
  const [mode, setMode] = useState<"stringify" | "parse">("stringify");
  const [quote, setQuote] = useState<'"' | "'" | "`">('"');
  const [input, setInput] = useState("");

  const { out, err } = useMemo(() => {
    if (!input) return { out: "", err: "" };
    try {
      if (mode === "stringify") {
        const json = JSON.stringify(input);
        if (quote === '"') return { out: json, err: "" };
        const inner = json.slice(1, -1).replace(new RegExp("\\\\\"", "g"), '"');
        const escaped = inner.replace(new RegExp(quote, "g"), "\\" + quote);
        return { out: quote + escaped + quote, err: "" };
      }
      const s = input.trim();
      const first = s[0], last = s[s.length - 1];
      if (first !== last || !["\"", "'", "`"].includes(first)) throw new Error("Input must be a quoted string");
      const jsonish = '"' + s.slice(1, -1).replace(/\\./g, (m) => m === "\\'" || m === "\\`" ? m[1] : m).replace(/"/g, '\\"') + '"';
      return { out: JSON.parse(jsonish), err: "" };
    } catch (e: any) {
      return { out: "", err: e.message };
    }
  }, [input, mode, quote]);

  return (
    <ToolShell tool={tool}>
      <div className="space-y-4">
        <div className="flex gap-3 flex-wrap">
          <div className="inline-flex rounded-md border border-neutral-700 overflow-hidden">
            <button className={`px-3 py-1.5 text-sm ${mode === "stringify" ? "bg-neutral-700" : "bg-neutral-900"}`} onClick={() => setMode("stringify")}>Stringify</button>
            <button className={`px-3 py-1.5 text-sm ${mode === "parse" ? "bg-neutral-700" : "bg-neutral-900"}`} onClick={() => setMode("parse")}>Parse</button>
          </div>
          {mode === "stringify" && (
            <select className="field max-w-[8rem]" value={quote} onChange={(e) => setQuote(e.target.value as any)}>
              <option value={'"'}>Double "</option>
              <option value={"'"}>Single '</option>
              <option value={"`"}>Backtick `</option>
            </select>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Input</label>
            <textarea className="field" rows={12} value={input} onChange={(e) => setInput(e.target.value)} />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="label">Output</label>
              <CopyButton value={out} />
            </div>
            <textarea className="field" rows={12} value={out} readOnly />
            {err && <div className="err mt-2">{err}</div>}
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
