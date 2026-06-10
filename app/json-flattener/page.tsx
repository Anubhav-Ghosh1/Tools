"use client";
import { useMemo, useState } from "react";
import ToolShell from "@/components/ToolShell";
import CopyButton from "@/components/CopyButton";
import { bySlug } from "@/lib/tools";

const tool = bySlug("json-flattener")!;

function flatten(
  obj: unknown,
  sep: string,
  prefix = "",
  result: Record<string, unknown> = {}
): Record<string, unknown> {
  if (obj === null || typeof obj !== "object") {
    result[prefix] = obj;
    return result;
  }
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => flatten(item, sep, prefix ? `${prefix}${sep}${i}` : String(i), result));
    return result;
  }
  const entries = Object.entries(obj as Record<string, unknown>);
  if (entries.length === 0 && prefix) {
    result[prefix] = {};
    return result;
  }
  for (const [key, value] of entries) {
    const newKey = prefix ? `${prefix}${sep}${key}` : key;
    flatten(value, sep, newKey, result);
  }
  return result;
}

function unflatten(flat: Record<string, unknown>, sep: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split(sep);
    let cur: Record<string, unknown> = result;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!(parts[i] in cur) || typeof cur[parts[i]] !== "object" || cur[parts[i]] === null) {
        cur[parts[i]] = {};
      }
      cur = cur[parts[i]] as Record<string, unknown>;
    }
    cur[parts[parts.length - 1]] = value;
  }
  return result;
}

const EXAMPLES = {
  nested: `{
  "user": {
    "name": "Alice",
    "address": {
      "city": "Wonderland",
      "zip": "12345"
    },
    "roles": ["admin", "editor"]
  },
  "meta": {
    "created": "2025-01-01",
    "active": true
  }
}`,
  flat: `{
  "user.name": "Alice",
  "user.address.city": "Wonderland",
  "user.address.zip": "12345",
  "user.roles.0": "admin",
  "user.roles.1": "editor",
  "meta.created": "2025-01-01",
  "meta.active": true
}`,
};

export default function Page() {
  const [input, setInput] = useState(EXAMPLES.nested);
  const [mode, setMode] = useState<"flatten" | "unflatten">("flatten");
  const [sep, setSep] = useState(".");

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: "" };
    try {
      const parsed = JSON.parse(input);
      const result =
        mode === "flatten"
          ? flatten(parsed, sep)
          : unflatten(parsed as Record<string, unknown>, sep);
      return { output: JSON.stringify(result, null, 2), error: "" };
    } catch (e: unknown) {
      return { output: "", error: (e as Error).message };
    }
  }, [input, mode, sep]);

  return (
    <ToolShell tool={tool}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-lg border border-neutral-700 overflow-hidden text-xs">
            {(["flatten", "unflatten"] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setInput(m === "flatten" ? EXAMPLES.nested : EXAMPLES.flat);
                }}
                className={`px-4 py-1.5 font-medium capitalize transition ${mode === m ? "bg-emerald-600 text-white" : "text-neutral-400 hover:bg-neutral-800"}`}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <label className="label pb-0 min-h-0 text-xs">Separator</label>
            <div className="flex rounded-lg border border-neutral-700 overflow-hidden text-xs">
              {[".", "_", "/", "--"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSep(s)}
                  className={`px-3 py-1.5 font-mono font-medium transition ${sep === s ? "bg-neutral-700 text-white" : "text-neutral-400 hover:bg-neutral-800"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">{mode === "flatten" ? "Nested JSON" : "Flat JSON"}</label>
            <textarea
              className="field"
              rows={16}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === "flatten" ? '{"a": {"b": 1}}' : '{"a.b": 1}'}
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="label">{mode === "flatten" ? "Flat JSON" : "Nested JSON"}</label>
              <CopyButton value={output} />
            </div>
            <textarea
              rows={16}
              value={error ? `// Error: ${error}` : output}
              readOnly
              className={`field ${error ? "text-red-400" : ""}`}
            />
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
