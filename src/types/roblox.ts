/**
 * Roblox domain types used across client and server.
 */

/** Presence values returned by presence.roblox.com */
export enum UserPresenceType {
  Offline = 0,
  Online = 1,
  InGame = 2,
  InStudio = 3,
}

export interface RobloxUser {
  id: number;
  name: string;
  displayName: string;
  hasVerifiedBadge: boolean;
}

export interface UserPresence {
  userId: number;
  userPresenceType: UserPresenceType;
  lastLocation: string | null;
  placeId: number | null;
  rootPlaceId: number | null;
  gameId: string | null;
  universeId: number | null;
}

export interface AvatarThumbnail {
  targetId: number;
  imageUrl: string;
  state: string;
}

/** Aggregated player profile ready for UI + join logic */
export interface PlayerProfile {
  user: RobloxUser;
  presence: UserPresence;
  avatarUrl: string | null;
  /** Whether a join attempt was triggered automatically */
  joinTriggered: boolean;
}

/** Join coordinates extracted from presence */
export interface JoinTarget {
  placeId: number;
  gameInstanceId: string;
}
