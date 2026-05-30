/**
 * Triggers Roblox client join via deep link, with web fallback.
 * Uses the official roblox-player protocol for fastest desktop launch.
 */

import { JoinTarget } from "../types/roblox";

const JOIN_ATTEMPT_KEY = "__roblox_snipe_last_join";

/**
 * Build the Roblox deep link for joining a specific game instance.
 * @see https://create.roblox.com/docs/production/publishing/publish-experiences-and-places
 */
export function buildJoinUrls(target: JoinTarget): {
  protocol: string;
  web: string;
} {
  const { placeId, gameInstanceId } = target;
  const params = new URLSearchParams({
    placeId: String(placeId),
    gameInstanceId,
  });

  return {
    protocol: `roblox-player:1+launchmode:play+gameinfo:${gameInstanceId}+placelauncherurl:https%3A%2F%2Fassetgame.roblox.com%2Fgame%2FPlaceLauncher.ashx%3Frequest%3DRequestGame%26placeId%3D${placeId}%26gameInstanceId%3D${gameInstanceId}%26joinAttemptId%3D${crypto.randomUUID()}`,
    web: `https://www.roblox.com/games/start?${params.toString()}`,
  };
}

/**
 * Attempt to join a game instance immediately.
 * Tries the Roblox desktop protocol first, then opens the web launcher.
 */
export function joinGameInstance(target: JoinTarget): void {
  const { protocol, web } = buildJoinUrls(target);

  // Debounce duplicate joins within 2s (e.g. React strict mode double effects)
  const key = `${target.placeId}:${target.gameInstanceId}`;
  const last = sessionStorage.getItem(JOIN_ATTEMPT_KEY);
  const now = Date.now();
  if (last?.startsWith(key)) {
    const ts = Number(last.split("|")[1]);
    if (now - ts < 2000) return;
  }
  sessionStorage.setItem(JOIN_ATTEMPT_KEY, `${key}|${now}`);

  // Protocol link — opens Roblox Player on desktop
  const anchor = document.createElement("a");
  anchor.href = protocol;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  // Web fallback after a short delay if protocol handler doesn't fire
  window.setTimeout(() => {
    window.open(web, "_blank", "noopener,noreferrer");
  }, 1500);
}

/**
 * Simpler roblox:// URL (works on some platforms).
 */
export function buildSimpleJoinUrl(target: JoinTarget): string {
  const params = new URLSearchParams({
    placeId: String(target.placeId),
    gameInstanceId: target.gameInstanceId,
  });
  return `roblox://experiences/start?${params.toString()}`;
}
