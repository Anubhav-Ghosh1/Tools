"use client";

import { useEffect, useState } from "react";
import ToolShell from "@/components/ToolShell";
import CopyButton from "@/components/CopyButton";
import { bySlug } from "@/lib/tools";

const tool = bySlug("hash-generator")!;
const ALGS = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"] as const;

function toHex(buf: ArrayBuffer) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function Page() {
  const [text, setText] = useState("");
  const [out, setOut] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    if (!text) { setOut({}); return; }
    (async () => {
      const data = new TextEncoder().encode(text);
      const result: Record<string, string> = {};
      for (const alg of ALGS) {
        const h = await crypto.subtle.digest(alg, data);
        result[alg] = toHex(h);
      }
      if (active) setOut(result);
    })();
    return () => { active = false; };
  }, [text]);

  return (
    <ToolShell tool={tool}>
      <div className="space-y-4">
        <div>
          <label className="label">Text</label>
          <textarea className="field" value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        {ALGS.map((a) => (
          <div key={a}>
            <div className="flex items-center justify-between">
              <label className="label">{a}</label>
              <CopyButton value={out[a] || ""} />
            </div>
            <div className="field break-all">{out[a] || "—"}</div>
          </div>
        ))}
      </div>
    </ToolShell>
  );
}
