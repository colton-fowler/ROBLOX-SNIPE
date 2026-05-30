/**
 * Express proxy for Roblox public APIs.
 * Proxies requests to avoid browser CORS issues and centralize rate-limit handling.
 */

import cors from "cors";
import express from "express";

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN?.trim();

const ROBLOX = {
  users: "https://users.roblox.com",
  presence: "https://presence.roblox.com",
  thumbnails: "https://thumbnails.roblox.com",
} as const;

app.use(
  cors(
    CORS_ORIGIN
      ? {
          origin: CORS_ORIGIN.split(",").map((origin) => origin.trim()),
        }
      : undefined,
  ),
);
app.use(express.json());

/** Forward Roblox response status and body, mapping 429 clearly */
async function proxyRoblox(
  url: string,
  init: RequestInit,
): Promise<{ status: number; body: unknown }> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init.headers as Record<string, string>),
    },
  });

  let body: unknown;
  const text = await response.text();
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { raw: text };
  }

  return { status: response.status, body };
}

/** Resolve username(s) to user IDs */
app.post("/api/users/lookup", async (req, res) => {
  const usernames = req.body?.usernames;
  if (!Array.isArray(usernames) || usernames.length === 0) {
    res.status(400).json({ error: "usernames array required" });
    return;
  }

  try {
    const { status, body } = await proxyRoblox(
      `${ROBLOX.users}/v1/usernames/users`,
      {
        method: "POST",
        body: JSON.stringify({
          usernames,
          excludeBannedUsers: true,
        }),
      },
    );
    res.status(status).json(body);
  } catch (err) {
    res.status(502).json({
      error: "Failed to reach Roblox Users API",
      detail: err instanceof Error ? err.message : String(err),
    });
  }
});

/** Fetch online / in-game presence for user IDs */
app.post("/api/presence", async (req, res) => {
  const userIds = req.body?.userIds;
  if (!Array.isArray(userIds) || userIds.length === 0) {
    res.status(400).json({ error: "userIds array required" });
    return;
  }

  try {
    const { status, body } = await proxyRoblox(
      `${ROBLOX.presence}/v1/presence/users`,
      {
        method: "POST",
        body: JSON.stringify({ userIds }),
      },
    );
    res.status(status).json(body);
  } catch (err) {
    res.status(502).json({
      error: "Failed to reach Roblox Presence API",
      detail: err instanceof Error ? err.message : String(err),
    });
  }
});

/** Fetch avatar headshot thumbnails */
app.get("/api/avatar/:userId", async (req, res) => {
  const userId = req.params.userId;
  if (!/^\d+$/.test(userId)) {
    res.status(400).json({ error: "Invalid userId" });
    return;
  }

  const url = `${ROBLOX.thumbnails}/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`;

  try {
    const { status, body } = await proxyRoblox(url, { method: "GET" });
    res.status(status).json(body);
  } catch (err) {
    res.status(502).json({
      error: "Failed to reach Roblox Thumbnails API",
      detail: err instanceof Error ? err.message : String(err),
    });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Roblox proxy listening on http://localhost:${PORT}`);
});
