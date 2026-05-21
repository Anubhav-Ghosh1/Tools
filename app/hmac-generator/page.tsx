"use client";

import { useEffect, useState } from "react";
import ToolShell from "@/components/ToolShell";
import CopyButton from "@/components/CopyButton";
import { bySlug } from "@/lib/tools";

const tool = bySlug("hmac-generator")!;
const ALGS = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"] as const;

function toHex(buf: ArrayBuffer) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function toB64(buf: ArrayBuffer) {
  let bin = "";
  new Uint8Array(buf).forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin);
}

export default function Page() {
  const [msg, setMsg] = useState("");
  const [secret, setSecret] = useState("");
  const [alg, setAlg] = useState<typeof ALGS[number]>("SHA-256");
  const [hex, setHex] = useState("");
  const [b64, setB64] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    let active = true;
    if (!msg || !secret) { setHex(""); setB64(""); setErr(""); return; }
    (async () => {
      try {
        const key = await crypto.subtle.importKey(
          "raw",
          new TextEncoder().encode(secret),
          { name: "HMAC", hash: alg },
          false,
          ["sign"]
        );
        const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(msg));
        if (!active) return;
        setHex(toHex(sig));
        setB64(toB64(sig));
        setErr("");
      } catch (e: any) {
        setErr(e.message);
      }
    })();
    return () => { active = false; };
  }, [msg, secret, alg]);

  return (
    <ToolShell tool={tool}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Message</label>
            <textarea className="field" value={msg} onChange={(e) => setMsg(e.target.value)} />
          </div>
          <div>
            <label className="label">Secret key</label>
            <textarea className="field" value={secret} onChange={(e) => setSecret(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">Algorithm</label>
          <select className="field" value={alg} onChange={(e) => setAlg(e.target.value as any)}>
            {ALGS.map((a) => <option key={a} value={a}>HMAC-{a}</option>)}
          </select>
        </div>
        {err && <div className="err">{err}</div>}
        <div>
          <div className="flex items-center justify-between">
            <label className="label">Hex</label>
            <CopyButton value={hex} />
          </div>
          <div className="field break-all">{hex || "—"}</div>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="label">Base64</label>
            <CopyButton value={b64} />
          </div>
          <div className="field break-all">{b64 || "—"}</div>
        </div>
      </div>
    </ToolShell>
  );
}
