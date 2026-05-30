/**
 * Persists the last 3 searched usernames in localStorage for quick re-search.
 */

import { useCallback, useState } from "react";

const STORAGE_KEY = "roblox-snipe-recent-usernames";
const MAX_RECENT = 3;

function readRecent(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((u): u is string => typeof u === "string").slice(0, MAX_RECENT)
      : [];
  } catch {
    return [];
  }
}

function writeRecent(list: string[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_RECENT)));
}

export function useRecentUsernames() {
  const [recent, setRecent] = useState<string[]>(() => readRecent());

  const addRecent = useCallback((username: string) => {
    const trimmed = username.trim();
    if (!trimmed) return;

    setRecent((prev) => {
      const next = [
        trimmed,
        ...prev.filter((u) => u.toLowerCase() !== trimmed.toLowerCase()),
      ].slice(0, MAX_RECENT);
      writeRecent(next);
      return next;
    });
  }, []);

  return { recent, addRecent };
}
