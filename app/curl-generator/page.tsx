"use client";
import { useMemo, useState } from "react";
import ToolShell from "@/components/ToolShell";
import CopyButton from "@/components/CopyButton";
import { bySlug } from "@/lib/tools";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";

const tool = bySlug("curl-generator")!;

type Method  = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";
type BodyType = "none" | "json" | "form" | "multipart" | "graphql" | "raw";
type AuthType = "none" | "bearer" | "basic" | "apikey";
type ExportLang = "curl" | "fetch" | "axios" | "python";

interface KV { key: string; value: string; enabled: boolean }

const METHODS: Method[] = ["GET","POST","PUT","PATCH","DELETE","HEAD","OPTIONS"];
const METHOD_STYLE: Record<Method, string> = {
  GET:    "bg-emerald-600/20 text-emerald-400 border-emerald-700/50",
  POST:   "bg-blue-600/20 text-blue-400 border-blue-700/50",
  PUT:    "bg-yellow-600/20 text-yellow-400 border-yellow-700/50",
  PATCH:  "bg-orange-600/20 text-orange-400 border-orange-700/50",
  DELETE: "bg-red-600/20 text-red-400 border-red-700/50",
  HEAD:   "bg-purple-600/20 text-purple-400 border-purple-700/50",
  OPTIONS:"bg-cyan-600/20 text-cyan-400 border-cyan-700/50",
};

function kv(): KV { return { key:"", value:"", enabled:true }; }

function buildUrl(base: string, params: KV[]) {
  const active = params.filter(p => p.enabled && p.key.trim());
  if (!active.length) return base;
  const qs = active.map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`).join("&");
  return base.includes("?") ? `${base}&${qs}` : `${base}?${qs}`;
}

function buildCurl(url: string, method: Method, authType: AuthType, bearer: string,
  basicUser: string, basicPass: string, apiKeyName: string, apiKeyVal: string,
  headers: KV[], bodyType: BodyType, body: string, fields: KV[],
  followRedirects: boolean, verbose: boolean, insecure: boolean, silent: boolean, timeout: string
): string {
  if (!url.trim()) return "";
  const p: string[] = ["curl"];
  if (method !== "GET") p.push(`-X ${method}`);
  if (verbose) p.push("-v"); else if (silent) p.push("-s");
  if (followRedirects) p.push("-L");
  if (insecure) p.push("-k");
  if (timeout) p.push(`--max-time ${timeout}`);
  if (authType === "basic" && basicUser) p.push(`-u '${basicUser}:${basicPass}'`);
  if (authType === "bearer" && bearer) p.push(`-H 'Authorization: Bearer ${bearer}'`);
  if (authType === "apikey" && apiKeyName) p.push(`-H '${apiKeyName}: ${apiKeyVal}'`);
  if (bodyType === "json" && !headers.some(h=>h.key.toLowerCase()==="content-type"))
    p.push(`-H 'Content-Type: application/json'`);
  if (bodyType === "form" && !headers.some(h=>h.key.toLowerCase()==="content-type"))
    p.push(`-H 'Content-Type: application/x-www-form-urlencoded'`);
  if (bodyType === "graphql" && !headers.some(h=>h.key.toLowerCase()==="content-type"))
    p.push(`-H 'Content-Type: application/json'`);
  headers.filter(h=>h.enabled&&h.key.trim()).forEach(h =>
    p.push(`-H '${h.key}: ${h.value.replace(/'/g,"\\'")}'`));
  if ((bodyType==="json"||bodyType==="raw") && body.trim())
    p.push(`-d '${body.replace(/'/g,"\\'")}'`);
  else if (bodyType==="graphql" && body.trim())
    p.push(`-d '${JSON.stringify({query:body}).replace(/'/g,"\\'")}'`);
  else if (bodyType==="form")
    fields.filter(f=>f.enabled&&f.key.trim()).forEach(f=>p.push(`--data-urlencode '${f.key}=${f.value}'`));
  else if (bodyType==="multipart")
    fields.filter(f=>f.enabled&&f.key.trim()).forEach(f=>p.push(`-F '${f.key}=${f.value}'`));
  p.push(`'${url.trim()}'`);
  return p.join(" \\\n  ");
}

