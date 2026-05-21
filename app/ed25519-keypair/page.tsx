"use client";

import { useState } from "react";
import ToolShell from "@/components/ToolShell";
import CopyButton from "@/components/CopyButton";
import { bySlug } from "@/lib/tools";

const tool = bySlug("ed25519-keypair")!;

function toPem(buf: ArrayBuffer, type: "PRIVATE" | "PUBLIC") {
  let bin = "";
  new Uint8Array(buf).forEach((b) => (bin += String.fromCharCode(b)));
  const b64 = btoa(bin);
  const lines = b64.match(/.{1,64}/g)?.join("\n") || "";
  const label = type === "PRIVATE" ? "PRIVATE KEY" : "PUBLIC KEY";
  return `-----BEGIN ${label}-----\n${lines}\n-----END ${label}-----`;
}

export default function Page() {
  const [priv, setPriv] = useState("");
  const [pub, setPub] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const gen = async () => {
    setErr(""); setBusy(true); setPriv(""); setPub("");
    try {
      // Web Crypto Ed25519 support in modern browsers
      const kp = await (crypto.subtle as any).generateKey({ name: "Ed25519" }, true, ["sign", "verify"]);
      const sk = await crypto.subtle.exportKey("pkcs8", kp.privateKey);
      const pk = await crypto.subtle.exportKey("spki", kp.publicKey);
      setPriv(toPem(sk, "PRIVATE"));
      setPub(toPem(pk, "PUBLIC"));
    } catch (e: any) {
      setErr(e.message + " (Ed25519 requires recent Chrome/Firefox/Safari)");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-4">
        <button className="btn-primary" onClick={gen} disabled={busy}>{busy ? "Generating…" : "Generate Ed25519 keypair"}</button>
        {err && <div className="err">{err}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between">
              <label className="label">Public key (SPKI PEM)</label>
              <CopyButton value={pub} />
            </div>
            <textarea className="field" rows={8} value={pub} readOnly />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="label">Private key (PKCS#8 PEM)</label>
              <CopyButton value={priv} />
            </div>
            <textarea className="field" rows={8} value={priv} readOnly />
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
