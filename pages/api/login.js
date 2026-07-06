import { verifyPassword, checkRateLimit, clearRateLimit, createSession } from '../../lib/auth';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ip =
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown';

  const limit = checkRateLimit(ip);
  if (!limit.allowed) {
    return res.status(429).json({
      error: `Too many failed attempts. Try again in ${limit.waitMin} minute(s).`,
    });
  }

  const { password } = req.body;
  if (!password || !verifyPassword(password)) {
    return res.status(401).json({ error: 'Incorrect password' });
  }

  clearRateLimit(ip);
  const token = createSession();
  return res.status(200).json({ token });
}
