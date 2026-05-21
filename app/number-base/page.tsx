"use client";

import { useState } from "react";
import ToolShell from "@/components/ToolShell";
import CopyButton from "@/components/CopyButton";
import { bySlug } from "@/lib/tools";

const tool = bySlug("number-base")!;

export default function Page() {
  const [vals, setVals] = useState({ bin: "1010", oct: "12", dec: "10", hex: "a" });
  const [err, setErr] = useState("");

  const set = (base: 2 | 8 | 10 | 16, value: string) => {
    setErr("");
    if (!value) { setVals({ bin: "", oct: "", dec: "", hex: "" }); return; }
    try {
      const n = parseInt(value, base);
      if (Number.isNaN(n)) throw new Error("Invalid number for base " + base);
      setVals({
        bin: n.toString(2),
        oct: n.toString(8),
        dec: n.toString(10),
        hex: n.toString(16),
      });
    } catch (e: any) {
      setErr(e.message);
    }
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-3 max-w-xl">
        {([["Binary", 2, "bin"], ["Octal", 8, "oct"], ["Decimal", 10, "dec"], ["Hexadecimal", 16, "hex"]] as const).map(
          ([label, base, key]) => (
            <div key={key}>
              <label className="label">{label} (base {base})</label>
              <div className="flex gap-2">
                <input className="field font-mono" value={vals[key]} onChange={(e) => set(base, e.target.value)} />
                <CopyButton value={vals[key]} />
              </div>
            </div>
          )
        )}
        {err && <div className="err">{err}</div>}
      </div>
    </ToolShell>
  );
}
