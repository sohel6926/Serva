import { getDb } from '../db/client.ts';

const WINDOW_MINUTES = 15;
const MAX_ATTEMPTS = 5;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function checkRateLimit(key: string, maxAttempts = MAX_ATTEMPTS): RateLimitResult {
  const db = getDb();
  const now = new Date();
  const row = db
    .prepare(`SELECT key, attempts, window_start, blocked_until FROM auth_rate_limits WHERE key = ?`)
    .get(key) as
    | { key: string; attempts: number; window_start: string; blocked_until: string | null }
    | undefined;

  if (!row) {
    return { allowed: true, remaining: maxAttempts, retryAfterSeconds: 0 };
  }

  if (row.blocked_until) {
    const blockedUntil = new Date(row.blocked_until);
    if (blockedUntil > now) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: Math.ceil((blockedUntil.getTime() - now.getTime()) / 1000),
      };
    }
  }

  const windowStart = new Date(row.window_start);
  const windowExpiry = new Date(windowStart.getTime() + WINDOW_MINUTES * 60 * 1000);
  if (now > windowExpiry) {
    db.prepare(`DELETE FROM auth_rate_limits WHERE key = ?`).run(key);
    return { allowed: true, remaining: maxAttempts, retryAfterSeconds: 0 };
  }

  if (row.attempts >= maxAttempts) {
    const blockedUntil = new Date(now.getTime() + WINDOW_MINUTES * 60 * 1000);
    db.prepare(`UPDATE auth_rate_limits SET blocked_until = ? WHERE key = ?`).run(
      blockedUntil.toISOString(),
      key
    );
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: WINDOW_MINUTES * 60,
    };
  }

  return {
    allowed: true,
    remaining: Math.max(0, maxAttempts - row.attempts),
    retryAfterSeconds: 0,
  };
}

export function recordFailedAttempt(key: string, maxAttempts = MAX_ATTEMPTS): RateLimitResult {
  const db = getDb();
  const now = new Date();
  const row = db
    .prepare(`SELECT key, attempts, window_start FROM auth_rate_limits WHERE key = ?`)
    .get(key) as { key: string; attempts: number; window_start: string } | undefined;

  if (!row) {
    db.prepare(
      `INSERT INTO auth_rate_limits (key, attempts, window_start, blocked_until) VALUES (?, 1, ?, NULL)`
    ).run(key, now.toISOString());
    return { allowed: true, remaining: maxAttempts - 1, retryAfterSeconds: 0 };
  }

  const windowStart = new Date(row.window_start);
  const windowExpiry = new Date(windowStart.getTime() + WINDOW_MINUTES * 60 * 1000);
  if (now > windowExpiry) {
    db.prepare(
      `UPDATE auth_rate_limits SET attempts = 1, window_start = ?, blocked_until = NULL WHERE key = ?`
    ).run(now.toISOString(), key);
    return { allowed: true, remaining: maxAttempts - 1, retryAfterSeconds: 0 };
  }

  const nextAttempts = row.attempts + 1;
  const blockedUntil =
    nextAttempts >= maxAttempts
      ? new Date(now.getTime() + WINDOW_MINUTES * 60 * 1000).toISOString()
      : null;

  db.prepare(`UPDATE auth_rate_limits SET attempts = ?, blocked_until = ? WHERE key = ?`).run(
    nextAttempts,
    blockedUntil,
    key
  );

  return {
    allowed: nextAttempts < maxAttempts,
    remaining: Math.max(0, maxAttempts - nextAttempts),
    retryAfterSeconds: blockedUntil ? WINDOW_MINUTES * 60 : 0,
  };
}

export function clearRateLimit(key: string): void {
  const db = getDb();
  db.prepare(`DELETE FROM auth_rate_limits WHERE key = ?`).run(key);
}
