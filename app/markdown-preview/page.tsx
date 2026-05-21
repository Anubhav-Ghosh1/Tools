"use client";

import { useEffect, useState } from "react";
import ToolShell from "@/components/ToolShell";
import CopyButton from "@/components/CopyButton";
import { bySlug } from "@/lib/tools";

const tool = bySlug("markdown-preview")!;

const SAMPLE = `# Hello\n\n**Markdown** preview — GFM tables, lists, code, *emphasis*.\n\n- one\n- two\n- three\n\n\`\`\`js\nconst x = 1;\n\`\`\`\n`;

export default function Page() {
  const [src, setSrc] = useState(SAMPLE);
  const [html, setHtml] = useState("");
  const [showHtml, setShowHtml] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const { marked } = await import("marked");
      marked.setOptions({ gfm: true, breaks: false });
      const out = await marked.parse(src);
      if (active) setHtml(out as string);
    })();
    return () => { active = false; };
  }, [src]);

  return (
    <ToolShell tool={tool}>
      <div className="space-y-3">
        <div className="flex gap-2 flex-wrap items-center">
          <button className="btn" onClick={() => setShowHtml((s) => !s)}>{showHtml ? "Show preview" : "Show HTML"}</button>
          <CopyButton value={html} label="Copy HTML" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Markdown</label>
            <textarea className="field" rows={20} value={src} onChange={(e) => setSrc(e.target.value)} />
          </div>
          <div>
            <label className="label">{showHtml ? "HTML" : "Preview"}</label>
            {showHtml ? (
              <textarea className="field" rows={20} value={html} readOnly />
            ) : (
              <div className="rounded-md border border-neutral-800 bg-neutral-950 p-4 prose prose-invert max-w-none overflow-auto" style={{ height: "32rem" }} dangerouslySetInnerHTML={{ __html: html }} />
            )}
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
