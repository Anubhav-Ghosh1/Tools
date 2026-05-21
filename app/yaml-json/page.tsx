"use client";

import { useEffect, useState } from "react";
import ToolShell from "@/components/ToolShell";
import CopyButton from "@/components/CopyButton";
import { bySlug } from "@/lib/tools";

const tool = bySlug("yaml-json")!;

export default function Page() {
  const [mode, setMode] = useState<"y2j" | "j2y">("y2j");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    let active = true;
    if (!input) { setOutput(""); setErr(""); return; }
    (async () => {
      try {
        const YAML = (await import("js-yaml")).default;
        if (!active) return;
        if (mode === "y2j") {
          const obj = YAML.load(input);
          setOutput(JSON.stringify(obj, null, 2));
        } else {
          const obj = JSON.parse(input);
          setOutput(YAML.dump(obj));
        }
        setErr("");
      } catch (e: any) {
        if (active) setErr(e.message);
      }
    })();
    return () => { active = false; };
  }, [input, mode]);

  return (
    <ToolShell tool={tool}>
      <div className="inline-flex rounded-md border border-neutral-700 overflow-hidden mb-3">
        <button className={`px-3 py-1.5 text-sm ${mode === "y2j" ? "bg-neutral-700" : "bg-neutral-900"}`} onClick={() => setMode("y2j")}>YAML → JSON</button>
        <button className={`px-3 py-1.5 text-sm ${mode === "j2y" ? "bg-neutral-700" : "bg-neutral-900"}`} onClick={() => setMode("j2y")}>JSON → YAML</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Input</label>
          <textarea className="field" rows={16} value={input} onChange={(e) => setInput(e.target.value)} />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="label">Output</label>
            <CopyButton value={output} />
          </div>
          <textarea className="field" rows={16} value={output} readOnly />
        </div>
      </div>
      {err && <div className="err mt-3">{err}</div>}
    </ToolShell>
  );
}
