import bcryptjs from 'bcryptjs';

const ADMIN_PASSWORD_HASH = bcryptjs.hashSync(process.env.ADMIN_PASSWORD || 'teamtux', 10);

export function verifyPassword(password) {
  return bcryptjs.compareSync(password, ADMIN_PASSWORD_HASH);
}

export function generateSessionToken() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export default {
  verifyPassword,
  generateSessionToken,
};