function buildFetch(url: string, method: Method, authType: AuthType, bearer: string,
  apiKeyName: string, apiKeyVal: string, headers: KV[], bodyType: BodyType, body: string, fields: KV[]
): string {
  const h: Record<string,string> = {};
  if (authType==="bearer" && bearer) h["Authorization"] = `Bearer ${bearer}`;
  if (authType==="apikey" && apiKeyName) h[apiKeyName] = apiKeyVal;
  if (bodyType==="json") h["Content-Type"] = "application/json";
  if (bodyType==="graphql") h["Content-Type"] = "application/json";
  headers.filter(hh=>hh.enabled&&hh.key.trim()).forEach(hh=>{ h[hh.key]=hh.value; });
  const headersStr = Object.keys(h).length
    ? `,\n  headers: {\n${Object.entries(h).map(([k,v])=>`    "${k}": "${v}"`).join(",\n")}\n  }` : "";
  let bodyStr = "";
  if ((bodyType==="json"||bodyType==="raw") && body.trim())
    bodyStr = `,\n  body: ${bodyType==="json"?`JSON.stringify(${body})`:`\`${body.replace(/`/g,"\\`")}\``}`;
  else if (bodyType==="graphql" && body.trim())
    bodyStr = `,\n  body: JSON.stringify({ query: \`${body}\` })`;
  else if (bodyType==="form") {
    const lines = fields.filter(f=>f.enabled&&f.key).map(f=>`  fd.append("${f.key}", "${f.value}");`).join("\n");
    if (lines) bodyStr = `;\nconst fd = new FormData();\n${lines}`;
  }
  const methodStr = method!=="GET" ? `\n  method: "${method}"` : "";
  return `const res = await fetch("${url}", {${methodStr}${headersStr}${bodyStr}\n});\nconst data = await res.json();\nconsole.log(data);`;
}

function buildPython(url: string, method: Method, authType: AuthType, bearer: string,
  basicUser: string, basicPass: string, apiKeyName: string, apiKeyVal: string,
  headers: KV[], bodyType: BodyType, body: string, fields: KV[]
): string {
  const h: Record<string,string> = {};
  if (authType==="bearer" && bearer) h["Authorization"] = `Bearer ${bearer}`;
  if (authType==="apikey" && apiKeyName) h[apiKeyName] = apiKeyVal;
  headers.filter(hh=>hh.enabled&&hh.key.trim()).forEach(hh=>{ h[hh.key]=hh.value; });
  const headersLine = Object.keys(h).length
    ? `headers = {\n${Object.entries(h).map(([k,v])=>`    "${k}": "${v}"`).join(",\n")}\n}\n` : "";
  const authLine = authType==="basic"&&basicUser ? `auth = ("${basicUser}", "${basicPass}")\n` : "";
  let call = `requests.${method.toLowerCase()}(\n    "${url}"`;
  if (headersLine) call += `,\n    headers=headers`;
  if (authLine) call += `,\n    auth=auth`;
  if (bodyType==="json"&&body.trim()) {
    try { JSON.parse(body); call += `,\n    json=${body.replace(/"/g,"'")}`; } catch { call += `,\n    data="""${body}"""`; }
  } else if (bodyType==="form") {
    const data = `{${fields.filter(f=>f.enabled&&f.key).map(f=>`"${f.key}":"${f.value}"`).join(",")}}`;
    call += `,\n    data=${data}`;
  } else if (bodyType==="raw"&&body.trim()) call += `,\n    data="""${body}"""`;
  call += "\n)";
  return `import requests\n\n${headersLine}${authLine}\nresponse = ${call}\nprint(response.json())`;
}

function buildAxios(url: string, method: Method, authType: AuthType, bearer: string,
  apiKeyName: string, apiKeyVal: string, headers: KV[], bodyType: BodyType, body: string
): string {
  const h: Record<string,string> = {};
  if (authType==="bearer" && bearer) h["Authorization"] = `Bearer ${bearer}`;
  if (authType==="apikey" && apiKeyName) h[apiKeyName] = apiKeyVal;
  headers.filter(hh=>hh.enabled&&hh.key.trim()).forEach(hh=>{ h[hh.key]=hh.value; });
  const headersStr = Object.keys(h).length
    ? `\n  headers: {\n${Object.entries(h).map(([k,v])=>`    "${k}": "${v}"`).join(",\n")}\n  }` : "";
  const hasBody = (bodyType==="json"||bodyType==="raw") && body.trim();
  const dataStr = hasBody ? `,\n  data: ${bodyType==="json"?body:`\`${body}\``}` : "";
  return `import axios from "axios";\n\nconst res = await axios.${method.toLowerCase()}("${url}", {${headersStr}${dataStr}\n});\nconsole.log(res.data);`;
}

// ── Section component ──────────────────────────────────
function Section({ title, badge, defaultOpen=false, children }: {
  title: string; badge?: string | number; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-neutral-800 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-3 text-left bg-neutral-900/40 hover:bg-neutral-900/60 transition"
      >
        {open ? <ChevronDown size={14} className="text-neutral-500 shrink-0" /> : <ChevronRight size={14} className="text-neutral-500 shrink-0" />}
        <span className="text-sm font-medium">{title}</span>
        {badge !== undefined && badge !== 0 && (
          <span className="ml-1 bg-emerald-600/20 text-emerald-400 border border-emerald-700/40 text-[10px] px-1.5 py-0.5 rounded-full font-mono">{badge}</span>
        )}
      </button>
      {open && <div className="px-4 pb-4 pt-3 space-y-3">{children}</div>}
    </div>
  );
}

// ── KV table component ─────────────────────────────────
function KVTable({ list, set, keyPh, valPh }: {
  list: KV[]; set: (v: KV[]) => void; keyPh: string; valPh: string;
}) {
  function upd(i: number, f: keyof KV, v: string | boolean) {
    set(list.map((r,idx) => idx===i ? {...r,[f]:v} : r));
  }
  function del(i: number) { set(list.filter((_,idx)=>idx!==i)); }

  return (
    <div className="rounded-lg border border-neutral-800 overflow-hidden text-sm">
      {list.length > 0 && (
        <div className="grid grid-cols-[1.5rem_1fr_1fr_1.5rem] gap-px bg-neutral-800">
          {/* header row */}
          <div className="bg-neutral-900/80 px-2 py-1.5" />
          <div className="bg-neutral-900/80 px-3 py-1.5 text-[10px] uppercase tracking-widest text-neutral-500 font-medium">Key</div>
          <div className="bg-neutral-900/80 px-3 py-1.5 text-[10px] uppercase tracking-widest text-neutral-500 font-medium">Value</div>
          <div className="bg-neutral-900/80" />
        </div>
      )}
      <div className="divide-y divide-neutral-800/60">
        {list.map((row, i) => (
          <div key={i} className={`grid grid-cols-[1.5rem_1fr_1fr_1.5rem] gap-px bg-neutral-800 ${!row.enabled ? "opacity-50" : ""}`}>
            <div className="bg-neutral-950 flex items-center justify-center">
              <input
                type="checkbox"
                checked={row.enabled}
                onChange={e => upd(i, "enabled", e.target.checked)}
                className="w-3 h-3 cursor-pointer"
              />
            </div>
            <input
              className="bg-neutral-950 px-3 py-2 text-xs font-mono outline-none focus:bg-neutral-900 transition placeholder:text-neutral-700"
              placeholder={keyPh}
              value={row.key}
              onChange={e => upd(i, "key", e.target.value)}
            />
            <input
              className="bg-neutral-950 px-3 py-2 text-xs font-mono outline-none focus:bg-neutral-900 transition placeholder:text-neutral-700"
              placeholder={valPh}
              value={row.value}
              onChange={e => upd(i, "value", e.target.value)}
            />
            <div className="bg-neutral-950 flex items-center justify-center">
              <button onClick={() => del(i)} className="text-neutral-700 hover:text-red-400 transition p-0.5">
                <Trash2 size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-neutral-950 px-3 py-2">
        <button
          onClick={() => set([...list, kv()])}
          className="flex items-center gap-1 text-xs text-neutral-500 hover:text-emerald-400 transition"
        >
          <Plus size={12} /> Add row
        </button>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────
export default function Page() {
  const [url,      setUrl]      = useState("https://api.example.com/users");
  const [method,   setMethod]   = useState<Method>("GET");
  const [params,   setParams]   = useState<KV[]>([kv()]);
  const [authType, setAuthType] = useState<AuthType>("bearer");
  const [bearer,   setBearer]   = useState("YOUR_TOKEN");
  const [basicUser,setBasicUser]= useState("");
  const [basicPass,setBasicPass]= useState("");
  const [apiKeyName,setApiKeyName]=useState("X-API-Key");
  const [apiKeyVal, setApiKeyVal] =useState("YOUR_KEY");
  const [apiKeyIn,  setApiKeyIn]  =useState<"header"|"query">("header");
  const [headers,  setHeaders]  = useState<KV[]>([{key:"Accept",value:"application/json",enabled:true}]);
  const [bodyType, setBodyType] = useState<BodyType>("none");
  const [body,     setBody]     = useState(`{\n  "name": "Alice",\n  "email": "alice@example.com"\n}`);
  const [fields,   setFields]   = useState<KV[]>([{key:"name",value:"Alice",enabled:true},{key:"email",value:"alice@example.com",enabled:true}]);
  const [followRedirects, setFollowRedirects] = useState(true);
  const [verbose,  setVerbose]  = useState(false);
  const [insecure, setInsecure] = useState(false);
  const [silent,   setSilent]   = useState(true);
  const [timeout,  setTimeoutV] = useState("");
  const [lang,     setLang]     = useState<ExportLang>("curl");

  const fullUrl = useMemo(() => {
    const base = buildUrl(url, params);
    if (authType==="apikey" && apiKeyIn==="query" && apiKeyName)
      return buildUrl(base, [{key:apiKeyName,value:apiKeyVal,enabled:true}]);
    return base;
  }, [url, params, authType, apiKeyName, apiKeyVal, apiKeyIn]);

  const output = useMemo(() => {
    switch(lang) {
      case "curl":   return buildCurl(fullUrl, method, authType, bearer, basicUser, basicPass, apiKeyName, apiKeyVal, headers, bodyType, body, fields, followRedirects, verbose, insecure, silent, timeout);
      case "fetch":  return buildFetch(fullUrl, method, authType, bearer, apiKeyName, apiKeyVal, headers, bodyType, body, fields);
      case "python": return buildPython(fullUrl, method, authType, bearer, basicUser, basicPass, apiKeyName, apiKeyVal, headers, bodyType, body, fields);
      case "axios":  return buildAxios(fullUrl, method, authType, bearer, apiKeyName, apiKeyVal, headers, bodyType, body);
    }
  }, [lang, fullUrl, method, authType, bearer, basicUser, basicPass, apiKeyName, apiKeyVal, headers, bodyType, body, fields, followRedirects, verbose, insecure, silent, timeout]);

  const activeParams  = params.filter(p=>p.enabled&&p.key.trim()).length;
  const activeHeaders = headers.filter(h=>h.enabled&&h.key.trim()).length;

  return (
    <ToolShell tool={tool}>
      <div className="space-y-4">

        {/* ── URL bar ── */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-3">
          <div className="flex gap-2 items-center">
            {/* Method select */}
            <div className="relative">
              <select
                value={method}
                onChange={e => {
                  const m = e.target.value as Method;
                  setMethod(m);
                  if (m==="GET"||m==="HEAD") setBodyType("none");
                  else if (bodyType==="none") setBodyType("json");
                }}
                className={`appearance-none border rounded-lg px-3 py-2 text-xs font-mono font-bold bg-transparent cursor-pointer outline-none pr-7 ${METHOD_STYLE[method]}`}
              >
                {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-60" />
            </div>
            {/* URL input */}
            <input
              className="flex-1 bg-transparent outline-none font-mono text-sm placeholder:text-neutral-600"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://api.example.com/endpoint"
            />
          </div>
          {/* Full URL preview */}
          {fullUrl !== url && (
            <div className="mt-2 pt-2 border-t border-neutral-800/60 flex items-center gap-2">
              <span className="text-[10px] text-neutral-600 shrink-0">FULL URL</span>
              <code className="text-[11px] font-mono text-emerald-400 break-all">{fullUrl}</code>
            </div>
          )}
        </div>

        {/* ── Sections ── */}
        <Section title="Query Params" badge={activeParams}>
          <KVTable list={params} set={setParams} keyPh="param" valPh="value" />
        </Section>

        <Section title="Authorization" badge={authType !== "none" ? authType : undefined} defaultOpen>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {(["none","bearer","basic","apikey"] as AuthType[]).map(a => (
              <button key={a} onClick={() => setAuthType(a)}
                className={`px-3 py-1 rounded-lg text-xs border font-medium transition ${authType===a ? "bg-neutral-700 border-neutral-600 text-white" : "border-neutral-700 text-neutral-400 hover:border-neutral-500"}`}>
                {a==="bearer"?"Bearer Token":a==="apikey"?"API Key":a==="basic"?"Basic Auth":"No Auth"}
              </button>
            ))}
          </div>
          {authType==="bearer" && (
            <div>
              <label className="label">Token</label>
              <input className="field font-mono" value={bearer} onChange={e=>setBearer(e.target.value)} placeholder="eyJhbGci…" />
              <p className="mt-1.5 text-xs text-neutral-600">Sent as <code className="font-mono">Authorization: Bearer &lt;token&gt;</code></p>
            </div>
          )}
          {authType==="basic" && (
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Username</label><input className="field" value={basicUser} onChange={e=>setBasicUser(e.target.value)} placeholder="user" /></div>
              <div><label className="label">Password</label><input className="field" type="password" value={basicPass} onChange={e=>setBasicPass(e.target.value)} placeholder="••••••" /></div>
            </div>
          )}
          {authType==="apikey" && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label">Add to</label>
                <div className="flex rounded-lg border border-neutral-700 overflow-hidden text-xs">
                  {(["header","query"] as const).map(loc => (
                    <button key={loc} onClick={()=>setApiKeyIn(loc)} className={`flex-1 px-3 py-1.5 font-medium capitalize transition ${apiKeyIn===loc?"bg-neutral-700 text-white":"text-neutral-400 hover:bg-neutral-800"}`}>{loc}</button>
                  ))}
                </div>
              </div>
              <div><label className="label">Key name</label><input className="field font-mono" value={apiKeyName} onChange={e=>setApiKeyName(e.target.value)} placeholder="X-API-Key" /></div>
              <div><label className="label">Value</label><input className="field font-mono" value={apiKeyVal} onChange={e=>setApiKeyVal(e.target.value)} placeholder="key…" /></div>
            </div>
          )}
        </Section>

        <Section title="Headers" badge={activeHeaders} defaultOpen>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {[["Content-Type","application/json"],["Accept","application/json"],["Cache-Control","no-cache"],["X-Request-ID",""]].map(([k,v])=>(
              <button key={k} onClick={()=>setHeaders(h=>[...h,{key:k,value:v,enabled:true}])}
                className="text-[10px] border border-neutral-800 rounded px-2 py-0.5 text-neutral-500 hover:border-neutral-600 hover:text-neutral-300 transition font-mono">
                + {k}
              </button>
            ))}
          </div>
          <KVTable list={headers} set={setHeaders} keyPh="Header-Name" valPh="value" />
        </Section>

        {method!=="GET"&&method!=="HEAD" && (
          <Section title="Body" badge={bodyType!=="none"?bodyType:undefined} defaultOpen>
            <div className="flex flex-wrap gap-0.5 rounded-lg border border-neutral-700 overflow-hidden w-fit mb-3">
              {(["none","json","form","multipart","graphql","raw"] as BodyType[]).map(t=>(
                <button key={t} onClick={()=>setBodyType(t)}
                  className={`px-3 py-1.5 text-xs font-medium uppercase tracking-wide transition ${bodyType===t?"bg-emerald-600 text-white":"text-neutral-400 hover:bg-neutral-800"}`}>
                  {t}
                </button>
              ))}
            </div>
            {(bodyType==="json"||bodyType==="raw") && (
              <textarea className="field font-mono text-xs" rows={8} value={body} onChange={e=>setBody(e.target.value)} placeholder={bodyType==="json"?'{\n  "key": "value"\n}':"Raw body"} />
            )}
            {bodyType==="graphql" && (
              <>
                <textarea className="field font-mono text-xs" rows={8} value={body} onChange={e=>setBody(e.target.value)} placeholder={"query {\n  users { id name }\n}"} />
                <p className="text-xs text-neutral-600">Wrapped as <code className="font-mono">{"{ \"query\": \"...\" }"}</code></p>
              </>
            )}
            {(bodyType==="form"||bodyType==="multipart") && (
              <KVTable list={fields} set={setFields} keyPh="field" valPh="value" />
            )}
          </Section>
        )}

        <Section title="Options">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {([
              ["Follow redirects (-L)", followRedirects, setFollowRedirects],
              ["Silent (-s)",           silent,          setSilent],
              ["Verbose (-v)",          verbose,         setVerbose],
              ["Allow insecure (-k)",   insecure,        setInsecure],
            ] as const).map(([label,val,setter])=>(
              <label key={label as string} className="flex items-center gap-2 text-xs text-neutral-400 cursor-pointer">
                <input type="checkbox" checked={val as boolean} onChange={e=>(setter as (v:boolean)=>void)(e.target.checked)} />
                {label as string}
              </label>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-neutral-500">Timeout (s)</span>
            <input type="number" className="field py-1 w-24 text-xs" value={timeout} onChange={e=>setTimeoutV(e.target.value)} placeholder="none" />
          </div>
        </Section>

        {/* ── Output ── */}
        <div className="rounded-xl border border-neutral-700 overflow-hidden">
          <div className="flex items-center gap-0.5 bg-neutral-900/60 border-b border-neutral-800 px-3 py-2 flex-wrap justify-between">
            <div className="flex gap-0.5">
              {([["curl","cURL"],["fetch","JS Fetch"],["axios","Axios"],["python","Python"]] as [ExportLang,string][]).map(([l,label])=>(
                <button key={l} onClick={()=>setLang(l)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition ${lang===l?"bg-neutral-700 text-white":"text-neutral-400 hover:text-neutral-200"}`}>
                  {label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {lang==="curl" && <CopyButton value={output.replace(/\s*\\\n\s*/g," ")} label="One line" />}
              <CopyButton value={output} />
            </div>
          </div>
          <pre className="px-4 py-4 font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap break-all text-neutral-300">
            {output || <span className="text-neutral-700">Enter a URL above to generate code…</span>}
          </pre>
        </div>

      </div>
    </ToolShell>
  );
}
