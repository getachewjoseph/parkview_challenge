import express from 'express';
import { auth } from '../middleware/auth';
import { pool } from '../config/database';

const router = express.Router();

// Log a fall
router.post('/', auth, async (req, res) => {
  if (req.user?.userType !== 'patient') {
    return res.status(403).json({ error: 'Only patients can log falls.' });
  }

  const { fall_date, location, activity, cause, injuries } = req.body;
  if (!fall_date) {
    return res.status(400).json({ error: 'Fall date is required.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO falls (user_id, fall_date, location, activity, cause, injuries) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.user.id, fall_date, location, activity, cause, injuries]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error logging fall:', error);
    res.status(500).json({ error: 'Server error while logging fall.' });
  }
});

// Get all falls for the logged-in patient
router.get('/', auth, async (req, res) => {
    if (req.user?.userType !== 'patient') {
        return res.status(403).json({ error: 'Only patients can view their fall log.' });
    }

    try {
        const { rows } = await pool.query(
            'SELECT * FROM falls WHERE user_id = $1 ORDER BY fall_date DESC',
            [req.user.id]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching fall log:', error);
        res.status(500).json({ error: 'Server error while fetching fall log.' });
    }
});

export default router; 