"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/components/ToolShell";
import { bySlug } from "@/lib/tools";

const tool = bySlug("text-stats")!;

export default function Page() {
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, "").length;
    const words = (text.match(/\S+/g) || []).length;
    const lines = text === "" ? 0 : text.split("\n").length;
    const sentences = (text.match(/[^.!?]+[.!?]+/g) || []).length;
    const paragraphs = text.split(/\n{2,}/).filter((p) => p.trim()).length;
    const reading = Math.max(1, Math.ceil(words / 220));
    return { chars, charsNoSpace, words, lines, sentences, paragraphs, reading };
  }, [text]);

  return (
    <ToolShell tool={tool}>
      <div className="space-y-4">
        <textarea className="field" rows={12} placeholder="Type or paste text…" value={text} onChange={(e) => setText(e.target.value)} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(stats).map(([k, v]) => (
            <div key={k} className="rounded-md border border-neutral-800 bg-neutral-900/60 p-3">
              <div className="text-xs uppercase text-neutral-400">{k === "reading" ? "Reading (min)" : k}</div>
              <div className="text-xl font-mono">{v}</div>
            </div>
          ))}
        </div>
      </div>
    </ToolShell>
  );
}
