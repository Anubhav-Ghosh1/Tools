"use client";
import { useMemo, useState } from "react";
import ToolShell from "@/components/ToolShell";
import CopyButton from "@/components/CopyButton";
import { bySlug } from "@/lib/tools";

const tool = bySlug("markdown-table")!;

type Align = "left" | "center" | "right" | "none";

const SEP: Record<Align, string> = {
  left: ":---", center: ":---:", right: "---:", none: "---",
};

function makeTable(headers: string[], rows: string[][], aligns: Align[]): string {
  const cols = headers.length;
  const colWidth = (i: number) => Math.max(
    headers[i]?.length ?? 3,
    ...rows.map((r) => (r[i] ?? "").length),
    3
  );

  const pad = (s: string, w: number) => s + " ".repeat(Math.max(0, w - s.length));
  const headerRow = "| " + headers.map((h, i) => pad(h, colWidth(i))).join(" | ") + " |";
  const sepRow = "| " + aligns.map((a, i) => {
    const w = colWidth(i);
    const base = SEP[a];
    return base.length < w ? base.slice(0, -1) + "-".repeat(w - base.length + 1) + base.slice(-1) : base;
  }).join(" | ") + " |";
  const dataRows = rows.map((r) =>
    "| " + Array.from({ length: cols }, (_, i) => pad(r[i] ?? "", colWidth(i))).join(" | ") + " |"
  );
  return [headerRow, sepRow, ...dataRows].join("\n");
}

export default function Page() {
  const [headers, setHeaders] = useState(["Name", "Role", "Email"]);
  const [aligns, setAligns] = useState<Align[]>(["left", "center", "left"]);
  const [rows, setRows] = useState([
    ["Alice", "Admin", "alice@example.com"],
    ["Bob", "Editor", "bob@example.com"],
    ["Charlie", "Viewer", "charlie@example.com"],
  ]);

  const md = useMemo(() => makeTable(headers, rows, aligns), [headers, rows, aligns]);

  function setCell(ri: number, ci: number, val: string) {
    setRows((r) => r.map((row, i) => i === ri ? row.map((c, j) => j === ci ? val : c) : row));
  }
  function setHeader(ci: number, val: string) {
    setHeaders((h) => h.map((v, i) => i === ci ? val : v));
  }
  function addCol() {
    setHeaders((h) => [...h, `Col ${h.length + 1}`]);
    setAligns((a) => [...a, "left"]);
    setRows((r) => r.map((row) => [...row, ""]));
  }
  function removeCol(ci: number) {
    if (headers.length <= 1) return;
    setHeaders((h) => h.filter((_, i) => i !== ci));
    setAligns((a) => a.filter((_, i) => i !== ci));
    setRows((r) => r.map((row) => row.filter((_, i) => i !== ci)));
  }
  function addRow() {
    setRows((r) => [...r, Array(headers.length).fill("")]);
  }
  function removeRow(ri: number) {
    setRows((r) => r.filter((_, i) => i !== ri));
  }

  const ALIGN_ICONS: Record<Align, string> = { left: "←", center: "↔", right: "→", none: "—" };
  const ALIGN_CYCLE: Record<Align, Align> = { none: "left", left: "center", center: "right", right: "none" };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-5">
        <div className="overflow-x-auto">
          <table className="border-collapse text-sm">
            <thead>
              <tr>
                {headers.map((h, ci) => (
                  <th key={ci} className="border border-neutral-700 bg-neutral-900 px-1 pb-1 min-w-[120px]">
                    <div className="flex items-center gap-1">
                      <input
                        className="bg-transparent outline-none w-full px-1 py-1 font-medium text-sm"
                        value={h}
                        onChange={(e) => setHeader(ci, e.target.value)}
                        placeholder={`Col ${ci + 1}`}
                      />
                      <button onClick={() => setAligns((a) => a.map((v, i) => i === ci ? ALIGN_CYCLE[v] : v))}
                        className="text-neutral-500 hover:text-neutral-200 transition shrink-0 text-xs px-1" title="Toggle alignment">
                        {ALIGN_ICONS[aligns[ci]]}
                      </button>
                      <button onClick={() => removeCol(ci)} className="text-neutral-700 hover:text-red-400 transition shrink-0 text-xs">×</button>
                    </div>
                  </th>
                ))}
                <th className="border border-neutral-700 bg-neutral-900 px-2">
                  <button onClick={addCol} className="text-neutral-500 hover:text-emerald-400 transition text-lg leading-none">+</button>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="border border-neutral-800 px-1">
                      <input
                        className="bg-transparent outline-none w-full px-1 py-1 text-sm font-mono"
                        value={cell}
                        onChange={(e) => setCell(ri, ci, e.target.value)}
                        placeholder="—"
                      />
                    </td>
                  ))}
                  <td className="border border-neutral-800 px-2 text-center">
                    <button onClick={() => removeRow(ri)} className="text-neutral-700 hover:text-red-400 transition text-xs">×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button onClick={addRow} className="btn text-xs">+ Add row</button>

        <div>
          <div className="flex items-center justify-between">
            <label className="label">Markdown output</label>
            <CopyButton value={md} />
          </div>
          <textarea className="field font-mono text-xs" rows={Math.min(16, rows.length + 3)} value={md} readOnly />
        </div>
      </div>
    </ToolShell>
  );
}
