import express from 'express';
import { pool } from '../config/database';
import { auth } from '../middleware/auth';

const router = express.Router();

// Submit exercise log for current user
router.post('/users/me/exercise', auth, async (req, res) => {
  try {
    const { weekStart, minutes } = req.body;
    const userId = (req as any).user.id;

    if (!weekStart || typeof minutes !== 'number' || minutes < 0) {
      return res.status(400).json({ error: 'Invalid weekStart or minutes' });
    }

    // Check if exercise log already exists for this week
    const existingLog = await pool.query(
      'SELECT * FROM exercise_logs WHERE user_id = $1 AND week_start = $2',
      [userId, weekStart]
    );

    if (existingLog.rows.length > 0) {
      // Update existing log
      const result = await pool.query(
        'UPDATE exercise_logs SET minutes = $1 WHERE user_id = $2 AND week_start = $3 RETURNING *',
        [minutes, userId, weekStart]
      );
      return res.json({ exercise: result.rows[0] });
    } else {
      // Create new log
      const result = await pool.query(
        'INSERT INTO exercise_logs (user_id, week_start, minutes) VALUES ($1, $2, $3) RETURNING *',
        [userId, weekStart, minutes]
      );
      return res.json({ exercise: result.rows[0] });
    }
  } catch (error) {
    console.error('Error submitting exercise:', error);
    res.status(500).json({ error: 'Server error while submitting exercise.' });
  }
});

// Get exercise logs for current user
router.get('/users/me/exercise', auth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { weekStart } = req.query;

    let query = 'SELECT * FROM exercise_logs WHERE user_id = $1';
    let params = [userId];

    if (weekStart) {
      query += ' AND week_start = $2';
      params.push(weekStart as string);
    }

    query += ' ORDER BY week_start DESC';

    const result = await pool.query(query, params);
    res.json({ exercise_logs: result.rows });
  } catch (error) {
    console.error('Error fetching exercise logs:', error);
    res.status(500).json({ error: 'Server error while fetching exercise logs.' });
  }
});

// Get exercise logs for a specific patient (for caretakers)
router.get('/users/me/patients/:patientId/exercise', auth, async (req, res) => {
  try {
    const caretakerId = (req as any).user.id;
    const patientId = parseInt(req.params.patientId);

    // Verify the patient is linked to this caretaker
    const patientCheck = await pool.query(
      'SELECT id FROM users WHERE id = $1 AND caretaker_id = $2',
      [patientId, caretakerId]
    );

    if (patientCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found or not linked to this caretaker' });
    }

    const result = await pool.query(
      'SELECT * FROM exercise_logs WHERE user_id = $1 ORDER BY week_start DESC',
      [patientId]
    );

    res.json({ exercise_logs: result.rows });
  } catch (error) {
    console.error('Error fetching patient exercise logs:', error);
    res.status(500).json({ error: 'Server error while fetching patient exercise logs.' });
  }
});

export default router; 