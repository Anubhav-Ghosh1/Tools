import Link from "next/link";
import type { Tool } from "@/lib/tools";

export default function ToolShell({ tool, children }: { tool: Tool; children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Link href="/" className="text-xs text-neutral-500 hover:text-neutral-300">← All tools</Link>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl font-semibold tracking-tight">{tool.name}</h1>
          <span className="chip">{tool.category}</span>
        </div>
        <p className="text-sm text-neutral-400 max-w-3xl">{tool.description}</p>
      </div>
      <div>{children}</div>
    </div>
  );
}
