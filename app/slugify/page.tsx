"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/components/ToolShell";
import CopyButton from "@/components/CopyButton";
import { bySlug } from "@/lib/tools";

const tool = bySlug("slugify")!;

function slugify(s: string, sep: string) {
  return s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, sep)
    .replace(new RegExp(`^${sep}|${sep}$`, "g"), "");
}

export default function Page() {
  const [text, setText] = useState("Hello, World! Café résumé 2025");
  const [sep, setSep] = useState("-");
  const out = useMemo(() => slugify(text, sep), [text, sep]);

  return (
    <ToolShell tool={tool}>
      <div className="space-y-4 max-w-2xl">
        <div>
          <label className="label">Input</label>
          <textarea className="field" value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        <div>
          <label className="label">Separator</label>
          <input className="field w-24" value={sep} onChange={(e) => setSep(e.target.value || "-")} />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="label">Slug</label>
            <CopyButton value={out} />
          </div>
          <div className="field font-mono break-all">{out}</div>
        </div>
      </div>
    </ToolShell>
  );
}
