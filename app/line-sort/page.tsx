"use client";
import { useMemo, useState } from "react";
import ToolShell from "@/components/ToolShell";
import CopyButton from "@/components/CopyButton";
import { bySlug } from "@/lib/tools";

const tool = bySlug("line-sort")!;

type SortMode = "none" | "alpha" | "alpha-desc" | "length" | "length-desc" | "shuffle";

export default function Page() {
  const [input, setInput] = useState("");
  const [sort, setSort] = useState<SortMode>("none");
  const [dedupe, setDedupe] = useState(false);
  const [trim, setTrim] = useState(false);
  const [removeEmpty, setRemoveEmpty] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [reverse, setReverse] = useState(false);

  const output = useMemo(() => {
    let lines = input.split("\n");
    if (trim) lines = lines.map((l) => l.trim());
    if (removeEmpty) lines = lines.filter((l) => l.length > 0);
    if (dedupe) {
      const seen = new Set<string>();
      lines = lines.filter((l) => {
        const k = caseSensitive ? l : l.toLowerCase();
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
    }
    const cmp = (a: string, b: string) => (caseSensitive ? a.localeCompare(b) : a.toLowerCase().localeCompare(b.toLowerCase()));
    if (sort === "alpha") lines = [...lines].sort(cmp);
    else if (sort === "alpha-desc") lines = [...lines].sort((a, b) => cmp(b, a));
    else if (sort === "length") lines = [...lines].sort((a, b) => a.length - b.length);
    else if (sort === "length-desc") lines = [...lines].sort((a, b) => b.length - a.length);
    else if (sort === "shuffle") lines = [...lines].sort(() => Math.random() - 0.5);
    if (reverse) lines = [...lines].reverse();
    return lines.join("\n");
  }, [input, sort, dedupe, trim, removeEmpty, caseSensitive, reverse]);

  const outLineCount = output ? output.split("\n").filter((l) => removeEmpty ? l : true).length : 0;

  return (
    <ToolShell tool={tool}>
      <div className="space-y-4">
        <div className="panel flex flex-wrap gap-x-6 gap-y-3">
          <div>
            <label className="label">Sort</label>
            <select className="field py-1.5 w-44 text-xs" value={sort} onChange={(e) => setSort(e.target.value as SortMode)}>
              <option value="none">No sort</option>
              <option value="alpha">A → Z</option>
              <option value="alpha-desc">Z → A</option>
              <option value="length">Shortest first</option>
              <option value="length-desc">Longest first</option>
              <option value="shuffle">Shuffle</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 items-end">
            {([
              ["dedupe", "Remove duplicates", dedupe, setDedupe],
              ["trim", "Trim whitespace", trim, setTrim],
              ["removeEmpty", "Remove empty lines", removeEmpty, setRemoveEmpty],
              ["reverse", "Reverse order", reverse, setReverse],
              ["caseSensitive", "Case sensitive", caseSensitive, setCaseSensitive],
            ] as const).map(([key, label, val, setter]) => (
              <label key={key} className="inline-flex items-center gap-2 text-xs cursor-pointer">
                <input type="checkbox" checked={val} onChange={(e) => (setter as (v: boolean) => void)(e.target.checked)} className="rounded" />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label">Input</label>
            </div>
            <textarea className="field" rows={14} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste lines of text…" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label">Output ({outLineCount} lines)</label>
              <CopyButton value={output} />
            </div>
            <textarea className="field" rows={14} value={output} readOnly />
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
