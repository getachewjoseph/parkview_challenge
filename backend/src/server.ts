import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import screeningRoutes from './routes/screening';
import usersRoutes from './routes/users';
import fallsRoutes from './routes/falls';
import exerciseRoutes from './routes/exercise';
import favoritesRoutes from './routes/favorites';
import fakeDataRoutes from './routes/fake-data';

dotenv.config();

const app = express();

// CORS configuration - more permissive for development
app.use(cors({
  origin: '*', // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
}));

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/screening', screeningRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/falls', fallsRoutes);
app.use('/api', exerciseRoutes);
app.use('/api/tai-chi', favoritesRoutes);
app.use('/api', fakeDataRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Something broke!',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = parseInt(process.env.PORT || '3000', 10);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/api/health`);
  console.log('CORS enabled for all origins');
});