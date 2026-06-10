"use client";
import { useMemo, useState } from "react";
import ToolShell from "@/components/ToolShell";
import CopyButton from "@/components/CopyButton";
import { bySlug } from "@/lib/tools";

const tool = bySlug("char-codes")!;

function utf8Bytes(char: string): string {
  const bytes = new TextEncoder().encode(char);
  return Array.from(bytes)
    .map((b) => b.toString(16).toUpperCase().padStart(2, "0"))
    .join(" ");
}

export default function Page() {
  const [input, setInput] = useState("Hello, 世界 🌍");

  const chars = useMemo(() =>
    [...input].map((char) => {
      const cp = char.codePointAt(0)!;
      const hex = cp.toString(16).toUpperCase().padStart(4, "0");
      return {
        char,
        codePoint: `U+${hex}`,
        decimal: cp,
        hex: `0x${hex}`,
        htmlEntity: `&#${cp};`,
        htmlHex: `&#x${hex};`,
        utf8: utf8Bytes(char),
        escaped: JSON.stringify(char).slice(1, -1),
      };
    }),
    [input]
  );

  return (
    <ToolShell tool={tool}>
      <div className="space-y-4">
        <div>
          <label className="label">Input text</label>
          <input
            className="field text-base"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or paste text…"
          />
        </div>

        {chars.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-neutral-800">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-900/60">
                  {["Char", "Code Point", "Decimal", "Hex", "UTF-8 Bytes", "HTML Entity", "JSON escaped"].map((h) => (
                    <th key={h} className="text-left py-2.5 px-3 text-neutral-500 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {chars.map((c, i) => (
                  <tr key={i} className="border-b border-neutral-800/60 hover:bg-neutral-900/40 transition">
                    <td className="py-2 px-3 font-mono text-lg leading-none">
                      {c.char === " " ? <span className="text-neutral-600 text-xs">SPACE</span> : c.char}
                    </td>
                    <td className="py-2 px-3 font-mono text-emerald-400">{c.codePoint}</td>
                    <td className="py-2 px-3 font-mono text-neutral-300">{c.decimal}</td>
                    <td className="py-2 px-3 font-mono text-neutral-300">{c.hex}</td>
                    <td className="py-2 px-3 font-mono text-neutral-400">{c.utf8}</td>
                    <td className="py-2 px-3 font-mono text-neutral-400">{c.htmlEntity}</td>
                    <td className="py-2 px-3 font-mono text-neutral-400">{c.escaped}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {chars.length > 0 && (
          <div className="flex items-center justify-between text-xs text-neutral-600">
            <span>{chars.length} character{chars.length !== 1 ? "s" : ""} · {new TextEncoder().encode(input).length} bytes (UTF-8)</span>
            <CopyButton value={chars.map((c) => `${c.char}\t${c.codePoint}\t${c.decimal}\t${c.utf8}`).join("\n")} label="Copy table" />
          </div>
        )}
      </div>
    </ToolShell>
  );
}
