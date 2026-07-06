import bcryptjs from 'bcryptjs';
import crypto from 'crypto';

const ADMIN_PASSWORD_HASH = bcryptjs.hashSync(
  process.env.ADMIN_PASSWORD || 'teamtux',
  10
);

if (!process.env.ADMIN_PASSWORD) {
  console.warn(
    '\n⚠️  SECURITY WARNING: ADMIN_PASSWORD environment variable is not set.' +
    '\n    The dashboard is using the default password "teamtux".' +
    '\n    Set ADMIN_PASSWORD in Railway environment variables immediately.\n'
  );
}

// ── Session store ────────────────────────────────────────────────────────────
const sessions = new Map(); // token -> expiresAt
const SESSION_TTL = 8 * 60 * 60 * 1000; // 8 hours

export function verifyPassword(password) {
  return bcryptjs.compareSync(password, ADMIN_PASSWORD_HASH);
}

export function createSession() {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, Date.now() + SESSION_TTL);
  return token;
}

export function verifySession(token) {
  if (!token) return false;
  const expiresAt = sessions.get(token);
  if (!expiresAt) return false;
  if (Date.now() > expiresAt) {
    sessions.delete(token);
    return false;
  }
  return true;
}

export function destroySession(token) {
  sessions.delete(token);
}

// Purge expired sessions every hour
setInterval(() => {
  const now = Date.now();
  for (const [token, expiresAt] of sessions) {
    if (now > expiresAt) sessions.delete(token);
  }
}, 60 * 60 * 1000);

// ── Rate limiter ─────────────────────────────────────────────────────────────
const attempts = new Map(); // ip -> { count, resetAt }
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export function checkRateLimit(ip) {
  const now = Date.now();
  const rec = attempts.get(ip);

  if (!rec || now > rec.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  if (rec.count >= MAX_ATTEMPTS) {
    const waitMin = Math.ceil((rec.resetAt - now) / 60000);
    return { allowed: false, waitMin };
  }

  rec.count++;
  return { allowed: true };
}

export function clearRateLimit(ip) {
  attempts.delete(ip);
}
