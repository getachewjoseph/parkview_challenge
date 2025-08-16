import { Router, Request, Response } from 'express';
import { pool } from '../config/database';
import { auth } from '../middleware/auth';

const router = Router();

router.get('/favorites', auth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    const result = await pool.query(
      'SELECT location_id FROM tai_chi_favorites WHERE user_id = $1',
      [userId]
    );
    
    const favoriteIds = result.rows.map((row: any) => row.location_id);
    res.json({ favoriteIds });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

router.post('/favorites/:locationId', auth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const locationId = parseInt(req.params.locationId);
    
    if (isNaN(locationId)) {
      return res.status(400).json({ error: 'Invalid location ID' });
    }
    
    await pool.query(
      'INSERT INTO tai_chi_favorites (user_id, location_id) VALUES ($1, $2) ON CONFLICT (user_id, location_id) DO NOTHING',
      [userId, locationId]
    );
    
    res.json({ message: 'Location added to favorites' });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

router.delete('/favorites/:locationId', auth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const locationId = parseInt(req.params.locationId);
    
    if (isNaN(locationId)) {
      return res.status(400).json({ error: 'Invalid location ID' });
    }
    
    await pool.query(
      'DELETE FROM tai_chi_favorites WHERE user_id = $1 AND location_id = $2',
      [userId, locationId]
    );
    
    res.json({ message: 'Location removed from favorites' });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

export default router;