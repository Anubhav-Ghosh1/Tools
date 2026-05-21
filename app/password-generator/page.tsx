"use client";

import { useState } from "react";
import ToolShell from "@/components/ToolShell";
import CopyButton from "@/components/CopyButton";
import { bySlug } from "@/lib/tools";

const tool = bySlug("password-generator")!;

const SETS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digit: "0123456789",
  symbol: "!@#$%^&*()-_=+[]{};:,.<>?/",
};

function gen(len: number, opts: { lower: boolean; upper: boolean; digit: boolean; symbol: boolean }) {
  let pool = "";
  if (opts.lower) pool += SETS.lower;
  if (opts.upper) pool += SETS.upper;
  if (opts.digit) pool += SETS.digit;
  if (opts.symbol) pool += SETS.symbol;
  if (!pool) return "";
  const bytes = crypto.getRandomValues(new Uint32Array(len));
  let out = "";
  for (let i = 0; i < len; i++) out += pool[bytes[i] % pool.length];
  return out;
}

export default function Page() {
  const [len, setLen] = useState(20);
  const [opts, setOpts] = useState({ lower: true, upper: true, digit: true, symbol: true });
  const [pw, setPw] = useState(gen(20, { lower: true, upper: true, digit: true, symbol: true }));

  return (
    <ToolShell tool={tool}>
      <div className="space-y-4">
        <div>
          <label className="label">Length: {len}</label>
          <input type="range" min={4} max={128} value={len} onChange={(e) => setLen(Number(e.target.value))} className="w-full" />
        </div>
        <div className="flex flex-wrap gap-4">
          {(Object.keys(SETS) as Array<keyof typeof SETS>).map((k) => (
            <label key={k} className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={opts[k]} onChange={(e) => setOpts({ ...opts, [k]: e.target.checked })} />
              {k}
            </label>
          ))}
        </div>
        <div className="flex gap-2">
          <button className="btn-primary" onClick={() => setPw(gen(len, opts))}>Generate</button>
          <CopyButton value={pw} />
        </div>
        <div className="field font-mono break-all text-lg">{pw || "—"}</div>
      </div>
    </ToolShell>
  );
}
