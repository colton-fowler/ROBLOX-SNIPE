/**
 * Orchestrates the full lookup → presence → instant join pipeline.
 */

import {
  fetchAvatarUrl,
  fetchPresence,
  lookupUsername,
  resolveJoinTarget,
} from "../api/roblox";
import { AppError } from "../types/errors";
import { PlayerProfile } from "../types/roblox";
import { joinGameInstance } from "../utils/joinGame";

export interface SearchResult {
  profile: PlayerProfile | null;
  error: AppError | null;
}

/**
 * Look up a player by username, fetch avatar + presence in parallel,
 * and auto-join if they are in a public game instance.
 */
export async function searchAndJoin(username: string): Promise<SearchResult> {
  const { user, error: lookupError } = await lookupUsername(username);
  if (lookupError || !user) {
    return { profile: null, error: lookupError ?? null };
  }

  // Fetch presence and avatar concurrently for minimum latency
  const [presenceResult, avatarUrl] = await Promise.all([
    fetchPresence(user.id),
    fetchAvatarUrl(user.id),
  ]);

  if (presenceResult.error || !presenceResult.presence) {
    return { profile: null, error: presenceResult.error };
  }

  const presence = presenceResult.presence;
  const joinResult = resolveJoinTarget(presence);
  let joinTriggered = false;

  if (joinResult.target) {
    joinGameInstance(joinResult.target);
    joinTriggered = true;
  }

  const profile: PlayerProfile = {
    user,
    presence,
    avatarUrl,
    joinTriggered,
  };

  // Surface join-blocking errors while still showing the profile
  if (joinResult.error && !joinTriggered) {
    return { profile, error: joinResult.error };
  }

  return { profile, error: null };
}
