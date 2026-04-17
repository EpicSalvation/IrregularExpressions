import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Not authenticated' });
  next();
}

const EMPTY_PROGRESS = { completedChallenges: [], xp: 0, scores: {} };

router.get('/progress', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT progress FROM users WHERE id = ?',
      [req.session.userId]
    );
    res.json(rows[0]?.progress ?? EMPTY_PROGRESS);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/progress', requireAuth, async (req, res) => {
  const progress = req.body;
  if (!progress || typeof progress !== 'object') {
    return res.status(400).json({ error: 'Invalid progress data' });
  }

  try {
    await pool.execute(
      'UPDATE users SET progress = ? WHERE id = ?',
      [JSON.stringify(progress), req.session.userId]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
