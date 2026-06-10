"use client";
import { useMemo, useState } from "react";
import ToolShell from "@/components/ToolShell";
import CopyButton from "@/components/CopyButton";
import { bySlug } from "@/lib/tools";

const tool = bySlug("date-calculator")!;

function today() { return new Date().toISOString().slice(0, 10); }

function diffDates(a: Date, b: Date) {
  const msPerDay = 86400000;
  const diffMs = Math.abs(b.getTime() - a.getTime());
  const days = Math.floor(diffMs / msPerDay);
  const weeks = Math.floor(days / 7);
  const months = Math.abs((b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()));
  const years = Math.abs(b.getFullYear() - a.getFullYear());
  const hours = Math.floor(diffMs / 3600000);
  const minutes = Math.floor(diffMs / 60000);
  return { days, weeks, months, years, hours, minutes };
}

function addDuration(date: Date, unit: string, amount: number): Date {
  const d = new Date(date);
  switch (unit) {
    case "days":    d.setDate(d.getDate() + amount); break;
    case "weeks":   d.setDate(d.getDate() + amount * 7); break;
    case "months":  d.setMonth(d.getMonth() + amount); break;
    case "years":   d.setFullYear(d.getFullYear() + amount); break;
    case "hours":   d.setHours(d.getHours() + amount); break;
    case "minutes": d.setMinutes(d.getMinutes() + amount); break;
  }
  return d;
}

export default function Page() {
  const [mode, setMode] = useState<"diff" | "add">("diff");
  const [dateA, setDateA] = useState(today);
  const [dateB, setDateB] = useState(today);
  const [addDate, setAddDate] = useState(today);
  const [amount, setAmount] = useState(30);
  const [unit, setUnit] = useState("days");
  const [op, setOp] = useState<"add" | "sub">("add");

  const diffResult = useMemo(() => {
    try {
      const a = new Date(dateA), b = new Date(dateB);
      if (isNaN(a.getTime()) || isNaN(b.getTime())) return null;
      return { ...diffDates(a, b), isBefore: a < b };
    } catch { return null; }
  }, [dateA, dateB]);

  const addResult = useMemo(() => {
    try {
      const d = new Date(addDate);
      if (isNaN(d.getTime())) return null;
      const result = addDuration(d, unit, op === "add" ? amount : -amount);
      return result;
    } catch { return null; }
  }, [addDate, amount, unit, op]);

  const UNITS = ["minutes", "hours", "days", "weeks", "months", "years"];

  return (
    <ToolShell tool={tool}>
      <div className="space-y-5">
        <div className="flex rounded-lg border border-neutral-700 overflow-hidden text-xs w-fit">
          {(["diff", "add"] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)} className={`px-5 py-1.5 font-medium transition ${mode === m ? "bg-emerald-600 text-white" : "text-neutral-400 hover:bg-neutral-800"}`}>
              {m === "diff" ? "Date Difference" : "Add / Subtract"}
            </button>
          ))}
        </div>

        {mode === "diff" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Start date</label>
                <input type="date" className="field" value={dateA} onChange={(e) => setDateA(e.target.value)} />
              </div>
              <div>
                <label className="label">End date</label>
                <input type="date" className="field" value={dateB} onChange={(e) => setDateB(e.target.value)} />
              </div>
            </div>
            {diffResult && (
              <div className="panel space-y-2">
                <p className="text-sm text-neutral-400">
                  {diffResult.isBefore ? "Start is before End" : "End is before Start"} —{" "}
                  <span className="text-white font-semibold">{diffResult.days} days</span>
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    ["Minutes", diffResult.minutes],
                    ["Hours", diffResult.hours],
                    ["Days", diffResult.days],
                    ["Weeks", diffResult.weeks],
                    ["Months", diffResult.months],
                    ["Years", diffResult.years],
                  ].map(([label, val]) => (
                    <div key={label as string} className="rounded-lg border border-neutral-800 p-3 text-center">
                      <div className="text-2xl font-bold text-emerald-400 font-mono">{val}</div>
                      <div className="text-xs text-neutral-500 mt-0.5">{label as string}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Base date</label>
                <input type="date" className="field" value={addDate} onChange={(e) => setAddDate(e.target.value)} />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex rounded-lg border border-neutral-700 overflow-hidden text-xs mb-0.5">
                  {(["add", "sub"] as const).map((o) => (
                    <button key={o} onClick={() => setOp(o)} className={`px-3 py-1.5 font-medium transition ${op === o ? "bg-emerald-600 text-white" : "text-neutral-400 hover:bg-neutral-800"}`}>
                      {o === "add" ? "+ Add" : "– Subtract"}
                    </button>
                  ))}
                </div>
                <input type="number" className="field w-24 py-2" value={amount} min={0} onChange={(e) => setAmount(+e.target.value)} />
                <select className="field py-2 w-28" value={unit} onChange={(e) => setUnit(e.target.value)}>
                  {UNITS.map((u) => <option key={u}>{u}</option>)}
                </select>
              </div>
            </div>
            {addResult && (
              <div className="panel space-y-3">
                <p className="text-sm text-neutral-400">Result date</p>
                <div className="text-3xl font-bold text-emerald-400 font-mono">
                  {addResult.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-neutral-500">
                  {[
                    addResult.toISOString().slice(0, 10),
                    addResult.toISOString(),
                    String(Math.floor(addResult.getTime() / 1000)),
                  ].map((v) => (
                    <div key={v} className="flex items-center gap-1">
                      <code className="font-mono text-neutral-300">{v}</code>
                      <CopyButton value={v} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolShell>
  );
}
