"use client";
import { useMemo, useState } from "react";
import ToolShell from "@/components/ToolShell";
import CopyButton from "@/components/CopyButton";
import { bySlug } from "@/lib/tools";

const tool = bySlug("html-formatter")!;

const VOID = new Set(["area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"]);
const INLINE = new Set(["a","abbr","acronym","b","bdo","big","br","cite","code","dfn","em","i","img","input","kbd","label","map","object","output","q","samp","select","small","span","strong","sub","sup","textarea","time","tt","var"]);
const PRE = new Set(["pre","script","style","textarea"]);

function formatHTML(html: string, indent = 2): string {
  const I = " ".repeat(indent);
  let level = 0;
  const lines: string[] = [];
  const tokens = html.match(/<!--[\s\S]*?-->|<[^>]+>|[^<]+/g) ?? [];
  let inPre = false;

  for (const tok of tokens) {
    const text = tok.trim();
    if (!text) continue;

    if (tok.startsWith("<!--")) {
      lines.push(I.repeat(level) + tok.trim()); continue;
    }
    if (!tok.startsWith("<")) {
      lines.push(I.repeat(level) + text); continue;
    }
    const tagMatch = tok.match(/^<\/?([a-zA-Z][^\s>/]*)/);
    const tag = tagMatch ? tagMatch[1].toLowerCase() : "";
    const isClose = tok.startsWith("</");
    const isSelf = tok.endsWith("/>") || VOID.has(tag);

    if (PRE.has(tag)) inPre = isClose ? false : !isClose;

    if (inPre) { lines.push(I.repeat(level) + tok); continue; }

    if (isClose && !isSelf) level = Math.max(0, level - 1);
    if (!INLINE.has(tag)) lines.push(I.repeat(level) + tok.trim());
    else lines[lines.length - 1] = (lines[lines.length - 1] ?? "") + tok.trim();
    if (!isClose && !isSelf && !INLINE.has(tag)) level++;
  }
  return lines.join("\n");
}

function minifyHTML(html: string): string {
  return html
    .replace(/<!--(?![\s\S]*?-->)[\s\S]*?-->/g, "")
    .replace(/\s+/g, " ")
    .replace(/>\s+</g, "><")
    .replace(/\s+(\/?>)/g, "$1")
    .replace(/(<[a-z][^>]*)\s+>/gi, "$1>")
    .trim();
}

const SAMPLE = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Hello</title></head>
<body>
<div class="container"><h1>Hello, World!</h1><p>This is <strong>bold</strong> and <em>italic</em> text.</p><ul><li>Item one</li><li>Item two</li></ul></div>
</body>
</html>`;

export default function Page() {
  const [input, setInput] = useState(SAMPLE);
  const [mode, setMode] = useState<"format" | "minify">("format");
  const [indent, setIndent] = useState(2);

  const output = useMemo(() => {
    if (!input.trim()) return "";
    return mode === "format" ? formatHTML(input, indent) : minifyHTML(input);
  }, [input, mode, indent]);

  return (
    <ToolShell tool={tool}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-lg border border-neutral-700 overflow-hidden text-xs">
            {(["format", "minify"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)} className={`px-4 py-1.5 font-medium capitalize transition ${mode === m ? "bg-emerald-600 text-white" : "text-neutral-400 hover:bg-neutral-800"}`}>{m}</button>
            ))}
          </div>
          {mode === "format" && (
            <div className="flex items-center gap-2">
              <label className="label pb-0 min-h-0 text-xs">Indent</label>
              <div className="flex rounded-lg border border-neutral-700 overflow-hidden text-xs">
                {[2, 4].map((n) => (
                  <button key={n} onClick={() => setIndent(n)} className={`px-3 py-1.5 font-mono font-medium transition ${indent === n ? "bg-neutral-700 text-white" : "text-neutral-400 hover:bg-neutral-800"}`}>{n}</button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Input HTML</label>
            <textarea className="field text-xs" rows={18} value={input} onChange={(e) => setInput(e.target.value)} />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="label">Output</label>
              <CopyButton value={output} />
            </div>
            <textarea className="field text-xs" rows={18} value={output} readOnly />
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
