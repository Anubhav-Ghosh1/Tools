import { useEffect, useState } from "react";
import { tools as allTools, type Tool } from "@/lib/tools";

const KEY = "devtools:history";
const MAX = 20;

export function useHistory() {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    try {
      const s = localStorage.getItem(KEY);
      if (s) setSlugs(JSON.parse(s));
    } catch {}
  }, []);

  function addToHistory(slug: string) {
    setSlugs((prev) => {
      const next = [slug, ...prev.filter((s) => s !== slug)].slice(0, MAX);
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  const history = slugs
    .map((slug) => allTools.find((t) => t.slug === slug))
    .filter(Boolean) as Tool[];

  return { history, addToHistory };
}
