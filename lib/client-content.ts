"use client";

import { useEffect, useState } from "react";
import { lessons as seedLessons, type Lesson } from "@/lib/data";
import { migrateLesson } from "@/lib/content-migration";

export const STORAGE_KEY = "adabiatyar-admin-content-v2";
const LEGACY_STORAGE_KEY = "adabiatyar-admin-content-v1";
const CONTENT_UPDATED = "adabiatyar-content-updated";

type Content = { lessons: Lesson[]; source: "seed" | "saved" | "unreadable" };

// Reading never rewrites storage: old exports keep using the Admin migration.
export function loadContentLessons(): Content {
  const fallback = (source: Content["source"]): Content => ({
    lessons: structuredClone(seedLessons),
    source
  });
  if (typeof window === "undefined") return fallback("seed");
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
      ?? window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return fallback("seed");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return fallback("unreadable");
    return { lessons: parsed.map(migrateLesson), source: "saved" };
  } catch {
    return fallback("unreadable");
  }
}

export function saveContentLessons(lessons: Lesson[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lessons));
  window.localStorage.removeItem(LEGACY_STORAGE_KEY);
  window.dispatchEvent(new Event(CONTENT_UPDATED));
}

export function resetContentLessons() {
  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem(LEGACY_STORAGE_KEY);
  window.dispatchEvent(new Event(CONTENT_UPDATED));
}

export function useContentLessons() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const refresh = () => {
      setLessons(loadContentLessons().lessons);
      setReady(true);
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === STORAGE_KEY || event.key === LEGACY_STORAGE_KEY) refresh();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(CONTENT_UPDATED, refresh);
    refresh();
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(CONTENT_UPDATED, refresh);
    };
  }, []);

  return { lessons, ready };
}
