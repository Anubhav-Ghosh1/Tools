"use client";
import { useEffect, useState } from "react";
import ToolShell from "@/components/ToolShell";
import CopyButton from "@/components/CopyButton";
import { bySlug } from "@/lib/tools";

const tool = bySlug("ip-info")!;

interface IpData {
  ip: string; city: string; region: string; country_name: string;
  postal: string; latitude: number; longitude: number;
  timezone: string; org: string;
}

async function fetchIp(addr = "") {
  const url = addr ? `https://ipapi.co/${addr}/json/` : "https://ipapi.co/json/";
  const r = await fetch(url);
  const d = await r.json();
  if (d.error) throw new Error(d.reason || "Lookup failed");
  return d as IpData;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-neutral-800/60 last:border-0">
      <span className="text-xs text-neutral-500 w-32 shrink-0">{label}</span>
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm font-mono truncate">{value || "—"}</span>
        {value && <CopyButton value={value} />}
      </div>
    </div>
  );
}

function IpCard({ d }: { d: IpData }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-1">
      <Row label="IP Address" value={d.ip} />
      <Row label="City" value={d.city} />
      <Row label="Region" value={d.region} />
      <Row label="Country" value={d.country_name} />
      <Row label="Postal Code" value={d.postal} />
      <Row label="Coordinates" value={`${d.latitude}, ${d.longitude}`} />
      <Row label="Timezone" value={d.timezone} />
      <Row label="ISP / Org" value={d.org} />
    </div>
  );
}

export default function Page() {
  const [myIp, setMyIp] = useState<IpData | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [lookup, setLookup] = useState("");
  const [lookupResult, setLookupResult] = useState<IpData | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupErr, setLookupErr] = useState("");

  useEffect(() => {
    fetchIp()
      .then(setMyIp)
      .catch(() => setErr("Failed to fetch IP info"))
      .finally(() => setLoading(false));
  }, []);

  async function doLookup() {
    if (!lookup.trim()) return;
    setLookupLoading(true);
    setLookupErr("");
    setLookupResult(null);
    try {
      setLookupResult(await fetchIp(lookup.trim()));
    } catch (e: unknown) {
      setLookupErr((e as Error).message);
    } finally {
      setLookupLoading(false);
    }
  }

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold mb-3">Your IP</h3>
          {loading && <div className="text-sm text-neutral-500 animate-pulse">Looking up…</div>}
          {err && <div className="err">{err}</div>}
          {myIp && <IpCard d={myIp} />}
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3">Look up any IP or domain</h3>
          <div className="flex gap-2">
            <input
              className="field flex-1"
              placeholder="8.8.8.8 or example.com"
              value={lookup}
              onChange={(e) => setLookup(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && doLookup()}
            />
            <button className="btn-primary" onClick={doLookup} disabled={lookupLoading}>
              {lookupLoading ? "…" : "Lookup"}
            </button>
          </div>
          {lookupErr && <div className="err mt-3">{lookupErr}</div>}
          {lookupResult && <div className="mt-3"><IpCard d={lookupResult} /></div>}
        </div>

        <p className="text-xs text-neutral-700">Data via ipapi.co — queries sent to their servers. Do not enter sensitive IPs.</p>
      </div>
    </ToolShell>
  );
}
