"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { tools } from "@/lib/tools";
import { useHistory } from "@/hooks/useHistory";
import ToolIcon from "@/components/ToolIcon";

export default function SearchPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { history } = useHistory();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  const results = query.trim()
    ? tools.filter(
        (t) =>
          t.name.toLowerCase().includes(query.toLowerCase()) ||
          t.description.toLowerCase().includes(query.toLowerCase()) ||
          t.category.toLowerCase().includes(query.toLowerCase())
      )
    : history.length > 0
    ? history.slice(0, 8)
    : tools.slice(0, 8);

  function navigate(slug: string) {
    router.push(`/${slug}`);
    setOpen(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-sm text-neutral-400 hover:border-neutral-700 hover:text-neutral-300 transition"
      >
        <Search size={13} className="shrink-0" />
        <span className="flex-1 text-left text-xs">Search tools…</span>
        <kbd className="hidden sm:inline text-[10px] bg-neutral-800 border border-neutral-700 px-1.5 py-0.5 rounded text-neutral-500">⌘K</kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 flex items-start justify-center pt-[52px] bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-xl mx-4 rounded-xl border border-neutral-700 bg-neutral-950 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-800">
              <Search size={15} className="text-neutral-500 shrink-0" />
              <input
                ref={inputRef}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-600"
                placeholder="Search tools…"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelected(0); }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") { e.preventDefault(); setSelected((s) => Math.min(s + 1, results.length - 1)); }
                  if (e.key === "ArrowUp") { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)); }
                  if (e.key === "Enter" && results[selected]) navigate(results[selected].slug);
                }}
              />
              <button onClick={() => setOpen(false)} className="text-neutral-600 hover:text-neutral-400 transition">
                <X size={14} />
              </button>
            </div>

            {!query && history.length > 0 && (
              <div className="px-4 pt-2.5 pb-1 text-[10px] uppercase tracking-widest text-neutral-600">Recent</div>
            )}

            <div className="max-h-[55vh] overflow-y-auto">
              {results.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-neutral-600">No tools found</div>
              ) : (
                results.map((t, i) => (
                  <button
                    key={t.slug}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition ${
                      i === selected ? "bg-neutral-800/80" : "hover:bg-neutral-900"
                    }`}
                    onClick={() => navigate(t.slug)}
                    onMouseEnter={() => setSelected(i)}
                  >
                    <span className="w-5 text-neutral-500 shrink-0 flex items-center justify-center"><ToolIcon name={t.icon} size={15} /></span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium leading-tight">{t.name}</div>
                      <div className="text-xs text-neutral-500 mt-0.5 truncate">{t.description}</div>
                    </div>
                    <span className="text-[10px] text-neutral-700 shrink-0">{t.category}</span>
                  </button>
                ))
              )}
            </div>

            <div className="border-t border-neutral-800/60 px-4 py-2 flex items-center gap-3 text-[10px] text-neutral-700">
              <span>↑↓ navigate</span>
              <span>↵ open</span>
              <span>esc close</span>
              <span className="ml-auto">{results.length} result{results.length !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
