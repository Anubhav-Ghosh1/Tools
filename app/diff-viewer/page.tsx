"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/components/ToolShell";
import { bySlug } from "@/lib/tools";

const tool = bySlug("diff-viewer")!;

type Op = { type: "ctx" | "add" | "del"; text: string };

function diff(a: string, b: string): Op[] {
  const A = a.split("\n"), B = b.split("\n");
  const n = A.length, m = B.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const ops: Op[] = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (A[i] === B[j]) { ops.push({ type: "ctx", text: A[i] }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { ops.push({ type: "del", text: A[i] }); i++; }
    else { ops.push({ type: "add", text: B[j] }); j++; }
  }
  while (i < n) ops.push({ type: "del", text: A[i++] });
  while (j < m) ops.push({ type: "add", text: B[j++] });
  return ops;
}

export default function Page() {
  const [a, setA] = useState("foo\nbar\nbaz");
  const [b, setB] = useState("foo\nqux\nbaz\nnew");
  const ops = useMemo(() => diff(a, b), [a, b]);

  return (
    <ToolShell tool={tool}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Original</label>
            <textarea className="field" rows={10} value={a} onChange={(e) => setA(e.target.value)} />
          </div>
          <div>
            <label className="label">Changed</label>
            <textarea className="field" rows={10} value={b} onChange={(e) => setB(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">Diff</label>
          <pre className="rounded-md border border-neutral-800 bg-neutral-950 p-3 text-sm font-mono overflow-auto">
{ops.map((op, i) => (
  <div key={i} className={op.type === "add" ? "bg-emerald-950/60 text-emerald-300" : op.type === "del" ? "bg-red-950/60 text-red-300" : "text-neutral-400"}>
    {op.type === "add" ? "+ " : op.type === "del" ? "- " : "  "}{op.text}
  </div>
))}
          </pre>
        </div>
      </div>
    </ToolShell>
  );
}
