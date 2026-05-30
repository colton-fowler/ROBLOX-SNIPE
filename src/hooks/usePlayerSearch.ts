import { useCallback, useState } from "react";
import { JoinTarget } from "../types/roblox";
import { AppError } from "../types/errors";
import { PlayerProfile } from "../types/roblox";
import { searchAndJoin } from "../services/playerSearch";
import { joinGameInstance } from "../utils/joinGame";
import { useRecentUsernames } from "./useRecentUsernames";

export function usePlayerSearch() {
  const { recent, addRecent } = useRecentUsernames();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [error, setError] = useState<AppError | null>(null);

  const search = useCallback(
    async (name?: string) => {
      const query = (name ?? username).trim();
      if (!query) return;

      setLoading(true);
      setError(null);
      setProfile(null);
      setUsername(query);

      const result = await searchAndJoin(query);
      setProfile(result.profile);
      setError(result.error);

      if (result.profile) {
        addRecent(query);
      }

      setLoading(false);
    },
    [username, addRecent],
  );

  const manualJoin = useCallback((target: JoinTarget) => {
    joinGameInstance(target);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    username,
    setUsername,
    loading,
    profile,
    error,
    recent,
    search,
    manualJoin,
    clearError,
  };
}
