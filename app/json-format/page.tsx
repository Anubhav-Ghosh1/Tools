"use client";

import { useState } from "react";
import ToolShell from "@/components/ToolShell";
import CopyButton from "@/components/CopyButton";
import { bySlug } from "@/lib/tools";

const tool = bySlug("json-format")!;

export default function Page() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [err, setErr] = useState("");

  const run = (action: "format" | "minify") => {
    setErr(""); setOutput("");
    try {
      const obj = JSON.parse(input);
      setOutput(action === "format" ? JSON.stringify(obj, null, 2) : JSON.stringify(obj));
    } catch (e: any) {
      const m = /position (\d+)/.exec(e.message);
      let hint = "";
      if (m) {
        const pos = Number(m[1]);
        const line = input.slice(0, pos).split("\n").length;
        hint = ` (line ${line})`;
      }
      setErr(e.message + hint);
    }
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <button className="btn-primary" onClick={() => run("format")} disabled={!input}>Format</button>
          <button className="btn" onClick={() => run("minify")} disabled={!input}>Minify</button>
          <CopyButton value={output} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Input</label>
            <textarea className="field" rows={16} value={input} onChange={(e) => setInput(e.target.value)} />
          </div>
          <div>
            <label className="label">Output</label>
            <textarea className="field" rows={16} value={output} readOnly />
          </div>
        </div>
        {err && <div className="err">{err}</div>}
        {output && !err && <div className="ok">Valid JSON</div>}
      </div>
    </ToolShell>
  );
}
