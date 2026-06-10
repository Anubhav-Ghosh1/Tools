"use client";
import { useMemo, useState } from "react";
import ToolShell from "@/components/ToolShell";
import CopyButton from "@/components/CopyButton";
import { bySlug } from "@/lib/tools";

const tool = bySlug("number-formatter")!;

const LOCALES = [
  { label: "en-US (English, US)", value: "en-US" },
  { label: "en-GB (English, UK)", value: "en-GB" },
  { label: "de-DE (German)", value: "de-DE" },
  { label: "fr-FR (French)", value: "fr-FR" },
  { label: "ja-JP (Japanese)", value: "ja-JP" },
  { label: "zh-CN (Chinese)", value: "zh-CN" },
  { label: "ar-SA (Arabic)", value: "ar-SA" },
  { label: "hi-IN (Hindi)", value: "hi-IN" },
  { label: "pt-BR (Portuguese, BR)", value: "pt-BR" },
  { label: "ru-RU (Russian)", value: "ru-RU" },
];

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CNY", "INR", "CAD", "AUD", "CHF", "BRL"];

function fmt(n: number, locale: string, opts: Intl.NumberFormatOptions): string {
  try { return new Intl.NumberFormat(locale, opts).format(n); }
  catch { return "Error"; }
}

export default function Page() {
  const [input, setInput] = useState("1234567.89");
  const [locale, setLocale] = useState("en-US");
  const [currency, setCurrency] = useState("USD");
  const [minFrac, setMinFrac] = useState(2);
  const [maxFrac, setMaxFrac] = useState(2);

  const num = useMemo(() => parseFloat(input.replace(/,/g, "")), [input]);
  const valid = !isNaN(num);

  const formats = useMemo(() => {
    if (!valid) return [];
    return [
      { label: "Decimal", value: fmt(num, locale, { style: "decimal", minimumFractionDigits: minFrac, maximumFractionDigits: maxFrac }) },
      { label: "Currency", value: fmt(num, locale, { style: "currency", currency, minimumFractionDigits: minFrac, maximumFractionDigits: maxFrac }) },
      { label: "Percent", value: fmt(num / 100, locale, { style: "percent", minimumFractionDigits: minFrac, maximumFractionDigits: maxFrac }) },
      { label: "Scientific", value: fmt(num, locale, { notation: "scientific" }) },
      { label: "Engineering", value: fmt(num, locale, { notation: "engineering" }) },
      { label: "Compact (short)", value: fmt(num, locale, { notation: "compact", compactDisplay: "short" }) },
      { label: "Compact (long)", value: fmt(num, locale, { notation: "compact", compactDisplay: "long" }) },
      { label: "Unit (km/h)", value: fmt(num, locale, { style: "unit", unit: "kilometer-per-hour" }) },
      { label: "Unit (byte)", value: fmt(num, locale, { style: "unit", unit: "byte", notation: "compact" }) },
    ];
  }, [num, valid, locale, currency, minFrac, maxFrac]);

  const allLocalesRow = useMemo(() => {
    if (!valid) return [];
    return LOCALES.map((l) => ({
      ...l,
      decimal: fmt(num, l.value, { style: "decimal", minimumFractionDigits: 2 }),
      currency: fmt(num, l.value, { style: "currency", currency }),
    }));
  }, [num, valid, currency]);

  return (
    <ToolShell tool={tool}>
      <div className="space-y-5">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="label">Number</label>
            <input className="field w-48" value={input} onChange={(e) => setInput(e.target.value)} placeholder="1234567.89" />
          </div>
          <div>
            <label className="label">Locale</label>
            <select className="field py-2 w-52" value={locale} onChange={(e) => setLocale(e.target.value)}>
              {LOCALES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Currency</label>
            <select className="field py-2 w-24" value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <div>
              <label className="label">Min digits</label>
              <input type="number" className="field w-16 py-2" min={0} max={20} value={minFrac} onChange={(e) => setMinFrac(+e.target.value)} />
            </div>
            <div>
              <label className="label">Max digits</label>
              <input type="number" className="field w-16 py-2" min={0} max={20} value={maxFrac} onChange={(e) => setMaxFrac(+e.target.value)} />
            </div>
          </div>
        </div>

        {!valid && <div className="err">Invalid number</div>}

        {valid && (
          <>
            <div className="rounded-xl border border-neutral-800 overflow-hidden">
              {formats.map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-800/60 last:border-0 hover:bg-neutral-900/40 transition">
                  <span className="text-xs text-neutral-500 w-36 shrink-0">{label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{value}</span>
                    <CopyButton value={value} />
                  </div>
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-2">All locales</h3>
              <div className="rounded-xl border border-neutral-800 overflow-hidden text-xs">
                <div className="grid grid-cols-3 bg-neutral-900/60 border-b border-neutral-800 px-3 py-2 text-neutral-500 font-medium">
                  <span>Locale</span><span>Decimal</span><span>Currency ({currency})</span>
                </div>
                {allLocalesRow.map((r) => (
                  <div key={r.value} className="grid grid-cols-3 px-3 py-2 border-b border-neutral-800/50 last:border-0 hover:bg-neutral-900/40 transition">
                    <span className="text-neutral-400">{r.label.split(" ")[0]}</span>
                    <span className="font-mono">{r.decimal}</span>
                    <span className="font-mono">{r.currency}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </ToolShell>
  );
}
