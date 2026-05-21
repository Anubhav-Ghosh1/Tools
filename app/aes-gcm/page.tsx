"use client";

import { useState } from "react";
import ToolShell from "@/components/ToolShell";
import CopyButton from "@/components/CopyButton";
import { bySlug } from "@/lib/tools";

const tool = bySlug("aes-gcm")!;

function bytesToB64(b: Uint8Array) {
  let bin = "";
  b.forEach((x) => (bin += String.fromCharCode(x)));
  return btoa(bin);
}

function b64ToBytes(s: string) {
  const bin = atob(s);
  const a = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i);
  return a;
}

async function deriveKey(pass: string, salt: Uint8Array) {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(pass),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 250_000, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export default function Page() {
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt");
  const [pass, setPass] = useState("");
  const [text, setText] = useState("");
  const [out, setOut] = useState("");
  const [err, setErr] = useState("");

  const run = async () => {
    setErr(""); setOut("");
    try {
      if (mode === "encrypt") {
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const key = await deriveKey(pass, salt);
        const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(text)));
        const merged = new Uint8Array(salt.length + iv.length + ct.length);
        merged.set(salt, 0); merged.set(iv, salt.length); merged.set(ct, salt.length + iv.length);
        setOut(bytesToB64(merged));
      } else {
        const bytes = b64ToBytes(text);
        const salt = bytes.slice(0, 16);
        const iv = bytes.slice(16, 28);
        const ct = bytes.slice(28);
        const key = await deriveKey(pass, salt);
        const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
        setOut(new TextDecoder().decode(pt));
      }
    } catch (e: any) {
      setErr(e.message || "Operation failed");
    }
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-4">
        <div className="inline-flex rounded-md border border-neutral-700 overflow-hidden">
          <button className={`px-3 py-1.5 text-sm ${mode === "encrypt" ? "bg-neutral-700" : "bg-neutral-900"}`} onClick={() => setMode("encrypt")}>Encrypt</button>
          <button className={`px-3 py-1.5 text-sm ${mode === "decrypt" ? "bg-neutral-700" : "bg-neutral-900"}`} onClick={() => setMode("decrypt")}>Decrypt</button>
        </div>
        <div>
          <label className="label">Passphrase</label>
          <input type="password" className="field" value={pass} onChange={(e) => setPass(e.target.value)} />
        </div>
        <div>
          <label className="label">{mode === "encrypt" ? "Plaintext" : "Ciphertext (base64)"}</label>
          <textarea className="field" rows={6} value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        <button className="btn-primary" onClick={run} disabled={!pass || !text}>{mode === "encrypt" ? "Encrypt" : "Decrypt"}</button>
        {err && <div className="err">{err}</div>}
        {out && (
          <div>
            <div className="flex items-center justify-between">
              <label className="label">Output</label>
              <CopyButton value={out} />
            </div>
            <textarea className="field" rows={6} value={out} readOnly />
          </div>
        )}
      </div>
    </ToolShell>
  );
}
