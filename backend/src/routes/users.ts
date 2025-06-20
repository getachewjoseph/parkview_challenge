import express from 'express';
import { auth } from '../middleware/auth';
import { pool } from '../config/database';

const router = express.Router();

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

export default router; 