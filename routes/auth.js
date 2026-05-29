import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db.js';

const router = Router();

const REMEMBER_ME_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days

router.post('/register', async (req, res) => {
  const { handle, email, password } = req.body ?? {};
  if (!handle || !email || !password) {
    return res.status(400).json({ error: 'handle, email, and password are required' });
  }
  if (handle.length < 2 || handle.length > 32) {
    return res.status(400).json({ error: 'Handle must be 2–32 characters' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  try {
    const hash = await bcrypt.hash(password, 12);
    const [result] = await pool.execute(
      'INSERT INTO users (handle, email, password) VALUES (?, ?, ?)',
      [handle, email, hash]
    );
    req.session.userId = result.insertId;
    req.session.handle = handle;
    res.status(201).json({ id: result.insertId, handle, email });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      const field = err.message.includes('handle') ? 'Handle' : 'Email';
      return res.status(409).json({ error: `${field} already taken` });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password, rememberMe } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  try {
    const [rows] = await pool.execute(
      'SELECT id, handle, email, password FROM users WHERE email = ?',
      [email]
    );
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    req.session.userId = user.id;
    req.session.handle = user.handle;
    if (rememberMe) {
      req.session.cookie.maxAge = REMEMBER_ME_AGE;
    }

    res.json({ id: user.id, handle: user.handle, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
});

router.get('/me', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Not authenticated' });
  res.json({ id: req.session.userId, handle: req.session.handle });
});

export default router;
