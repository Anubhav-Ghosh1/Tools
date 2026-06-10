"use client";
import Link from "next/link";
import { useEffect } from "react";
import { Star } from "lucide-react";
import type { Tool } from "@/lib/tools";
import { useHistory } from "@/hooks/useHistory";
import { useFavorites } from "@/hooks/useFavorites";
import ToolIcon from "@/components/ToolIcon";

export default function ToolShell({ tool, children }: { tool: Tool; children: React.ReactNode }) {
  const { addToHistory } = useHistory();
  const { toggleFavorite, isFavorite } = useFavorites();
  const fav = isFavorite(tool.slug);

  useEffect(() => {
    addToHistory(tool.slug);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool.slug]);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-1.5 text-xs text-neutral-600 mb-3">
          <Link href="/" className="hover:text-neutral-400 transition">All tools</Link>
          <span>/</span>
          <span className="text-neutral-500">{tool.category}</span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="text-neutral-400 mt-1 shrink-0"><ToolIcon name={tool.icon} size={24} /></span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight">{tool.name}</h1>
                {tool.isNew && (
                  <span className="text-[10px] bg-emerald-900/50 text-emerald-400 border border-emerald-800/50 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                    New
                  </span>
                )}
              </div>
              <p className="text-sm text-neutral-400 mt-1 max-w-2xl leading-relaxed">{tool.description}</p>
            </div>
          </div>

          <button
            onClick={() => toggleFavorite(tool.slug)}
            className={`shrink-0 p-2 rounded-lg border transition ${
              fav
                ? "border-yellow-700/60 bg-yellow-950/30 text-yellow-400 hover:bg-yellow-950/50"
                : "border-neutral-700 bg-neutral-900 text-neutral-600 hover:text-yellow-400 hover:border-neutral-600"
            }`}
            title={fav ? "Remove from favorites" : "Add to favorites"}
          >
            <Star size={15} fill={fav ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      <div className="border-t border-neutral-800/60 pt-6">{children}</div>
    </div>
  );
}
