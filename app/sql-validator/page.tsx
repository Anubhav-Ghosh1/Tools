"use client";

import { useEffect, useState } from "react";
import ToolShell from "@/components/ToolShell";
import CopyButton from "@/components/CopyButton";
import { bySlug } from "@/lib/tools";

const tool = bySlug("sql-validator")!;

const DIALECTS = ["MySQL", "PostgresQL", "SQLite", "TransactSQL", "BigQuery", "MariaDB"] as const;

export default function Page() {
  const [sql, setSql] = useState("SELECT id, name FROM users WHERE active = TRUE;");
  const [dialect, setDialect] = useState<(typeof DIALECTS)[number]>("MySQL");
  const [result, setResult] = useState<{ ok: boolean; msg: string; ast?: string }>({ ok: false, msg: "" });

  useEffect(() => {
    let active = true;
    if (!sql.trim()) { setResult({ ok: false, msg: "" }); return; }
    (async () => {
      try {
        const mod = await import("node-sql-parser");
        if (!active) return;
        const Parser = (mod as any).Parser;
        const p = new Parser();
        const ast = p.astify(sql, { database: dialect });
        setResult({ ok: true, msg: "Valid SQL", ast: JSON.stringify(ast, null, 2) });
      } catch (e: any) {
        if (active) setResult({ ok: false, msg: e.message || String(e) });
      }
    })();
    return () => { active = false; };
  }, [sql, dialect]);

  return (
    <ToolShell tool={tool}>
      <div className="space-y-4">
        <div className="flex items-end gap-3 flex-wrap">
          <div>
            <label className="label">Dialect</label>
            <select className="field" value={dialect} onChange={(e) => setDialect(e.target.value as any)}>
              {DIALECTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="label">SQL</label>
          <textarea className="field font-mono" rows={10} value={sql} onChange={(e) => setSql(e.target.value)} />
        </div>
        {sql && (result.ok ? <div className="ok">{result.msg}</div> : <div className="err whitespace-pre-wrap">{result.msg}</div>)}
        {result.ast && (
          <div>
            <div className="flex items-center justify-between">
              <label className="label">Parsed AST</label>
              <CopyButton value={result.ast} />
            </div>
            <pre className="field overflow-auto max-h-96 text-xs">{result.ast}</pre>
          </div>
        )}
      </div>
    </ToolShell>
  );
}
