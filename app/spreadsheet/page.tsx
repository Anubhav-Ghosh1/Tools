"use client";

import { useState } from "react";
import ToolShell from "@/components/ToolShell";
import { bySlug } from "@/lib/tools";

const tool = bySlug("spreadsheet")!;

export default function Page() {
  const [wb, setWb] = useState<any>(null);
  const [sheets, setSheets] = useState<string[]>([]);
  const [active, setActive] = useState("");
  const [rows, setRows] = useState<any[][]>([]);
  const [hasHeader, setHasHeader] = useState(true);
  const [err, setErr] = useState("");

  const load = async (f: File) => {
    setErr("");
    try {
      const XLSX: any = await import("xlsx");
      const buf = await f.arrayBuffer();
      const wb2 = XLSX.read(buf, { type: "array" });
      setWb(wb2);
      setSheets(wb2.SheetNames);
      setActive(wb2.SheetNames[0]);
      const sheet = wb2.Sheets[wb2.SheetNames[0]];
      setRows(XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][]);
    } catch (e: any) { setErr(e.message); }
  };

  const switchSheet = async (name: string) => {
    setActive(name);
    const XLSX: any = await import("xlsx");
    setRows(XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1 }) as any[][]);
  };

  const exportAs = async (fmt: "csv" | "tsv" | "json" | "xlsx" | "html") => {
    const XLSX: any = await import("xlsx");
    const sheet = wb.Sheets[active];
    let blob: Blob, name = `${active}.${fmt}`;
    if (fmt === "csv") blob = new Blob([XLSX.utils.sheet_to_csv(sheet)], { type: "text/csv" });
    else if (fmt === "tsv") blob = new Blob([XLSX.utils.sheet_to_csv(sheet, { FS: "\t" })], { type: "text/tab-separated-values" });
    else if (fmt === "json") {
      const data = hasHeader ? XLSX.utils.sheet_to_json(sheet) : XLSX.utils.sheet_to_json(sheet, { header: 1 });
      blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    } else if (fmt === "html") blob = new Blob([XLSX.utils.sheet_to_html(sheet)], { type: "text/html" });
    else {
      const wbNew = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wbNew, sheet, active);
      const out = XLSX.write(wbNew, { type: "array", bookType: "xlsx" });
      blob = new Blob([out], { type: "application/octet-stream" });
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  };

  const header = hasHeader && rows[0] ? rows[0] : null;
  const body = hasHeader && rows[0] ? rows.slice(1) : rows;

  return (
    <ToolShell tool={tool}>
      <div className="space-y-4">
        <input type="file" accept=".csv,.tsv,.xlsx,.xls" onChange={(e) => e.target.files?.[0] && load(e.target.files[0])} className="block text-sm" />
        {err && <div className="err">{err}</div>}
        {sheets.length > 0 && (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="label">Sheet</label>
                <select className="field" value={active} onChange={(e) => switchSheet(e.target.value)}>
                  {sheets.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={hasHeader} onChange={(e) => setHasHeader(e.target.checked)} />
                First row is header
              </label>
            </div>
            <div className="flex gap-2 flex-wrap">
              {(["csv", "tsv", "json", "xlsx", "html"] as const).map((f) => (
                <button key={f} className="btn" onClick={() => exportAs(f)}>Export {f.toUpperCase()}</button>
              ))}
            </div>
            <div className="overflow-auto border border-neutral-800 rounded-md max-h-96">
              <table className="text-sm w-full">
                {header && <thead className="bg-neutral-900 sticky top-0"><tr>{header.map((h, i) => <th key={i} className="text-left p-2 border-b border-neutral-800 font-medium">{String(h)}</th>)}</tr></thead>}
                <tbody>
                  {body.slice(0, 200).map((r, i) => (
                    <tr key={i} className="even:bg-neutral-900/40">
                      {r.map((c, j) => <td key={j} className="p-2 border-b border-neutral-800/50">{c == null ? "" : String(c)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {body.length > 200 && <div className="text-xs text-neutral-500">Showing first 200 rows of {body.length}</div>}
          </>
        )}
      </div>
    </ToolShell>
  );
}
