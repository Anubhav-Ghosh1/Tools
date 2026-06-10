"use client";
import { useMemo, useState } from "react";
import ToolShell from "@/components/ToolShell";
import CopyButton from "@/components/CopyButton";
import { bySlug } from "@/lib/tools";

const tool = bySlug("css-units")!;

type Unit = "px" | "rem" | "em" | "pt" | "pc" | "cm" | "mm" | "in" | "vw" | "vh" | "%";

const UNIT_LABELS: Record<Unit, string> = {
  px: "Pixels", rem: "Root em", em: "Em", pt: "Points",
  pc: "Picas", cm: "Centimeters", mm: "Millimeters", in: "Inches",
  vw: "Viewport width %", vh: "Viewport height %", "%": "Percent",
};

function getPxRatio(unit: Unit, baseFontPx: number, viewportW: number, viewportH: number, parentFontPx: number): number {
  switch (unit) {
    case "px":  return 1;
    case "rem": return baseFontPx;
    case "em":  return parentFontPx;
    case "pt":  return 96 / 72;
    case "pc":  return 96 / 6;
    case "cm":  return 96 / 2.54;
    case "mm":  return 96 / 25.4;
    case "in":  return 96;
    case "vw":  return viewportW / 100;
    case "vh":  return viewportH / 100;
    case "%":   return parentFontPx / 100;
  }
}

const UNITS: Unit[] = ["px", "rem", "em", "pt", "pc", "cm", "mm", "in", "vw", "vh", "%"];

export default function Page() {
  const [value, setValue] = useState("16");
  const [fromUnit, setFromUnit] = useState<Unit>("px");
  const [baseFontPx, setBaseFontPx] = useState(16);
  const [viewportW, setViewportW] = useState(1440);
  const [viewportH, setViewportH] = useState(900);
  const [parentFontPx, setParentFontPx] = useState(16);

  const conversions = useMemo(() => {
    const num = parseFloat(value);
    if (isNaN(num)) return null;
    const fromPx = num * getPxRatio(fromUnit, baseFontPx, viewportW, viewportH, parentFontPx);
    return UNITS.map((unit) => ({
      unit,
      value: fromPx / getPxRatio(unit, baseFontPx, viewportW, viewportH, parentFontPx),
    }));
  }, [value, fromUnit, baseFontPx, viewportW, viewportH, parentFontPx]);

  function fmt(n: number) {
    if (Math.abs(n) < 0.001) return n.toExponential(3);
    return parseFloat(n.toPrecision(6)).toString();
  }

  return (
    <ToolShell tool={tool}>
      <div className="space-y-5">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="label">Value</label>
            <input className="field w-32" value={value} onChange={(e) => setValue(e.target.value)} placeholder="16" />
          </div>
          <div>
            <label className="label">From unit</label>
            <select className="field py-2 w-36" value={fromUnit} onChange={(e) => setFromUnit(e.target.value as Unit)}>
              {UNITS.map((u) => <option key={u} value={u}>{u} — {UNIT_LABELS[u]}</option>)}
            </select>
          </div>
        </div>

        {conversions && (
          <div className="rounded-xl border border-neutral-800 overflow-hidden">
            {conversions.filter((c) => c.unit !== fromUnit).map(({ unit, value: v }) => (
              <div key={unit} className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-800/60 last:border-0 hover:bg-neutral-900/40 transition">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-emerald-400 w-8 shrink-0 text-sm">{unit}</span>
                  <span className="text-xs text-neutral-500">{UNIT_LABELS[unit]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{fmt(v)}{unit}</span>
                  <CopyButton value={`${fmt(v)}${unit}`} />
                </div>
              </div>
            ))}
          </div>
        )}

        <details className="panel text-xs">
          <summary className="cursor-pointer text-neutral-400 hover:text-neutral-200">Base values (affects rem, em, vw, vh, %)</summary>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
            {[
              ["Root font (rem base)", baseFontPx, setBaseFontPx, "px"],
              ["Parent font (em/%)", parentFontPx, setParentFontPx, "px"],
              ["Viewport width (vw)", viewportW, setViewportW, "px"],
              ["Viewport height (vh)", viewportH, setViewportH, "px"],
            ].map(([label, val, setter, suffix]) => (
              <div key={label as string}>
                <label className="label text-[10px] min-h-0 pb-1">{label as string}</label>
                <div className="flex items-center gap-1">
                  <input type="number" className="field py-1 text-xs" value={val as number} onChange={(e) => (setter as (v: number) => void)(+e.target.value)} />
                  <span className="text-xs text-neutral-600">{suffix as string}</span>
                </div>
              </div>
            ))}
          </div>
        </details>
      </div>
    </ToolShell>
  );
}
