"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/components/ToolShell";
import CopyButton from "@/components/CopyButton";
import { bySlug } from "@/lib/tools";

const tool = bySlug("case-converter")!;

function words(s: string): string[] {
  return s
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_\-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.toLowerCase());
}

const CASES = {
  camelCase: (s: string) => words(s).map((w, i) => i ? w[0].toUpperCase() + w.slice(1) : w).join(""),
  PascalCase: (s: string) => words(s).map((w) => w[0].toUpperCase() + w.slice(1)).join(""),
  snake_case: (s: string) => words(s).join("_"),
  "kebab-case": (s: string) => words(s).join("-"),
  CONSTANT_CASE: (s: string) => words(s).map((w) => w.toUpperCase()).join("_"),
  "dot.case": (s: string) => words(s).join("."),
  "Title Case": (s: string) => words(s).map((w) => w[0].toUpperCase() + w.slice(1)).join(" "),
  lowercase: (s: string) => s.toLowerCase(),
  UPPERCASE: (s: string) => s.toUpperCase(),
};

export default function Page() {
  const [text, setText] = useState("Hello world example");
  const results = useMemo(() => Object.entries(CASES).map(([k, fn]) => [k, fn(text)] as const), [text]);

  return (
    <ToolShell tool={tool}>
      <div className="space-y-4">
        <div>
          <label className="label">Input</label>
          <textarea className="field" value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {results.map(([k, v]) => (
            <div key={k}>
              <div className="flex items-center justify-between">
                <label className="label">{k}</label>
                <CopyButton value={v} />
              </div>
              <div className="field font-mono break-all">{v}</div>
            </div>
          ))}
        </div>
      </div>
    </ToolShell>
  );
}
