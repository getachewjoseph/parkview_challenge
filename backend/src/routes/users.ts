import express from 'express';
import { auth } from '../middleware/auth';
import { pool } from '../config/database';

const router = express.Router();

// Get patients linked to a caretaker
router.get('/me/patients', auth, async (req, res) => {
  if (req.user?.userType !== 'caretaker') {
    return res.status(403).json({ error: 'Only caretakers can access this resource.' });
  }

  try {
    const { rows } = await pool.query(
      'SELECT id, email, full_name, created_at FROM users WHERE caretaker_id = $1 AND user_type = \'patient\' ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ patients: rows });
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'Server error while fetching patients.' });
  }
});

// Get patient details including screening and fall data
router.get('/me/patients/:patientId', auth, async (req, res) => {
  if (req.user?.userType !== 'caretaker') {
    return res.status(403).json({ error: 'Only caretakers can access this resource.' });
  }

  const { patientId } = req.params;

  try {
    // Verify the patient is linked to this caretaker
    const patientRes = await pool.query(
      'SELECT id, email, full_name, created_at FROM users WHERE id = $1 AND caretaker_id = $2 AND user_type = \'patient\'',
      [patientId, req.user.id]
    );

    if (patientRes.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found or not linked to you.' });
    }

    const patient = patientRes.rows[0];

    // Get patient's screening data
    const screeningRes = await pool.query(
      'SELECT * FROM screenings WHERE user_id = $1 ORDER BY created_at DESC',
      [patientId]
    );

    // Get patient's fall log
    const fallsRes = await pool.query(
      'SELECT * FROM falls WHERE user_id = $1 ORDER BY fall_date DESC',
      [patientId]
    );

    res.json({
      patient,
      screenings: screeningRes.rows,
      falls: fallsRes.rows
    });
  } catch (error) {
    console.error('Error fetching patient details:', error);
    res.status(500).json({ error: 'Server error while fetching patient details.' });
  }
});

// Link patient to caretaker
router.put('/me/link-caretaker', auth, async (req, res) => {
  if (req.user?.userType !== 'patient') {
    return res.status(403).json({ error: 'Only patients can perform this action.' });
  }

  const { referralCode } = req.body;
  if (!referralCode) {
    return res.status(400).json({ error: 'Referral code is required.' });
  }

  try {
    // Find the caretaker with the given referral code
    const caretakerRes = await pool.query(
      "SELECT id FROM users WHERE referral_code = $1 AND user_type = 'caretaker'",
      [referralCode.toUpperCase()]
    );

    if (caretakerRes.rows.length === 0) {
      return res.status(404).json({ error: 'Invalid or non-existent referral code.' });
    }
    const caretakerId = caretakerRes.rows[0].id;

    // Update the patient's record with the caretaker's ID
    await pool.query(
      'UPDATE users SET caretaker_id = $1 WHERE id = $2',
      [caretakerId, req.user.id]
    );

    res.json({ message: 'Successfully linked to caretaker.' });
  } catch (error) {
    console.error('Error linking caretaker:', error);
    res.status(500).json({ error: 'Server error while linking account.' });
  }
});

// Patient submits weekly exercise
router.post('/me/exercise', auth, async (req, res) => {
  if (req.user?.userType !== 'patient') {
    return res.status(403).json({ error: 'Only patients can submit exercise.' });
  }
  const { weekStart, minutes } = req.body;
  if (!weekStart || typeof minutes !== 'number') {
    return res.status(400).json({ error: 'weekStart (YYYY-MM-DD) and minutes are required.' });
  }
  try {
    // Upsert: if an entry for this week exists, update it
    const result = await pool.query(
      `INSERT INTO exercise_logs (user_id, week_start, minutes)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, week_start) DO UPDATE SET minutes = $3, created_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [req.user.id, weekStart, minutes]
    );
    res.json({ exercise: result.rows[0] });
  } catch (error) {
    console.error('Error submitting exercise:', error);
    res.status(500).json({ error: 'Server error while submitting exercise.' });
  }
});

// Caretaker views a patient's exercise logs
router.get('/me/patients/:patientId/exercise', auth, async (req, res) => {
  if (req.user?.userType !== 'caretaker') {
    return res.status(403).json({ error: 'Only caretakers can view this resource.' });
  }
  const { patientId } = req.params;
  try {
    // Verify the patient is linked to this caretaker
    const patientRes = await pool.query(
      'SELECT id FROM users WHERE id = $1 AND caretaker_id = $2 AND user_type = \'patient\'',
      [patientId, req.user.id]
    );
    if (patientRes.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found or not linked to you.' });
    }
    const logsRes = await pool.query(
      'SELECT * FROM exercise_logs WHERE user_id = $1 ORDER BY week_start DESC',
      [patientId]
    );
    res.json({ exerciseLogs: logsRes.rows });
  } catch (error) {
    console.error('Error fetching exercise logs:', error);
    res.status(500).json({ error: 'Server error while fetching exercise logs.' });
  }
});

export default router; 