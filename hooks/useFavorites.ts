import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { tools as allTools, type Tool } from "@/lib/tools";

const LS_KEY = "devtools:favorites";

export function useFavorites() {
  const { user, isLoaded } = useUser();
  const [localSlugs, setLocalSlugs] = useState<string[]>([]);
  const synced = useRef(false);

  // Load localStorage on mount
  useEffect(() => {
    try {
      const s = localStorage.getItem(LS_KEY);
      if (s) setLocalSlugs(JSON.parse(s));
    } catch {}
  }, []);

  // On first sign-in: merge localStorage favorites into Clerk metadata
  useEffect(() => {
    if (!isLoaded || !user || synced.current) return;
    synced.current = true;
    const cloud = (user.unsafeMetadata?.favorites as string[]) ?? [];
    const local = (() => {
      try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]") as string[]; } catch { return []; }
    })();
    const merged = [...new Set([...cloud, ...local])];
    if (merged.length !== cloud.length) {
      user.update({ unsafeMetadata: { ...user.unsafeMetadata, favorites: merged } });
    }
  }, [isLoaded, user]);

  const slugs: string[] = isLoaded && user
    ? (user.unsafeMetadata?.favorites as string[]) ?? []
    : localSlugs;

  async function toggleFavorite(slug: string) {
    const next = slugs.includes(slug)
      ? slugs.filter((s) => s !== slug)
      : [...slugs, slug];

    if (user) {
      // Optimistic update then persist to Clerk
      await user.update({ unsafeMetadata: { ...user.unsafeMetadata, favorites: next } });
    } else {
      setLocalSlugs(next);
      try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch {}
    }
  }

  const favorites = slugs
    .map((s) => allTools.find((t) => t.slug === s))
    .filter(Boolean) as Tool[];

  return { favorites, toggleFavorite, isFavorite: (s: string) => slugs.includes(s) };
}
