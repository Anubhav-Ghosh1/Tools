"use client";
import { useState } from "react";
import Link from "next/link";
import { categories, tools, type ToolCategory } from "@/lib/tools";
import ToolIcon from "@/components/ToolIcon";

export default function ToolGrid() {
  const [active, setActive] = useState<ToolCategory | "All">("All");

  const visibleCats = active === "All" ? categories : categories.filter((c) => c === active);

  return (
    <div className="space-y-8">
      {/* Category filter pills */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setActive("All")}
          className={`px-3 py-1.5 rounded-full text-xs border font-medium transition pill ${active === "All" ? "pill-active" : "pill-idle"}`}
        >
          All <span className="opacity-50 ml-0.5">{tools.length}</span>
        </button>
        {categories.map((cat) => {
          const count = tools.filter((t) => t.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-3 py-1.5 rounded-full text-xs border font-medium transition pill ${active === cat ? "pill-active" : "pill-idle"}`}
            >
              {cat} <span className="opacity-50 ml-0.5">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Tool grid */}
      {visibleCats.map((cat) => {
        const list = tools.filter((t) => t.category === cat);
        return (
          <section key={cat} className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-500">{cat}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {list.map((t) => (
                <Link key={t.slug} href={`/${t.slug}`} className="tool-card group">
                  <div className="flex items-start gap-3">
                    <span className="text-neutral-500 shrink-0 mt-0.5 group-hover:text-neutral-300 transition-colors duration-150">
                      <ToolIcon name={t.icon} size={18} />
                    </span>
                    <div className="min-w-0">
                      <div className="font-medium text-sm flex items-center gap-2 flex-wrap">
                        {t.name}
                        {t.isNew && (
                          <span className="text-[9px] bg-emerald-900/50 text-emerald-400 border border-emerald-800/50 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                            New
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                        {t.description}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
