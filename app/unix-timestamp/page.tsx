"use client";

import { useEffect, useMemo, useState } from "react";
import ToolShell from "@/components/ToolShell";
import CopyButton from "@/components/CopyButton";
import { bySlug } from "@/lib/tools";

const tool = bySlug("unix-timestamp")!;

export default function Page() {
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));
  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  const [ts, setTs] = useState(String(Math.floor(Date.now() / 1000)));
  const [iso, setIso] = useState(new Date().toISOString());

  const fromTs = useMemo(() => {
    const n = Number(ts);
    if (!Number.isFinite(n)) return null;
    const ms = ts.length > 10 ? n : n * 1000;
    const d = new Date(ms);
    if (Number.isNaN(d.getTime())) return null;
    return d;
  }, [ts]);

  const fromIso = useMemo(() => {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? null : d;
  }, [iso]);

  return (
    <ToolShell tool={tool}>
      <div className="space-y-5">
        <div className="rounded-md border border-neutral-800 p-3 flex items-center justify-between">
          <div>
            <div className="text-xs text-neutral-400">Current Unix time</div>
            <div className="font-mono text-xl">{now}</div>
          </div>
          <CopyButton value={String(now)} />
        </div>

        <div>
          <label className="label">Unix timestamp → Date</label>
          <input className="field" value={ts} onChange={(e) => setTs(e.target.value)} />
          {fromTs && (
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="field">UTC: {fromTs.toUTCString()}</div>
              <div className="field">Local: {fromTs.toLocaleString()}</div>
              <div className="field">ISO: {fromTs.toISOString()}</div>
              <div className="field">Relative: {Math.round((Date.now() - fromTs.getTime()) / 1000)}s ago</div>
            </div>
          )}
        </div>

        <div>
          <label className="label">Date (ISO) → Unix</label>
          <input className="field" value={iso} onChange={(e) => setIso(e.target.value)} />
          {fromIso && (
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="field">Seconds: {Math.floor(fromIso.getTime() / 1000)}</div>
              <div className="field">Milliseconds: {fromIso.getTime()}</div>
            </div>
          )}
        </div>
      </div>
    </ToolShell>
  );
}
