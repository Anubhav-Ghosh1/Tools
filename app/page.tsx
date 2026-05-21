import Link from "next/link";
import { categories, tools } from "@/lib/tools";

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Developer Tools</h1>
        <p className="text-neutral-400">
          {tools.length} small utilities — encoders, hashers, converters, formatters. Everything runs in your
          browser. Nothing is uploaded.
        </p>
      </section>
      {categories.map((cat) => {
        const list = tools.filter((t) => t.category === cat);
        return (
          <section key={cat} className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-400">{cat}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {list.map((t) => (
                <Link key={t.slug} href={`/${t.slug}`} className="tool-card">
                  <div className="font-medium">{t.name}</div>
                  <div className="text-sm text-neutral-400 mt-1">{t.description}</div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
