"use client";

import { useState } from "react";
import ToolShell from "@/components/ToolShell";
import CopyButton from "@/components/CopyButton";
import { bySlug } from "@/lib/tools";

const tool = bySlug("lorem-ipsum")!;

const WORDS = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum".split(" ");

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sentence() {
  const len = rand(8, 18);
  const arr = Array.from({ length: len }, () => WORDS[rand(0, WORDS.length - 1)]);
  arr[0] = arr[0][0].toUpperCase() + arr[0].slice(1);
  return arr.join(" ") + ".";
}

function paragraph() {
  return Array.from({ length: rand(4, 7) }, sentence).join(" ");
}

export default function Page() {
  const [unit, setUnit] = useState<"paragraphs" | "sentences" | "words">("paragraphs");
  const [count, setCount] = useState(3);
  const [out, setOut] = useState("");

  const gen = () => {
    if (unit === "paragraphs") setOut(Array.from({ length: count }, paragraph).join("\n\n"));
    else if (unit === "sentences") setOut(Array.from({ length: count }, sentence).join(" "));
    else setOut(Array.from({ length: count }, () => WORDS[rand(0, WORDS.length - 1)]).join(" "));
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-4">
        <div className="flex items-end gap-3 flex-wrap">
          <div>
            <label className="label">Count</label>
            <input type="number" className="field w-24" min={1} max={500} value={count} onChange={(e) => setCount(Math.max(1, Number(e.target.value) || 1))} />
          </div>
          <div>
            <label className="label">Unit</label>
            <select className="field" value={unit} onChange={(e) => setUnit(e.target.value as any)}>
              <option value="paragraphs">Paragraphs</option>
              <option value="sentences">Sentences</option>
              <option value="words">Words</option>
            </select>
          </div>
          <button className="btn-primary" onClick={gen}>Generate</button>
          <CopyButton value={out} />
        </div>
        <textarea className="field" rows={12} value={out} readOnly />
      </div>
    </ToolShell>
  );
}
