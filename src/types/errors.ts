/**
 * Application error codes with user-facing messages.
 */

export type AppErrorCode =
  | "USER_NOT_FOUND"
  | "USER_OFFLINE"
  | "USER_PRIVATE"
  | "JOINS_DISABLED"
  | "RATE_LIMITED"
  | "NETWORK_ERROR"
  | "UNKNOWN";

export interface AppError {
  code: AppErrorCode;
  message: string;
  /** Optional detail for debugging (not shown prominently) */
  detail?: string;
}

export const ERROR_MESSAGES: Record<AppErrorCode, string> = {
  USER_NOT_FOUND:
    "That username doesn't exist. Check the spelling and try again.",
  USER_OFFLINE:
    "This player is offline. They must be in a game for you to join them.",
  USER_PRIVATE:
    "This player's activity is private. Their game location is hidden.",
  JOINS_DISABLED:
    "Cannot join this player right now. They may have joins disabled or be in a private server.",
  RATE_LIMITED:
    "Roblox API rate limit reached. Wait a moment and try again.",
  NETWORK_ERROR:
    "Could not reach Roblox. Check your connection and try again.",
  UNKNOWN: "Something went wrong. Please try again.",
};

export function createError(
  code: AppErrorCode,
  detail?: string,
): AppError {
  return {
    code,
    message: ERROR_MESSAGES[code],
    detail,
  };
}

/** Maps HTTP status from our proxy to app errors */
export function errorFromStatus(status: number, detail?: string): AppError {
  if (status === 429) return createError("RATE_LIMITED", detail);
  if (status >= 500) return createError("NETWORK_ERROR", detail);
  return createError("UNKNOWN", detail);
}
