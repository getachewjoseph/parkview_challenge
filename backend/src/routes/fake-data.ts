import express from 'express';
import { pool } from '../config/database';
import { auth } from '../middleware/auth';

const router = express.Router();

// Generate fake data for testing - this should only be used in development
router.post('/generate-fake-data', auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    // Get user details to verify it's the correct patient
    const userResult = await pool.query(
      'SELECT id, email, full_name, user_type FROM users WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
    if (user.user_type !== 'patient') {
      return res.status(403).json({ error: 'Only patients can generate fake data' });
    }
    
    // Clear existing data for this user
    await pool.query('DELETE FROM falls WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM exercise_logs WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM screenings WHERE user_id = $1', [userId]);
    
    // Generate data for the past 8 months
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 8);
    
    // Generate falls data (realistic pattern - not every day)
    const fallLocations = ['Living Room', 'Kitchen', 'Bathroom', 'Bedroom', 'Garden', 'Stairs', 'Driveway'];
    const fallActivities = ['Walking', 'Getting up from chair', 'Showering', 'Cooking', 'Gardening', 'Going to bathroom', 'Getting dressed'];
    const fallCauses = ['Slipped on wet floor', 'Lost balance', 'Tripped on rug', 'Dizziness', 'Weakness in legs', 'Poor lighting', 'Cluttered space'];
    const fallInjuries = ['Minor bruising', 'Scraped knee', 'Sore hip', 'Twisted ankle', 'None', 'Minor cut', 'Sore shoulder'];
    
    // Generate 3-5 falls over 8 months (realistic frequency)
    const numberOfFalls = Math.floor(Math.random() * 3) + 3; // 3-5 falls
    const fallDates = [];
    
    for (let i = 0; i < numberOfFalls; i++) {
      const fallDate = new Date(startDate.getTime() + Math.random() * (Date.now() - startDate.getTime()));
      fallDates.push(fallDate);
    }
    
    // Sort fall dates chronologically
    fallDates.sort((a, b) => a.getTime() - b.getTime());
    
    // Insert falls
    for (const fallDate of fallDates) {
      const location = fallLocations[Math.floor(Math.random() * fallLocations.length)];
      const activity = fallActivities[Math.floor(Math.random() * fallActivities.length)];
      const cause = fallCauses[Math.floor(Math.random() * fallCauses.length)];
      const injuries = fallInjuries[Math.floor(Math.random() * fallInjuries.length)];
      
      await pool.query(
        'INSERT INTO falls (user_id, fall_date, location, activity, cause, injuries) VALUES ($1, $2, $3, $4, $5, $6)',
        [userId, fallDate, location, activity, cause, injuries]
      );
    }
    
    // Generate exercise logs for each week (32 weeks = 8 months)
    const exerciseMinutes = [];
    for (let week = 0; week < 32; week++) {
      // Realistic exercise pattern: 30-120 minutes per week, with some weeks having 0
      let minutes;
      if (Math.random() < 0.1) { // 10% chance of no exercise
        minutes = 0;
      } else {
        minutes = Math.floor(Math.random() * 90) + 30; // 30-120 minutes
      }
      exerciseMinutes.push(minutes);
    }
    
    // Insert exercise logs
    for (let week = 0; week < 32; week++) {
      const weekStart = new Date(startDate);
      weekStart.setDate(weekStart.getDate() + (week * 7));
      
      await pool.query(
        'INSERT INTO exercise_logs (user_id, week_start, minutes) VALUES ($1, $2, $3)',
        [userId, weekStart, exerciseMinutes[week]]
      );
    }
    
    // Generate screening data (2-3 screenings over 8 months)
    const screeningDates = [];
    const numberOfScreenings = Math.floor(Math.random() * 2) + 2; // 2-3 screenings
    
    for (let i = 0; i < numberOfScreenings; i++) {
      const screeningDate = new Date(startDate.getTime() + Math.random() * (Date.now() - startDate.getTime()));
      screeningDates.push(screeningDate);
    }
    
    screeningDates.sort((a, b) => a.getTime() - b.getTime());
    
    // Insert screenings
    for (const screeningDate of screeningDates) {
      const unsteady = Math.random() < 0.4; // 40% chance
      const worries = Math.random() < 0.6; // 60% chance
      const fallen = Math.random() < 0.3; // 30% chance
      const fallCount = Math.floor(Math.random() * 3) + 1; // 1-3 falls
      const fallInjured = Math.random() < 0.5 ? 'Minor injuries' : 'No injuries';
      
      await pool.query(
        'INSERT INTO screenings (user_id, unsteady, worries, fallen, fall_count, fall_injured, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [userId, unsteady, worries, fallen, fallCount, fallInjured, screeningDate]
      );
    }
    
    res.json({ 
      message: 'Fake data generated successfully',
      user: user.full_name,
      fallsGenerated: numberOfFalls,
      exerciseWeeksGenerated: 32,
      screeningsGenerated: numberOfScreenings,
      dataPeriod: '8 months'
    });
    
  } catch (error) {
    console.error('Error generating fake data:', error);
    res.status(500).json({ error: 'Failed to generate fake data' });
  }
});

export default router;
