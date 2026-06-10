"use client";
import { useMemo, useState } from "react";
import ToolShell from "@/components/ToolShell";
import CopyButton from "@/components/CopyButton";
import { bySlug } from "@/lib/tools";

const tool = bySlug("env-parser")!;

type EnvEntry = { key: string; value: string; comment: string };

function parseEnv(text: string): EnvEntry[] {
  const entries: EnvEntry[] = [];
  let pendingComment = "";
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) { pendingComment = ""; continue; }
    if (line.startsWith("#")) { pendingComment = line.slice(1).trim(); continue; }
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1).replace(/\\n/g, "\n").replace(/\\t/g, "\t");
    }
    const inlineComment = value.match(/\s+#\s+(.+)$/);
    if (inlineComment) value = value.replace(inlineComment[0], "").trim();
    entries.push({ key, value, comment: pendingComment || (inlineComment?.[1] ?? "") });
    pendingComment = "";
  }
  return entries;
}

function toEnv(entries: EnvEntry[]): string {
  return entries.map(({ key, value, comment }) => {
    const needsQuotes = /\s|#|"/.test(value);
    const quoted = needsQuotes ? `"${value.replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\t/g, "\\t")}"` : value;
    const commentLine = comment ? `# ${comment}\n` : "";
    return `${commentLine}${key}=${quoted}`;
  }).join("\n");
}

function toJSON(entries: EnvEntry[]): string {
  return JSON.stringify(Object.fromEntries(entries.map(({ key, value }) => [key, value])), null, 2);
}

const SAMPLE = `# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb

# App
NODE_ENV=development
PORT=3000
APP_NAME="My Awesome App"

# Auth
JWT_SECRET=super-secret-key
JWT_EXPIRES_IN=7d

# Feature flags
ENABLE_SIGNUP=true
MAINTENANCE_MODE=false
`;

export default function Page() {
  const [input, setInput] = useState(SAMPLE);
  const [mode, setMode] = useState<"table" | "json" | "env">("table");
  const [entries, setEntries] = useState<EnvEntry[]>(() => parseEnv(SAMPLE));

  function onInputChange(text: string) {
    setInput(text);
    setEntries(parseEnv(text));
  }

  const jsonOutput = useMemo(() => toJSON(entries), [entries]);
  const envOutput = useMemo(() => toEnv(entries), [entries]);

  function updateEntry(i: number, field: keyof EnvEntry, val: string) {
    const next = entries.map((e, idx) => idx === i ? { ...e, [field]: val } : e);
    setEntries(next);
    setInput(toEnv(next));
  }
  function removeEntry(i: number) {
    const next = entries.filter((_, idx) => idx !== i);
    setEntries(next);
    setInput(toEnv(next));
  }
  function addEntry() {
    const next = [...entries, { key: "", value: "", comment: "" }];
    setEntries(next);
  }

  return (
    <ToolShell tool={tool}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="label">.env Input</label>
            <textarea className="field font-mono text-xs" rows={16} value={input} onChange={(e) => onInputChange(e.target.value)} />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex rounded-lg border border-neutral-700 overflow-hidden text-xs">
                {(["table", "json", "env"] as const).map((m) => (
                  <button key={m} onClick={() => setMode(m)} className={`px-3 py-1.5 font-medium uppercase tracking-wide transition ${mode === m ? "bg-emerald-600 text-white" : "text-neutral-400 hover:bg-neutral-800"}`}>{m}</button>
                ))}
              </div>
              <CopyButton value={mode === "json" ? jsonOutput : mode === "env" ? envOutput : ""} />
            </div>

            {mode === "table" && (
              <div className="space-y-1">
                {entries.map((e, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-1 items-center">
                    <input className="field py-1 text-xs font-mono" value={e.key} onChange={(ev) => updateEntry(i, "key", ev.target.value)} placeholder="KEY" />
                    <input className="field py-1 text-xs font-mono" value={e.value} onChange={(ev) => updateEntry(i, "value", ev.target.value)} placeholder="value" />
                    <button onClick={() => removeEntry(i)} className="text-neutral-600 hover:text-red-400 transition text-sm px-1">×</button>
                  </div>
                ))}
                <button onClick={addEntry} className="btn text-xs mt-1">+ Add variable</button>
              </div>
            )}

            {mode === "json" && (
              <textarea className="field font-mono text-xs" rows={14} value={jsonOutput} readOnly />
            )}

            {mode === "env" && (
              <textarea className="field font-mono text-xs" rows={14} value={envOutput} readOnly />
            )}
          </div>
        </div>

        <div className="panel text-xs text-neutral-500">
          <span className="text-neutral-400 font-medium">Supports:</span> quoted values, inline comments, blank lines, escape sequences (\n \t)
        </div>
      </div>
    </ToolShell>
  );
}
