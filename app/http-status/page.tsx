"use client";
import { useMemo, useState } from "react";
import ToolShell from "@/components/ToolShell";
import CopyButton from "@/components/CopyButton";
import { bySlug } from "@/lib/tools";

const tool = bySlug("http-status")!;

const STATUSES = [
  // 1xx
  { code: 100, name: "Continue", desc: "Server received request headers; client should proceed." },
  { code: 101, name: "Switching Protocols", desc: "Switching to protocol specified in Upgrade header (e.g., WebSocket)." },
  { code: 102, name: "Processing", desc: "WebDAV: request received, no response yet." },
  { code: 103, name: "Early Hints", desc: "Preload resources before final response headers." },
  // 2xx
  { code: 200, name: "OK", desc: "Standard success response." },
  { code: 201, name: "Created", desc: "Resource created. Include Location header pointing to new resource." },
  { code: 202, name: "Accepted", desc: "Request accepted for processing, not yet complete (async)." },
  { code: 204, name: "No Content", desc: "Success with no body. Common for DELETE." },
  { code: 206, name: "Partial Content", desc: "Range request succeeded. Used for resumable downloads." },
  // 3xx
  { code: 301, name: "Moved Permanently", desc: "Resource moved; update links. Caches permanent redirect." },
  { code: 302, name: "Found", desc: "Temporary redirect. Original URL may be used again." },
  { code: 303, name: "See Other", desc: "Redirect to GET another URL (after POST/PUT/DELETE)." },
  { code: 304, name: "Not Modified", desc: "Cached version is still valid. No body returned." },
  { code: 307, name: "Temporary Redirect", desc: "Temporary redirect; method and body preserved." },
  { code: 308, name: "Permanent Redirect", desc: "Permanent redirect; method and body preserved." },
  // 4xx
  { code: 400, name: "Bad Request", desc: "Malformed request syntax, invalid framing, or deceptive routing." },
  { code: 401, name: "Unauthorized", desc: "Authentication required. Not authenticated." },
  { code: 403, name: "Forbidden", desc: "Authenticated but not permitted. Access denied." },
  { code: 404, name: "Not Found", desc: "Resource does not exist at this URL." },
  { code: 405, name: "Method Not Allowed", desc: "HTTP method not supported for this endpoint." },
  { code: 408, name: "Request Timeout", desc: "Server timed out waiting for the request." },
  { code: 409, name: "Conflict", desc: "Conflict with current state (e.g., duplicate key)." },
  { code: 410, name: "Gone", desc: "Resource permanently deleted. Unlike 404, won't come back." },
  { code: 413, name: "Content Too Large", desc: "Request body exceeds server limit." },
  { code: 415, name: "Unsupported Media Type", desc: "Content-Type not supported by this endpoint." },
  { code: 422, name: "Unprocessable Content", desc: "Semantically invalid (common in REST APIs for validation errors)." },
  { code: 425, name: "Too Early", desc: "Request in early data that might be replayed." },
  { code: 429, name: "Too Many Requests", desc: "Rate limit exceeded. Check Retry-After header." },
  { code: 451, name: "Unavailable For Legal Reasons", desc: "Access denied due to legal demand (censorship)." },
  // 5xx
  { code: 500, name: "Internal Server Error", desc: "Generic server error. Check logs." },
  { code: 501, name: "Not Implemented", desc: "Server does not support the request method." },
  { code: 502, name: "Bad Gateway", desc: "Proxy received invalid response from upstream." },
  { code: 503, name: "Service Unavailable", desc: "Server temporarily overloaded or down for maintenance." },
  { code: 504, name: "Gateway Timeout", desc: "Upstream server timed out." },
  { code: 505, name: "HTTP Version Not Supported", desc: "Server does not support the HTTP version." },
];

const RANGE_COLOR: Record<number, string> = {
  1: "text-blue-400 bg-blue-950/30 border-blue-800/40",
  2: "text-emerald-400 bg-emerald-950/30 border-emerald-800/40",
  3: "text-yellow-400 bg-yellow-950/30 border-yellow-800/40",
  4: "text-orange-400 bg-orange-950/30 border-orange-800/40",
  5: "text-red-400 bg-red-950/30 border-red-800/40",
};
const RANGE_LABEL: Record<number, string> = {
  1: "1xx Informational", 2: "2xx Success", 3: "3xx Redirection", 4: "4xx Client Error", 5: "5xx Server Error",
};

export default function Page() {
  const [q, setQ] = useState("");
  const [range, setRange] = useState(0);

  const filtered = useMemo(() =>
    STATUSES.filter((s) => {
      const matchRange = !range || Math.floor(s.code / 100) === range;
      const matchQ = !q || String(s.code).includes(q) || s.name.toLowerCase().includes(q.toLowerCase()) || s.desc.toLowerCase().includes(q.toLowerCase());
      return matchRange && matchQ;
    }),
    [q, range]
  );

  const grouped = useMemo(() => {
    const m = new Map<number, typeof STATUSES>();
    for (const s of filtered) {
      const r = Math.floor(s.code / 100);
      if (!m.has(r)) m.set(r, []);
      m.get(r)!.push(s);
    }
    return m;
  }, [filtered]);

  return (
    <ToolShell tool={tool}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <input className="field flex-1 min-w-48" placeholder="Search by code or name…" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="flex gap-1 flex-wrap">
            {[0, 1, 2, 3, 4, 5].map((r) => (
              <button key={r} onClick={() => setRange(r === range ? 0 : r)} className={`px-3 py-1.5 rounded-lg text-xs border font-medium transition ${range === r && r !== 0 ? "bg-neutral-700 text-white border-neutral-600" : "border-neutral-700 text-neutral-400 hover:border-neutral-500"}`}>
                {r === 0 ? "All" : `${r}xx`}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {[...grouped.entries()].map(([r, statuses]) => (
            <section key={r} className="space-y-1.5">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-500">{RANGE_LABEL[r]}</h3>
              {statuses.map((s) => (
                <div key={s.code} className={`rounded-xl border p-3 flex items-start gap-3 ${RANGE_COLOR[r]}`}>
                  <div className="flex items-center gap-2 shrink-0 min-w-[3.5rem]">
                    <span className="font-mono text-base font-bold">{s.code}</span>
                    <CopyButton value={String(s.code)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{s.name}</div>
                    <div className="text-xs opacity-70 mt-0.5 leading-relaxed">{s.desc}</div>
                  </div>
                </div>
              ))}
            </section>
          ))}
          {filtered.length === 0 && <p className="text-sm text-neutral-500 py-6 text-center">No status codes match.</p>}
        </div>
      </div>
    </ToolShell>
  );
}
