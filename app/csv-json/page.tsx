"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/components/ToolShell";
import CopyButton from "@/components/CopyButton";
import { bySlug } from "@/lib/tools";

const tool = bySlug("csv-json")!;

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') {
        if (text[i + 1] === '"') { cur += '"'; i++; }
        else q = false;
      } else cur += c;
    } else {
      if (c === '"') q = true;
      else if (c === ",") { row.push(cur); cur = ""; }
      else if (c === "\r") continue;
      else if (c === "\n") { row.push(cur); rows.push(row); row = []; cur = ""; }
      else cur += c;
    }
  }
  if (cur.length || row.length) { row.push(cur); rows.push(row); }
  return rows.filter((r) => r.length > 1 || (r[0] && r[0].length));
}

function toCSV(arr: any[]): string {
  if (!Array.isArray(arr) || !arr.length) return "";
  const keys = Array.from(new Set(arr.flatMap((o) => Object.keys(o))));
  const esc = (v: any) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [keys.join(","), ...arr.map((o) => keys.map((k) => esc(o[k])).join(","))].join("\n");
}

export default function Page() {
  const [mode, setMode] = useState<"c2j" | "j2c">("c2j");
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    if (!input) return { output: "", error: "" };
    try {
      if (mode === "c2j") {
        const rows = parseCSV(input);
        if (!rows.length) return { output: "[]", error: "" };
        const [head, ...rest] = rows;
        const arr = rest.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ""])));
        return { output: JSON.stringify(arr, null, 2), error: "" };
      }
      const arr = JSON.parse(input);
      return { output: toCSV(arr), error: "" };
    } catch (e: any) {
      return { output: "", error: e.message };
    }
  }, [input, mode]);

  return (
    <ToolShell tool={tool}>
      <div className="inline-flex rounded-md border border-neutral-700 overflow-hidden mb-3">
        <button className={`px-3 py-1.5 text-sm ${mode === "c2j" ? "bg-neutral-700" : "bg-neutral-900"}`} onClick={() => setMode("c2j")}>CSV → JSON</button>
        <button className={`px-3 py-1.5 text-sm ${mode === "j2c" ? "bg-neutral-700" : "bg-neutral-900"}`} onClick={() => setMode("j2c")}>JSON → CSV</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Input</label>
          <textarea className="field" rows={16} value={input} onChange={(e) => setInput(e.target.value)} />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="label">Output</label>
            <CopyButton value={output} />
          </div>
          <textarea className="field" rows={16} value={output} readOnly />
        </div>
      </div>
      {error && <div className="err mt-3">{error}</div>}
    </ToolShell>
  );
}
