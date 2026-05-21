"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/components/ToolShell";
import CopyButton from "@/components/CopyButton";
import { bySlug } from "@/lib/tools";

const tool = bySlug("color-converter")!;

function hexToRgb(hex: string): { r: number; g: number; b: number; a: number } | null {
  let s = hex.trim().replace(/^#/, "");
  if (s.length === 3) s = s.split("").map((c) => c + c).join("");
  if (s.length === 4) s = s.split("").map((c) => c + c).join("");
  if (s.length === 6) s += "ff";
  if (s.length !== 8) return null;
  const r = parseInt(s.slice(0, 2), 16);
  const g = parseInt(s.slice(2, 4), 16);
  const b = parseInt(s.slice(4, 6), 16);
  const a = parseInt(s.slice(6, 8), 16) / 255;
  if ([r, g, b].some(Number.isNaN)) return null;
  return { r, g, b, a };
}

function rgbToHex(r: number, g: number, b: number, a = 1) {
  const h = (n: number) => Math.round(n).toString(16).padStart(2, "0");
  let s = `#${h(r)}${h(g)}${h(b)}`;
  if (a < 1) s += h(Math.round(a * 255));
  return s.toUpperCase();
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export default function Page() {
  const [hex, setHex] = useState("#3B82F6");

  const rgb = useMemo(() => hexToRgb(hex), [hex]);

  return (
    <ToolShell tool={tool}>
      <div className="grid grid-cols-1 md:grid-cols-[14rem_1fr] gap-4">
        <div>
          <label className="label">Pick</label>
          <input type="color" className="field h-14 p-1" value={rgb ? rgbToHex(rgb.r, rgb.g, rgb.b).slice(0, 7) : "#000000"} onChange={(e) => setHex(e.target.value)} />
          {rgb && (
            <div className="mt-3 rounded-md border border-neutral-800" style={{ background: `rgba(${rgb.r},${rgb.g},${rgb.b},${rgb.a})`, height: 80 }} />
          )}
        </div>
        <div className="space-y-3">
          <div>
            <label className="label">HEX</label>
            <div className="flex gap-2">
              <input className="field" value={hex} onChange={(e) => setHex(e.target.value)} />
              <CopyButton value={hex} />
            </div>
          </div>
          {rgb && (
            <>
              <div>
                <label className="label">RGB(A)</label>
                <div className="flex gap-2">
                  <input className="field" readOnly value={`rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a.toFixed(2)})`} />
                  <CopyButton value={`rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a.toFixed(2)})`} />
                </div>
              </div>
              <div>
                <label className="label">HSL(A)</label>
                {(() => {
                  const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
                  const v = `hsla(${h}, ${s}%, ${l}%, ${rgb.a.toFixed(2)})`;
                  return <div className="flex gap-2"><input className="field" readOnly value={v} /><CopyButton value={v} /></div>;
                })()}
              </div>
            </>
          )}
        </div>
      </div>
    </ToolShell>
  );
}
