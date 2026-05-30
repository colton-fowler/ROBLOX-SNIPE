/**
 * Client-side API layer — talks to our Express proxy, not Roblox directly.
 */

import {
  AvatarThumbnail,
  JoinTarget,
  RobloxUser,
  UserPresence,
  UserPresenceType,
} from "../types/roblox";
import { AppError, createError, errorFromStatus } from "../types/errors";

const API_BASE = "/api";

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<{ data: T; error: null } | { data: null; error: AppError }> {
  try {
    const response = await fetch(`${API_BASE}${path}`, init);

    if (response.status === 429) {
      return { data: null, error: createError("RATE_LIMITED") };
    }

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      return {
        data: null,
        error: errorFromStatus(response.status, text),
      };
    }

    const data = (await response.json()) as T;
    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: createError(
        "NETWORK_ERROR",
        err instanceof Error ? err.message : String(err),
      ),
    };
  }
}

interface UsernameLookupResponse {
  data: Array<{
    requestedUsername: string;
    id: number;
    name: string;
    displayName: string;
    hasVerifiedBadge: boolean;
  }>;
}

interface PresenceResponse {
  userPresences: UserPresence[];
}

interface ThumbnailResponse {
  data: AvatarThumbnail[];
}

/** Look up a single username; returns null user if not found */
export async function lookupUsername(
  username: string,
): Promise<
  | { user: RobloxUser; error: null }
  | { user: null; error: AppError }
> {
  const trimmed = username.trim();
  if (!trimmed) {
    return { user: null, error: createError("USER_NOT_FOUND") };
  }

  const result = await request<UsernameLookupResponse>("/users/lookup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usernames: [trimmed] }),
  });

  if (result.error) return { user: null, error: result.error };

  const entry = result.data.data.find(
    (u) =>
      u.name.toLowerCase() === trimmed.toLowerCase() ||
      u.requestedUsername.toLowerCase() === trimmed.toLowerCase(),
  ) ?? result.data.data[0];

  if (!entry?.id) {
    return { user: null, error: createError("USER_NOT_FOUND") };
  }

  return {
    user: {
      id: entry.id,
      name: entry.name,
      displayName: entry.displayName,
      hasVerifiedBadge: entry.hasVerifiedBadge,
    },
    error: null,
  };
}

/** Fetch presence for a user ID */
export async function fetchPresence(
  userId: number,
): Promise<
  | { presence: UserPresence; error: null }
  | { presence: null; error: AppError }
> {
  const result = await request<PresenceResponse>("/presence", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userIds: [userId] }),
  });

  if (result.error) return { presence: null, error: result.error };

  const presence = result.data.userPresences[0];
  if (!presence) {
    return { presence: null, error: createError("UNKNOWN", "No presence data") };
  }

  return { presence, error: null };
}

/** Fetch avatar headshot URL */
export async function fetchAvatarUrl(
  userId: number,
): Promise<string | null> {
  const result = await request<ThumbnailResponse>(`/avatar/${userId}`);
  if (result.error || !result.data.data[0]?.imageUrl) return null;
  return result.data.data[0].imageUrl;
}

/**
 * Derive join target from presence, or an error explaining why join isn't possible.
 */
export function resolveJoinTarget(
  presence: UserPresence,
): { target: JoinTarget; error: null } | { target: null; error: AppError } {
  const { userPresenceType, placeId, gameId } = presence;

  if (userPresenceType === UserPresenceType.Offline) {
    return { target: null, error: createError("USER_OFFLINE") };
  }

  if (
    userPresenceType === UserPresenceType.Online ||
    userPresenceType === UserPresenceType.InStudio
  ) {
    return { target: null, error: createError("USER_OFFLINE") };
  }

  if (userPresenceType === UserPresenceType.InGame) {
    if (!placeId || !gameId) {
      return { target: null, error: createError("USER_PRIVATE") };
    }
    return {
      target: { placeId, gameInstanceId: gameId },
      error: null,
    };
  }

  return { target: null, error: createError("JOINS_DISABLED") };
}

/** Human-readable presence label for UI */
export function presenceLabel(type: UserPresenceType): string {
  switch (type) {
    case UserPresenceType.Offline:
      return "Offline";
    case UserPresenceType.Online:
      return "Online";
    case UserPresenceType.InGame:
      return "In Game";
    case UserPresenceType.InStudio:
      return "In Studio";
    default:
      return "Unknown";
  }
}

/** Whether presence indicates the user is joinable */
export function isJoinable(presence: UserPresence): boolean {
  return (
    presence.userPresenceType === UserPresenceType.InGame &&
    presence.placeId != null &&
    presence.gameId != null
  );
}
