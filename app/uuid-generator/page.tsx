"use client";

import { useState } from "react";
import ToolShell from "@/components/ToolShell";
import CopyButton from "@/components/CopyButton";
import { bySlug } from "@/lib/tools";

const tool = bySlug("uuid-generator")!;

function uuidv4() {
  if (crypto.randomUUID) return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
}

export default function Page() {
  const [count, setCount] = useState(10);
  const [list, setList] = useState<string[]>([uuidv4()]);

  const gen = () => setList(Array.from({ length: count }, () => uuidv4()));

  return (
    <ToolShell tool={tool}>
      <div className="space-y-4">
        <div className="flex items-end gap-3 flex-wrap">
          <div>
            <label className="label">Count</label>
            <input type="number" className="field w-32" min={1} max={1000} value={count} onChange={(e) => setCount(Math.max(1, Math.min(1000, Number(e.target.value) || 1)))} />
          </div>
          <button className="btn-primary" onClick={gen}>Generate</button>
          <CopyButton value={list.join("\n")} label="Copy all" />
        </div>
        <pre className="field whitespace-pre-wrap break-all max-h-96 overflow-auto">{list.join("\n")}</pre>
      </div>
    </ToolShell>
  );
}
