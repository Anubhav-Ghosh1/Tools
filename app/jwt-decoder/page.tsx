"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/components/ToolShell";
import CopyButton from "@/components/CopyButton";
import { bySlug } from "@/lib/tools";

const tool = bySlug("jwt-decoder")!;

function b64urlDecode(s: string) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = s.length % 4;
  if (pad) s += "=".repeat(4 - pad);
  const bin = atob(s);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export default function Page() {
  const [token, setToken] = useState("");

  const { header, payload, sig, error } = useMemo(() => {
    if (!token) return { header: "", payload: "", sig: "", error: "" };
    try {
      const parts = token.trim().split(".");
      if (parts.length !== 3) throw new Error("JWT must have 3 dot-separated parts");
      const h = JSON.stringify(JSON.parse(b64urlDecode(parts[0])), null, 2);
      const p = JSON.stringify(JSON.parse(b64urlDecode(parts[1])), null, 2);
      return { header: h, payload: p, sig: parts[2], error: "" };
    } catch (e: any) {
      return { header: "", payload: "", sig: "", error: e.message };
    }
  }, [token]);

  return (
    <ToolShell tool={tool}>
      <div className="space-y-4">
        <div>
          <label className="label">JWT Token</label>
          <textarea className="field font-mono" rows={4} value={token} onChange={(e) => setToken(e.target.value)} placeholder="eyJhbGciOi…" />
        </div>
        {error && <div className="err">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between">
              <label className="label">Header</label>
              <CopyButton value={header} />
            </div>
            <textarea className="field" rows={8} value={header} readOnly />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="label">Payload</label>
              <CopyButton value={payload} />
            </div>
            <textarea className="field" rows={8} value={payload} readOnly />
          </div>
        </div>
        {sig && (
          <div>
            <label className="label">Signature (not verified)</label>
            <div className="field font-mono break-all">{sig}</div>
          </div>
        )}
      </div>
    </ToolShell>
  );
}
