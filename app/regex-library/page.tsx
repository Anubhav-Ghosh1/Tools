"use client";
import { useMemo, useState } from "react";
import ToolShell from "@/components/ToolShell";
import CopyButton from "@/components/CopyButton";
import { bySlug } from "@/lib/tools";

const tool = bySlug("regex-library")!;

const PATTERNS = [
  { cat: "Contact", name: "Email address", pat: /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/, flags: "", desc: "Standard email format" },
  { cat: "Contact", name: "Phone (US)", pat: /^\+?1?\s?\(?\d{3}\)?[\s.\-]?\d{3}[\s.\-]?\d{4}$/, flags: "", desc: "US phone numbers in various formats" },
  { cat: "Contact", name: "ZIP code (US)", pat: /^\d{5}(-\d{4})?$/, flags: "", desc: "5-digit or ZIP+4" },
  { cat: "Web", name: "URL (HTTP/HTTPS)", pat: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}([-a-zA-Z0-9@:%_+.~#?&//=]*)/, flags: "i", desc: "HTTP or HTTPS URLs" },
  { cat: "Web", name: "IPv4 address", pat: /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/, flags: "", desc: "Valid IPv4 (0–255 per octet)" },
  { cat: "Web", name: "IPv6 address", pat: /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/, flags: "", desc: "Full-form IPv6 address" },
  { cat: "Date & Time", name: "Date (YYYY-MM-DD)", pat: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, flags: "", desc: "ISO 8601 date format" },
  { cat: "Date & Time", name: "Time (HH:MM:SS)", pat: /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, flags: "", desc: "24-hour time" },
  { cat: "Date & Time", name: "Unix timestamp", pat: /^\d{10}(\d{3})?$/, flags: "", desc: "10-digit (s) or 13-digit (ms)" },
  { cat: "Code", name: "Hex color", pat: /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, flags: "", desc: "CSS hex color code" },
  { cat: "Code", name: "UUID v4", pat: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/, flags: "i", desc: "UUID version 4" },
  { cat: "Code", name: "Semantic version", pat: /^\d+\.\d+\.\d+(-[\w.]+)?(\+[\w.]+)?$/, flags: "", desc: "SemVer major.minor.patch" },
  { cat: "Code", name: "JWT", pat: /^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]*$/, flags: "", desc: "JSON Web Token (3 dot-separated parts)" },
  { cat: "Code", name: "Base64 string", pat: /^[A-Za-z0-9+/]+=*$/, flags: "", desc: "Standard Base64" },
  { cat: "Code", name: "URL slug", pat: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, flags: "", desc: "Lowercase URL-safe slug" },
  { cat: "Finance", name: "Credit card (16-digit)", pat: /^\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}$/, flags: "", desc: "16-digit number with optional separators" },
  { cat: "Finance", name: "IBAN", pat: /^[A-Z]{2}\d{2}[A-Z0-9]{4}\d{7}([A-Z0-9]?){0,16}$/, flags: "", desc: "International Bank Account Number" },
  { cat: "Network", name: "MAC address", pat: /^([0-9A-Fa-f]{2}[:\-]){5}[0-9A-Fa-f]{2}$/, flags: "", desc: "Ethernet MAC with : or - separators" },
  { cat: "Network", name: "CIDR notation", pat: /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)\/(\d|[12]\d|3[012])$/, flags: "", desc: "IP address with subnet mask" },
];

const cats = ["All", ...new Set(PATTERNS.map((p) => p.cat))];

export default function Page() {
  const [test, setTest] = useState("");
  const [filter, setFilter] = useState("");
  const [cat, setCat] = useState("All");

  const filtered = useMemo(() =>
    PATTERNS.filter((p) => {
      const matchCat = cat === "All" || p.cat === cat;
      const q = filter.toLowerCase();
      const matchFilter = !q || p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q);
      return matchCat && matchFilter;
    }),
    [filter, cat]
  );

  return (
    <ToolShell tool={tool}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 items-start">
          <input className="field flex-1 min-w-48" placeholder="Filter patterns…" value={filter} onChange={(e) => setFilter(e.target.value)} />
          <div className="flex flex-wrap gap-1">
            {cats.map((c) => (
              <button key={c} onClick={() => setCat(c)} className={`px-3 py-1.5 rounded-lg text-xs border font-medium transition ${cat === c ? "bg-emerald-700 border-emerald-600 text-white" : "border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-neutral-300"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Test string</label>
          <input className="field" value={test} onChange={(e) => setTest(e.target.value)} placeholder="Paste a value to test against all patterns…" />
        </div>

        <div className="space-y-2">
          {filtered.map((p, i) => {
            const match = (() => {
              if (!test) return null;
              try { return new RegExp(p.pat.source, p.flags).test(test); } catch { return null; }
            })();
            return (
              <div key={i} className={`rounded-xl border p-3.5 transition ${match === true ? "border-emerald-700/50 bg-emerald-950/20" : match === false ? "border-neutral-800/50 opacity-50" : "border-neutral-800 bg-neutral-900/30"}`}>
                <div className="flex items-start gap-3">
                  {match !== null && (
                    <span className={`text-base shrink-0 font-bold ${match ? "text-emerald-400" : "text-neutral-600"}`}>
                      {match ? "✓" : "✗"}
                    </span>
                  )}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{p.name}</span>
                      <span className="chip">{p.cat}</span>
                    </div>
                    <div className="text-xs text-neutral-500">{p.desc}</div>
                    <code className="text-xs text-emerald-400 font-mono break-all block">
                      /{p.pat.source}/{p.flags}
                    </code>
                  </div>
                  <CopyButton value={`/${p.pat.source}/${p.flags}`} />
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <div className="text-sm text-neutral-500 py-6 text-center">No patterns match.</div>}
        </div>
      </div>
    </ToolShell>
  );
}
