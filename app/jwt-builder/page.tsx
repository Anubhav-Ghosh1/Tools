"use client";
import { useState, useEffect } from "react";
import ToolShell from "@/components/ToolShell";
import CopyButton from "@/components/CopyButton";
import { bySlug } from "@/lib/tools";

const tool = bySlug("jwt-builder")!;

type Alg = "HS256" | "HS384" | "HS512";
const ALG_HASH: Record<Alg, string> = { HS256: "SHA-256", HS384: "SHA-384", HS512: "SHA-512" };

function b64url(buf: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "/");
}
function b64urlStr(s: string) {
  return btoa(unescape(encodeURIComponent(s)))
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function buildJwt(headerStr: string, payloadStr: string, secret: string, alg: Alg) {
  const h = b64urlStr(headerStr);
  const p = b64urlStr(payloadStr);
  const data = `${h}.${p}`;
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: ALG_HASH[alg] }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return `${data}.${b64url(sig)}`;
}

const DEFAULT_HEADER = (alg: string) => JSON.stringify({ alg, typ: "JWT" }, null, 2);
const DEFAULT_PAYLOAD = JSON.stringify({
  sub: "1234567890",
  name: "Alice",
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600,
}, null, 2);

export default function Page() {
  const [alg, setAlg] = useState<Alg>("HS256");
  const [header, setHeader] = useState(DEFAULT_HEADER("HS256"));
  const [payload, setPayload] = useState(DEFAULT_PAYLOAD);
  const [secret, setSecret] = useState("your-256-bit-secret");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setHeader(DEFAULT_HEADER(alg));
  }, [alg]);

  useEffect(() => {
    setError("");
    setToken("");
    const id = setTimeout(async () => {
      try {
        JSON.parse(header);
        JSON.parse(payload);
        const t = await buildJwt(header, payload, secret, alg);
        setToken(t);
      } catch (e: unknown) {
        setError((e as Error).message);
      }
    }, 200);
    return () => clearTimeout(id);
  }, [header, payload, secret, alg]);

  const parts = token.split(".");

  return (
    <ToolShell tool={tool}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <label className="label pb-0 min-h-0">Algorithm</label>
              <div className="flex rounded-lg border border-neutral-700 overflow-hidden text-xs">
                {(["HS256", "HS384", "HS512"] as Alg[]).map((a) => (
                  <button key={a} onClick={() => setAlg(a)} className={`px-3 py-1.5 font-mono font-medium transition ${alg === a ? "bg-emerald-600 text-white" : "text-neutral-400 hover:bg-neutral-800"}`}>{a}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Header</label>
              <textarea className="field font-mono text-xs" rows={4} value={header} onChange={(e) => setHeader(e.target.value)} />
            </div>
            <div>
              <label className="label">Payload</label>
              <textarea className="field font-mono text-xs" rows={10} value={payload} onChange={(e) => setPayload(e.target.value)} />
            </div>
            <div>
              <label className="label">Secret</label>
              <input className="field" type="text" value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="your-secret-key" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="label">JWT Token</label>
              <CopyButton value={token} />
            </div>
            {error && <div className="err">{error}</div>}
            <textarea
              rows={6}
              readOnly
              value={token}
              className="field font-mono text-xs break-all"
            />
            {parts.length === 3 && (
              <div className="space-y-2 text-xs font-mono">
                <div className="rounded-lg bg-red-950/30 border border-red-800/40 p-2 break-all text-red-300">{parts[0]}</div>
                <div className="rounded-lg bg-purple-950/30 border border-purple-800/40 p-2 break-all text-purple-300">{parts[1]}</div>
                <div className="rounded-lg bg-cyan-950/30 border border-cyan-800/40 p-2 break-all text-cyan-300">{parts[2]}</div>
                <p className="text-neutral-600 text-[10px]">Red = header · Purple = payload · Cyan = signature</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
