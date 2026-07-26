// auth.js – simple local auth for demo purposes
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const USERS_PATH = '/root/workspace/users.json';

function loadUsers() {
  if (!fs.existsSync(USERS_PATH)) fs.writeFileSync(USERS_PATH, '[]', 'utf8');
  return JSON.parse(fs.readFileSync(USERS_PATH, 'utf8'));
}
function saveUsers(users) {
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2), 'utf8');
}
function createSessionToken(email) {
  return crypto.createHash('sha256')
    .update(email + Date.now() + Math.random())
    .digest('hex');
}
// In‑memory session store (demo only)
const sessions = new Map(); // token => email

module.exports = {
  // Middleware to protect routes
  requireAuth: (req, res, next) => {
    const cookie = req.headers.cookie || '';
    const match = cookie.match(/session=([^;]+)/);
    if (!match || !sessions.has(match[1])) {
      return res.status(401).json({ error: 'unauthenticated' });
    }
    req.user = sessions.get(match[1]); // email of logged‑in user
    next();
  },
  // Sign‑in endpoint (creates account if missing)
  signInHandler: async (req, res) => {
    const { email } = JSON.parse(req.body);
    if (!email) return res.status(400).json({ error: 'email required' });
    const users = loadUsers();
    let user = users.find(u => u.email === email);
    if (!user) {
      user = { email };
      users.push(user);
      saveUsers(users);
    }
    const token = createSessionToken(email);
    sessions.set(token, email);
    res.setHeader('Set-Cookie', `session=${token}; HttpOnly; Path=/`);
    res.json({ ok: true });
  },
  // Expose sessions map for testing/debug (optional)
  _sessions: sessions
};
