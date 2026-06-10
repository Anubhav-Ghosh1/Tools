"use client";
import { useState } from "react";
import ToolShell from "@/components/ToolShell";
import CopyButton from "@/components/CopyButton";
import { bySlug } from "@/lib/tools";

const tool = bySlug("nano-id")!;

const ALPHABETS = {
  "URL-safe (default)": "_-0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "Alphanumeric":       "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "Lowercase hex":      "0123456789abcdef",
  "Numbers only":       "0123456789",
  "Lowercase":          "abcdefghijklmnopqrstuvwxyz",
};

function nanoId(size: number, alphabet: string): string {
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

// ULID: 48-bit timestamp (ms) + 80-bit random, Crockford base32
const B32 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
function ulid(): string {
  const ts = Date.now();
  let t = "";
  let n = ts;
  for (let i = 9; i >= 0; i--) { t = B32[n % 32] + t; n = Math.floor(n / 32); }
  const rand = crypto.getRandomValues(new Uint8Array(10));
  let r = "";
  for (const b of rand) r += B32[b % 32];
  return t + r;
}

export default function Page() {
  const [mode, setMode] = useState<"nanoid" | "ulid">("nanoid");
  const [size, setSize] = useState(21);
  const [alphabetKey, setAlphabetKey] = useState("URL-safe (default)");
  const [custom, setCustom] = useState("");
  const [count, setCount] = useState(10);
  const [ids, setIds] = useState<string[]>(() =>
    Array.from({ length: 10 }, () => nanoId(21, ALPHABETS["URL-safe (default)"]))
  );

  function generate() {
    if (mode === "ulid") {
      setIds(Array.from({ length: count }, ulid));
    } else {
      const alpha = custom.length >= 2 ? custom : ALPHABETS[alphabetKey as keyof typeof ALPHABETS];
      setIds(Array.from({ length: count }, () => nanoId(size, alpha)));
    }
  }

  return (
    <ToolShell tool={tool}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-lg border border-neutral-700 overflow-hidden text-xs">
            {(["nanoid", "ulid"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)} className={`px-4 py-1.5 font-medium uppercase tracking-wide transition ${mode === m ? "bg-emerald-600 text-white" : "text-neutral-400 hover:bg-neutral-800"}`}>
                {m}
              </button>
            ))}
          </div>
          {mode === "nanoid" && (
            <>
              <div className="flex items-center gap-2">
                <label className="label pb-0 min-h-0 text-xs">Size: {size}</label>
                <input type="range" min={4} max={64} value={size} onChange={(e) => setSize(+e.target.value)} className="w-28" />
              </div>
              <select className="field py-1 text-xs w-48" value={alphabetKey} onChange={(e) => setAlphabetKey(e.target.value)}>
                {Object.keys(ALPHABETS).map((k) => <option key={k}>{k}</option>)}
                <option value="custom">Custom alphabet…</option>
              </select>
              {(alphabetKey === "custom" || custom) && (
                <input className="field py-1 text-xs w-48" placeholder="Custom alphabet" value={custom} onChange={(e) => setCustom(e.target.value)} />
              )}
            </>
          )}
          <div className="flex items-center gap-2">
            <label className="label pb-0 min-h-0 text-xs">Count</label>
            <input type="number" className="field py-1 text-xs w-20" min={1} max={100} value={count} onChange={(e) => setCount(Math.max(1, Math.min(100, +e.target.value)))} />
          </div>
          <button className="btn-primary" onClick={generate}>Generate</button>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="label">{ids.length} IDs</label>
            <CopyButton value={ids.join("\n")} label="Copy all" />
          </div>
          <div className="rounded-xl border border-neutral-800 bg-neutral-950 divide-y divide-neutral-800/60 max-h-96 overflow-y-auto">
            {ids.map((id, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 group hover:bg-neutral-900/50 transition">
                <code className="text-sm font-mono text-emerald-400">{id}</code>
                <CopyButton value={id} />
              </div>
            ))}
          </div>
        </div>

        {mode === "ulid" && (
          <p className="text-xs text-neutral-600">ULIDs are sortable by creation time and encode a 48-bit timestamp prefix.</p>
        )}
      </div>
    </ToolShell>
  );
}
