"use client";

import { useState } from "react";
import ToolShell from "@/components/ToolShell";
import CopyButton from "@/components/CopyButton";
import { bySlug } from "@/lib/tools";

const tool = bySlug("rsa-keypair")!;

function toPem(buf: ArrayBuffer, type: "PRIVATE" | "PUBLIC") {
  let bin = "";
  new Uint8Array(buf).forEach((b) => (bin += String.fromCharCode(b)));
  const b64 = btoa(bin);
  const lines = b64.match(/.{1,64}/g)?.join("\n") || "";
  const label = type === "PRIVATE" ? "PRIVATE KEY" : "PUBLIC KEY";
  return `-----BEGIN ${label}-----\n${lines}\n-----END ${label}-----`;
}

export default function Page() {
  const [bits, setBits] = useState(2048);
  const [priv, setPriv] = useState("");
  const [pub, setPub] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const gen = async () => {
    setErr(""); setBusy(true); setPriv(""); setPub("");
    try {
      const kp = await crypto.subtle.generateKey(
        { name: "RSA-OAEP", modulusLength: bits, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
        true,
        ["encrypt", "decrypt"]
      );
      const sk = await crypto.subtle.exportKey("pkcs8", kp.privateKey);
      const pk = await crypto.subtle.exportKey("spki", kp.publicKey);
      setPriv(toPem(sk, "PRIVATE"));
      setPub(toPem(pk, "PUBLIC"));
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-4">
        <div className="flex items-end gap-3 flex-wrap">
          <div>
            <label className="label">Modulus size</label>
            <select className="field" value={bits} onChange={(e) => setBits(Number(e.target.value))}>
              <option value={2048}>2048</option>
              <option value={3072}>3072</option>
              <option value={4096}>4096</option>
            </select>
          </div>
          <button className="btn-primary" onClick={gen} disabled={busy}>{busy ? "Generating…" : "Generate"}</button>
        </div>
        {err && <div className="err">{err}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between">
              <label className="label">Public key (SPKI PEM)</label>
              <CopyButton value={pub} />
            </div>
            <textarea className="field" rows={12} value={pub} readOnly />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="label">Private key (PKCS#8 PEM)</label>
              <CopyButton value={priv} />
            </div>
            <textarea className="field" rows={12} value={priv} readOnly />
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
