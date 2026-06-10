"use client";
import Link from "next/link";
import { Star, Clock } from "lucide-react";
import { useHistory } from "@/hooks/useHistory";
import { useFavorites } from "@/hooks/useFavorites";
import ToolIcon from "@/components/ToolIcon";

export default function RecentAndFavorites() {
  const { history } = useHistory();
  const { favorites } = useFavorites();

  if (history.length === 0 && favorites.length === 0) return null;

  return (
    <div className="space-y-5">
      {favorites.length > 0 && (
        <section className="space-y-2.5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-500 flex items-center gap-1.5">
            <Star size={10} />
            Favorites
          </h2>
          <div className="flex flex-wrap gap-2">
            {favorites.map((t) => (
              <Link
                key={t.slug}
                href={`/${t.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-sm hover:border-emerald-700/60 hover:text-white transition"
              >
                <span className="text-neutral-400"><ToolIcon name={t.icon} size={13} /></span>
                {t.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {history.length > 0 && (
        <section className="space-y-2.5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-500 flex items-center gap-1.5">
            <Clock size={10} />
            Recent
          </h2>
          <div className="flex flex-wrap gap-2">
            {history.slice(0, 8).map((t) => (
              <Link
                key={t.slug}
                href={`/${t.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-900/40 px-3 py-1.5 text-sm text-neutral-400 hover:border-neutral-700 hover:text-neutral-200 transition"
              >
                <span className="text-neutral-500"><ToolIcon name={t.icon} size={13} /></span>
                {t.name}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
