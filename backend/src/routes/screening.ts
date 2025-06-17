import express from 'express';
import { auth } from '../middleware/auth';
import { pool } from '../config/database';

interface AuthRequest extends express.Request {
  user?: {
    id: number;
    email: string;
    userType: string;
  };
}

const router = express.Router();

// POST /api/screening
router.post('/', auth, async (req: AuthRequest, res) => {
  try {
    const { unsteady, worries, fallen, fallCount, fallInjured } = req.body;
    const userId = req.user?.id;

    await pool.query(
      `INSERT INTO screenings (user_id, unsteady, worries, fallen, fall_count, fall_injured)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        userId,
        unsteady,
        worries,
        fallen,
        fallCount ? parseInt(fallCount, 10) : null,
        fallInjured || null,
      ]
    );

    res.status(201).json({ message: 'Screening submitted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
