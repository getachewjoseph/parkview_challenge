import express, { Response } from 'express';
import { auth } from '../middleware/auth';
import { pool } from '../config/database';

const router = express.Router();

// POST /api/screening
router.post('/', auth, async (req, res: Response) => {
  try {
    const { unsteady, worries, fallen, fallCount, fallInjured } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    if (typeof unsteady !== 'boolean' || typeof worries !== 'boolean' || typeof fallen !== 'boolean') {
      res.status(400).json({ error: 'Invalid input: unsteady, worries, and fallen must be boolean values' });
      return;
    }

    console.log('Attempting to insert screening:', {
      userId,
      unsteady,
      worries,
      fallen,
      fallCount,
      fallInjured
    });

    const result = await pool.query(
      `INSERT INTO screenings (user_id, unsteady, worries, fallen, fall_count, fall_injured)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        userId,
        unsteady,
        worries,
        fallen,
        fallCount ? parseInt(fallCount, 10) : null,
        fallInjured || null,
      ]
    );

    console.log('Screening inserted successfully:', result.rows[0]);

    res.status(201).json({ 
      message: 'Screening submitted',
      screeningId: result.rows[0].id
    });
  } catch (error) {
    console.error('Error in screening submission:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('violates foreign key constraint')) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }
      if (error.message.includes('violates not-null constraint')) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }
    }
    
    res.status(500).json({ 
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/screening
router.get('/', auth, async (req, res: Response) => {
  const userId = req.user?.id;
  const userType = req.user?.userType;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    let query;
    if (userType === 'patient') {
      query = {
        text: 'SELECT * FROM screenings WHERE user_id = $1 ORDER BY created_at DESC',
        values: [userId],
      };
    } else if (userType === 'caretaker') {
      query = {
        text: `
          SELECT s.*, u.email as patient_email
          FROM screenings s
          JOIN users u ON s.user_id = u.id
          WHERE u.caretaker_id = $1
          ORDER BY s.created_at DESC
        `,
        values: [userId],
      };
    } else {
      return res.status(403).json({ error: 'Invalid user type' });
    }

    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching screenings:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
