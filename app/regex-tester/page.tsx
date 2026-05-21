"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/components/ToolShell";
import { bySlug } from "@/lib/tools";

const tool = bySlug("regex-tester")!;

export default function Page() {
  const [pattern, setPattern] = useState("(\\w+)@(\\w+)");
  const [flags, setFlags] = useState("g");
  const [text, setText] = useState("contact alice@example.com or bob@example.org");

  const { highlighted, matches, error } = useMemo(() => {
    if (!pattern) return { highlighted: text, matches: [], error: "" };
    try {
      const re = new RegExp(pattern, flags.includes("g") ? flags : flags + "g");
      const ms: { match: string; index: number; groups: string[] }[] = [];
      let m: RegExpExecArray | null;
      while ((m = re.exec(text)) !== null) {
        ms.push({ match: m[0], index: m.index, groups: m.slice(1) });
        if (m[0].length === 0) re.lastIndex++;
      }
      let out = "", last = 0;
      for (const { match, index } of ms) {
        out += escapeHtml(text.slice(last, index));
        out += `<mark class="bg-emerald-600/40 text-emerald-100">${escapeHtml(match)}</mark>`;
        last = index + match.length;
      }
      out += escapeHtml(text.slice(last));
      return { highlighted: out, matches: ms, error: "" };
    } catch (e: any) {
      return { highlighted: escapeHtml(text), matches: [], error: e.message };
    }
  }, [pattern, flags, text]);

  return (
    <ToolShell tool={tool}>
      <div className="space-y-4">
        <div className="grid grid-cols-[1fr_8rem] gap-3">
          <div>
            <label className="label">Pattern</label>
            <input className="field font-mono" value={pattern} onChange={(e) => setPattern(e.target.value)} />
          </div>
          <div>
            <label className="label">Flags</label>
            <input className="field font-mono" value={flags} onChange={(e) => setFlags(e.target.value)} />
          </div>
        </div>
        {error && <div className="err">{error}</div>}
        <div>
          <label className="label">Text</label>
          <textarea className="field" rows={6} value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        <div>
          <label className="label">Highlighted</label>
          <pre className="field whitespace-pre-wrap break-words" dangerouslySetInnerHTML={{ __html: highlighted }} />
        </div>
        <div>
          <label className="label">Matches ({matches.length})</label>
          <div className="space-y-1 max-h-64 overflow-auto">
            {matches.map((m, i) => (
              <div key={i} className="rounded border border-neutral-800 bg-neutral-950 p-2 text-xs font-mono">
                <div>[{i}] @{m.index}: <span className="text-emerald-300">{m.match}</span></div>
                {m.groups.length > 0 && <div className="text-neutral-400">groups: {m.groups.map((g, j) => `$${j + 1}=${g}`).join(", ")}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolShell>
  );
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
