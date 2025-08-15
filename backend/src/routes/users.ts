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
    // Check if an entry for this week already exists
    const existingLog = await pool.query(
      'SELECT * FROM exercise_logs WHERE user_id = $1 AND week_start = $2',
      [req.user.id, weekStart]
    );

    let result;
    if (existingLog.rows.length > 0) {
      // Update existing log
      result = await pool.query(
        'UPDATE exercise_logs SET minutes = $1, created_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND week_start = $3 RETURNING *',
        [minutes, req.user.id, weekStart]
      );
    } else {
      // Create new log
      result = await pool.query(
        'INSERT INTO exercise_logs (user_id, week_start, minutes) VALUES ($1, $2, $3) RETURNING *',
        [req.user.id, weekStart, minutes]
      );
    }
    
    return res.json({ exercise: result.rows[0] });
  } catch (error) {
    console.error('Error submitting exercise:', error);
    return res.status(500).json({ error: 'Server error while submitting exercise.' });
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

// Get analytics data for current user (patients) or specific patient (caretakers)
router.get('/me/analytics', auth, async (req, res) => {
  try {
    const userId = req.user?.userType === 'patient' ? req.user.id : null;
    
    if (!userId) {
      return res.status(403).json({ error: 'Patients only endpoint' });
    }

    // Get user's exercise logs for last 12 weeks
    const exerciseRes = await pool.query(
      `SELECT week_start, minutes 
       FROM exercise_logs 
       WHERE user_id = $1 
       AND week_start >= CURRENT_DATE - INTERVAL '12 weeks'
       ORDER BY week_start ASC`,
      [userId]
    );

    // Get user's falls for last 6 months
    const fallsRes = await pool.query(
      `SELECT fall_date, location, activity, cause, injuries
       FROM falls 
       WHERE user_id = $1 
       AND fall_date >= CURRENT_DATE - INTERVAL '6 months'
       ORDER BY fall_date DESC`,
      [userId]
    );

    // Get user's latest screening
    const screeningRes = await pool.query(
      `SELECT unsteady, worries, fallen, fall_count, fall_injured, created_at
       FROM screenings 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [userId]
    );

    // Calculate risk score based on various factors
    const riskFactors = {
      hasRecentFalls: fallsRes.rows.length > 0,
      fallCount: fallsRes.rows.length,
      lowExercise: exerciseRes.rows.filter((log: any) => log.minutes < 50).length,
      screeningRisk: screeningRes.rows.length > 0 ? 
        (screeningRes.rows[0].unsteady || screeningRes.rows[0].worries || screeningRes.rows[0].fallen) : false
    };

    let riskScore = 0;
    if (riskFactors.hasRecentFalls) riskScore += 30;
    if (riskFactors.fallCount > 2) riskScore += 20;
    if (riskFactors.lowExercise > 4) riskScore += 25;
    if (riskFactors.screeningRisk) riskScore += 25;

    return res.json({
      exerciseLogs: exerciseRes.rows,
      falls: fallsRes.rows,
      screening: screeningRes.rows[0] || null,
      riskScore: Math.min(riskScore, 100),
      riskFactors
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return res.status(500).json({ error: 'Server error while fetching analytics.' });
  }
});

// Get analytics data for a specific patient (caretakers only)
router.get('/me/patients/:patientId/analytics', auth, async (req, res) => {
  if (req.user?.userType !== 'caretaker') {
    return res.status(403).json({ error: 'Only caretakers can access this resource.' });
  }

  const { patientId } = req.params;

  try {
    // Verify the patient is linked to this caretaker
    const patientRes = await pool.query(
      'SELECT id, full_name FROM users WHERE id = $1 AND caretaker_id = $2 AND user_type = \'patient\'',
      [patientId, req.user.id]
    );

    if (patientRes.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found or not linked to you.' });
    }

    const patient = patientRes.rows[0];

    // Get patient's exercise logs for last 12 weeks
    const exerciseRes = await pool.query(
      `SELECT week_start, minutes 
       FROM exercise_logs 
       WHERE user_id = $1 
       AND week_start >= CURRENT_DATE - INTERVAL '12 weeks'
       ORDER BY week_start ASC`,
      [patientId]
    );

    // Get patient's falls for last 6 months
    const fallsRes = await pool.query(
      `SELECT fall_date, location, activity, cause, injuries
       FROM falls 
       WHERE user_id = $1 
       AND fall_date >= CURRENT_DATE - INTERVAL '6 months'
       ORDER BY fall_date DESC`,
      [patientId]
    );

    // Get patient's latest screening
    const screeningRes = await pool.query(
      `SELECT unsteady, worries, fallen, fall_count, fall_injured, created_at
       FROM screenings 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [patientId]
    );

    // Calculate risk score
    const riskFactors = {
      hasRecentFalls: fallsRes.rows.length > 0,
      fallCount: fallsRes.rows.length,
      lowExercise: exerciseRes.rows.filter((log: any) => log.minutes < 50).length,
      screeningRisk: screeningRes.rows.length > 0 ? 
        (screeningRes.rows[0].unsteady || screeningRes.rows[0].worries || screeningRes.rows[0].fallen) : false
    };

    let riskScore = 0;
    if (riskFactors.hasRecentFalls) riskScore += 30;
    if (riskFactors.fallCount > 2) riskScore += 20;
    if (riskFactors.lowExercise > 4) riskScore += 25;
    if (riskFactors.screeningRisk) riskScore += 25;

    return res.json({
      patient,
      exerciseLogs: exerciseRes.rows,
      falls: fallsRes.rows,
      screening: screeningRes.rows[0] || null,
      riskScore: Math.min(riskScore, 100),
      riskFactors
    });
  } catch (error) {
    console.error('Error fetching patient analytics:', error);
    return res.status(500).json({ error: 'Server error while fetching patient analytics.' });
  }
});

export default router; 