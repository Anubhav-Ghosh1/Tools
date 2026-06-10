import { tools } from "@/lib/tools";
import RecentAndFavorites from "@/components/RecentAndFavorites";
import ToolGrid from "@/components/ToolGrid";
import ToolIcon from "@/components/ToolIcon";
import Link from "next/link";

export default function Home() {
  const newTools = tools.filter((t) => t.isNew);

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">Developer Tools</h1>
        <p className="text-neutral-400 max-w-xl">
          {tools.length} fast, browser-side utilities — encoders, hashers, converters, formatters.
          Everything runs locally. Nothing is uploaded.
        </p>
        {newTools.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {newTools.map((t) => (
              <Link
                key={t.slug}
                href={`/${t.slug}`}
                className="inline-flex items-center gap-1.5 text-xs rounded-full border border-emerald-800/60 bg-emerald-950/30 text-emerald-400 px-2.5 py-1 hover:bg-emerald-950/50 transition"
              >
                <ToolIcon name={t.icon} size={12} />
                {t.name}
                <span className="bg-emerald-800/60 text-emerald-300 px-1 rounded text-[9px] uppercase tracking-wider">New</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <RecentAndFavorites />

      <ToolGrid />
    </div>
  );
}
