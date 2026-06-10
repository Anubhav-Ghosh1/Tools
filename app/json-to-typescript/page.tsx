"use client";
import { useMemo, useState } from "react";
import yaml from "js-yaml";
import ToolShell from "@/components/ToolShell";
import CopyButton from "@/components/CopyButton";
import { bySlug } from "@/lib/tools";

const tool = bySlug("json-to-typescript")!;

function toPascalCase(s: string): string {
  return s.replace(/(^\w|[-_\s.]\w)/g, (m) => m.replace(/[-_\s.]/, "").toUpperCase());
}

function toTs(value: unknown, name: string, interfaces: Map<string, string>): string {
  if (value === null) return "null";
  if (Array.isArray(value)) {
    if (value.length === 0) return "unknown[]";
    const types = [...new Set(value.map((item) => toTs(item, name + "Item", interfaces)))];
    return types.length === 1 ? `${types[0]}[]` : `(${types.join(" | ")})[]`;
  }
  const t = typeof value;
  if (t !== "object") return t;
  const interfaceName = toPascalCase(name) || "Root";
  const lines: string[] = [];
  for (const [key, val] of Object.entries(value as object)) {
    const type = toTs(val, toPascalCase(key), interfaces);
    const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;
    lines.push(`  ${safeKey}: ${type};`);
  }
  const body = `export interface ${interfaceName} {\n${lines.join("\n")}\n}`;
  if (!interfaces.has(interfaceName)) interfaces.set(interfaceName, body);
  return interfaceName;
}

const JSON_EXAMPLE = `{
  "id": 1,
  "name": "Alice",
  "email": "alice@example.com",
  "roles": ["admin", "user"],
  "address": {
    "city": "Wonderland",
    "zip": "12345"
  }
}`;

const YAML_EXAMPLE = `id: 1
name: Alice
email: alice@example.com
roles:
  - admin
  - user
address:
  city: Wonderland
  zip: "12345"
`;

export default function Page() {
  const [format, setFormat] = useState<"json" | "yaml">("json");
  const [input, setInput] = useState(JSON_EXAMPLE);
  const [rootName, setRootName] = useState("Root");

  function switchFormat(f: "json" | "yaml") {
    setFormat(f);
    setInput(f === "json" ? JSON_EXAMPLE : YAML_EXAMPLE);
  }

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: "" };
    try {
      const parsed = format === "yaml" ? yaml.load(input) : JSON.parse(input);
      const interfaces = new Map<string, string>();
      toTs(parsed, rootName || "Root", interfaces);
      return { output: [...interfaces.values()].reverse().join("\n\n"), error: "" };
    } catch (e: unknown) {
      return { output: "", error: (e as Error).message };
    }
  }, [input, rootName, format]);

  return (
    <ToolShell tool={tool}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-lg border border-neutral-700 overflow-hidden text-xs">
            {(["json", "yaml"] as const).map((f) => (
              <button
                key={f}
                onClick={() => switchFormat(f)}
                className={`px-4 py-1.5 font-medium uppercase tracking-wide transition ${format === f ? "bg-emerald-600 text-white" : "text-neutral-400 hover:bg-neutral-800"}`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <label className="label pb-0 min-h-0 text-xs">Root name</label>
            <input
              className="field w-36 py-1"
              value={rootName}
              onChange={(e) => setRootName(e.target.value)}
              placeholder="Root"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">{format.toUpperCase()} Input</label>
            <textarea
              className="field"
              rows={16}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={format === "json" ? '{"key": "value"}' : "key: value"}
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="label">TypeScript Output</label>
              <CopyButton value={output} />
            </div>
            <textarea
              rows={16}
              value={error ? `// Error: ${error}` : output}
              readOnly
              className={`field font-mono text-xs ${error ? "text-red-400" : "text-emerald-300"}`}
            />
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
