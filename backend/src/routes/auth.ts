import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';
import { auth } from '../middleware/auth';
import crypto from 'crypto';

const router = express.Router();

// Helper to generate a unique referral code
const generateReferralCode = async (): Promise<string> => {
  let code: string;
  let isUnique = false;
  while (!isUnique) {
    code = crypto.randomBytes(3).toString('hex').toUpperCase();
    const { rows } = await pool.query('SELECT id FROM users WHERE referral_code = $1', [code]);
    if (rows.length === 0) {
      isUnique = true;
    }
  }
  return code!;
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, userType, referralCode } = req.body;

    // Check if user exists
    const userExists = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    let finalReferralCode: string | null = null;
    let caretakerId: number | null = null;

    if (userType === 'caretaker') {
      if (referralCode) {
        // Validate the user-provided code
        const { rows } = await pool.query('SELECT id FROM users WHERE referral_code = $1', [referralCode.toUpperCase()]);
        if (rows.length > 0) {
          return res.status(409).json({ error: 'This referral code is already in use.' });
        }
        finalReferralCode = referralCode.toUpperCase();
      } else {
        // Generate a new code if one isn't provided
        finalReferralCode = await generateReferralCode();
      }
    } else if (userType === 'patient' && referralCode) {
      const { rows } = await pool.query('SELECT id FROM users WHERE referral_code = $1 AND user_type = \'caretaker\'', [referralCode.toUpperCase()]);
      if (rows.length === 0) {
        return res.status(400).json({ error: 'Invalid referral code' });
      }
      caretakerId = rows[0].id;
    }

    // Create user
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, user_type, referral_code, caretaker_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, referral_code',
      [email, passwordHash, userType, finalReferralCode, caretakerId]
    );

    const newUser = result.rows[0];

    // Generate token
    const token = jwt.sign(
      { id: newUser.id, email, userType },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({ token, userType, referralCode: newUser.referral_code });
  } catch (error) {
    console.error('Error during registration:', error);

    if (error && typeof error === 'object' && 'code' in error) {
      const pgError = error as { code: string; detail?: string; table?: string; column?: string };
      // '42P01' for undefined_table, '42703' for undefined_column
      if (pgError.code === '42P01' || pgError.code === '42703') {
        return res.status(500).json({
          error: 'Database schema mismatch. Have you applied the latest schema changes?',
          details: `Details: ${pgError.detail}`
        });
      }
    }

    res.status(500).json({ error: 'Server error', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, userType: user.user_type },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({ token, userType: user.user_type });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user profile
router.get('/me', auth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, email, user_type, caretaker_id, referral_code FROM users WHERE id = $1', [req.user!.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = rows[0];
    res.json({
      id: user.id,
      email: user.email,
      userType: user.user_type,
      caretakerId: user.caretaker_id,
      referralCode: user.referral_code,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Manage referral code (for caretakers)
router.route('/referral-code')
  .get(auth, async (req, res) => {
    if (req.user?.userType !== 'caretaker') {
      return res.status(403).json({ error: 'Only caretakers can access this resource' });
    }
    try {
      const { rows } = await pool.query('SELECT referral_code FROM users WHERE id = $1', [req.user.id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ referralCode: rows[0].referral_code });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  })
  .put(auth, async (req, res) => {
    if (req.user?.userType !== 'caretaker') {
      return res.status(403).json({ error: 'Only caretakers can perform this action' });
    }
    const { referralCode } = req.body;
    if (!referralCode || typeof referralCode !== 'string' || referralCode.length < 4) {
      return res.status(400).json({ error: 'Referral code must be at least 4 characters long' });
    }
    try {
      // Check if the new code is already taken
      const { rows } = await pool.query('SELECT id FROM users WHERE referral_code = $1 AND id != $2', [referralCode.toUpperCase(), req.user.id]);
      if (rows.length > 0) {
        return res.status(409).json({ error: 'This referral code is already in use.' });
      }
      
      await pool.query('UPDATE users SET referral_code = $1 WHERE id = $2', [referralCode.toUpperCase(), req.user.id]);
      res.json({ message: 'Referral code updated successfully', referralCode });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

export default router; 