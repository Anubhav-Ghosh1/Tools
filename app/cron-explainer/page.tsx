"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/components/ToolShell";
import { bySlug } from "@/lib/tools";

const tool = bySlug("cron-explainer")!;

const NAMES = ["minute", "hour", "day of month", "month", "day of week"] as const;
const MONTHS = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DOWS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function explainPart(part: string, idx: number): string {
  const name = NAMES[idx];
  if (part === "*") return `every ${name}`;
  if (part.startsWith("*/")) return `every ${part.slice(2)} ${name}${Number(part.slice(2)) > 1 ? "s" : ""}`;
  if (part.includes(",")) return `${name} in {${part}}`;
  if (part.includes("-")) return `${name} from ${part.replace("-", " to ")}`;
  if (idx === 3 && /^\d+$/.test(part)) return `in ${MONTHS[Number(part)] || part}`;
  if (idx === 4 && /^\d+$/.test(part)) return `on ${DOWS[Number(part) % 7] || part}`;
  return `${name} = ${part}`;
}

function explain(expr: string): string {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return "Cron must have 5 fields: minute hour day-of-month month day-of-week";
  return parts.map(explainPart).join(", ");
}

const PRESETS = [
  ["* * * * *", "Every minute"],
  ["*/5 * * * *", "Every 5 minutes"],
  ["0 * * * *", "Hourly"],
  ["0 0 * * *", "Daily at midnight"],
  ["0 9 * * 1-5", "Weekdays at 9am"],
  ["0 0 1 * *", "First of month"],
  ["0 0 * * 0", "Weekly on Sunday"],
];

export default function Page() {
  const [expr, setExpr] = useState("0 9 * * 1-5");
  const out = useMemo(() => explain(expr), [expr]);

  return (
    <ToolShell tool={tool}>
      <div className="space-y-4 max-w-2xl">
        <div>
          <label className="label">Cron expression</label>
          <input className="field font-mono" value={expr} onChange={(e) => setExpr(e.target.value)} />
        </div>
        <div className="ok">{out}</div>
        <div>
          <label className="label">Presets</label>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(([e, l]) => (
              <button key={e} className="btn text-xs" onClick={() => setExpr(e)} title={l}>
                <span className="font-mono">{e}</span> · {l}
              </button>
            ))}
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
