"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/components/ToolShell";
import CopyButton from "@/components/CopyButton";
import { bySlug } from "@/lib/tools";

const tool = bySlug("command-teller")!;

type Cmd = { command: string; description: string; tags: string[] };

const COMMANDS: Cmd[] = [
  { command: "git status", description: "Show working tree status", tags: ["git", "status", "changes"] },
  { command: "git log --oneline -20", description: "Recent commits, compact", tags: ["git", "log", "history", "commits"] },
  { command: "git diff --stat", description: "Summary of changes per file", tags: ["git", "diff", "summary"] },
  { command: "git stash push -m 'WIP'", description: "Stash uncommitted changes", tags: ["git", "stash", "save"] },
  { command: "git reset --soft HEAD~1", description: "Undo last commit, keep changes staged", tags: ["git", "undo", "reset"] },
  { command: "git restore --staged .", description: "Unstage everything", tags: ["git", "unstage"] },
  { command: "git switch -c feature/x", description: "Create + switch to new branch", tags: ["git", "branch", "new"] },
  { command: "git push -u origin HEAD", description: "Push current branch and set upstream", tags: ["git", "push", "upstream"] },
  { command: "git pull --rebase", description: "Pull and rebase onto upstream", tags: ["git", "pull", "rebase"] },
  { command: "find . -name '*.log' -delete", description: "Delete all .log files recursively", tags: ["find", "delete", "files"] },
  { command: "grep -RIn 'TODO' .", description: "Search recursively for TODO", tags: ["grep", "search", "find text"] },
  { command: "du -sh *", description: "Disk usage of items in current dir", tags: ["du", "disk", "usage", "size"] },
  { command: "lsof -i :3000", description: "Find process listening on port 3000", tags: ["lsof", "port", "process"] },
  { command: "kill -9 $(lsof -t -i:3000)", description: "Kill process on port 3000", tags: ["kill", "port"] },
  { command: "tar -czvf archive.tar.gz folder/", description: "Create gzipped tar archive", tags: ["tar", "compress", "archive"] },
  { command: "tar -xzvf archive.tar.gz", description: "Extract gzipped tar archive", tags: ["tar", "extract", "unzip"] },
  { command: "curl -sSL https://example.com -o page.html", description: "Download URL to file", tags: ["curl", "download", "http"] },
  { command: "ssh-keygen -t ed25519 -C 'you@example.com'", description: "Generate new SSH key", tags: ["ssh", "key", "generate"] },
  { command: "rsync -avP src/ user@host:/dest/", description: "Sync directory to remote with progress", tags: ["rsync", "copy", "sync"] },
  { command: "docker ps -a", description: "List all containers", tags: ["docker", "containers"] },
  { command: "docker compose up -d --build", description: "Build and start services detached", tags: ["docker", "compose", "build"] },
  { command: "npm run dev", description: "Run development server (Node project)", tags: ["npm", "dev"] },
  { command: "pnpm install", description: "Install dependencies with pnpm", tags: ["pnpm", "install"] },
];

function score(q: string, c: Cmd): number {
  const t = (c.command + " " + c.description + " " + c.tags.join(" ")).toLowerCase();
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return 0;
  let s = 0;
  for (const w of words) if (t.includes(w)) s += 1;
  return s / words.length;
}

export default function Page() {
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    if (!q.trim()) return COMMANDS.slice(0, 8);
    return COMMANDS.map((c) => ({ c, s: score(q, c) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 10).map((x) => x.c);
  }, [q]);

  return (
    <ToolShell tool={tool}>
      <div className="space-y-4">
        <input className="field" placeholder="e.g. 'find which process uses port 3000'" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="space-y-2">
          {results.map((c, i) => (
            <div key={i} className="rounded-md border border-neutral-800 bg-neutral-900/60 p-3">
              <div className="flex items-center justify-between gap-2">
                <code className="font-mono text-emerald-300 break-all">{c.command}</code>
                <CopyButton value={c.command} />
              </div>
              <div className="text-sm text-neutral-400 mt-1">{c.description}</div>
            </div>
          ))}
          {!results.length && <div className="text-sm text-neutral-500">No matches. Try simpler terms.</div>}
        </div>
      </div>
    </ToolShell>
  );
}
