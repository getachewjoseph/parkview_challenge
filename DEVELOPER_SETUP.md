# FallGuard Developer Setup Guide

This guide will help your other developer set up and run the FallGuard app independently, including the PostgreSQL database.

## 🚀 Quick Start (Recommended)

### Prerequisites
- Node.js 18+
- npm or yarn
- Docker & Docker Compose (recommended)
- Git

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd parkview_challenger

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Start the Backend (Database + API)

```bash
cd backend

# Check dependencies
npm run check-deps

# Start everything with Docker (easiest)
npm run start:dev

# Or manually with Docker Compose
npm run docker:up
```

This will:
- Start PostgreSQL on port 1900
- Start the backend API on port 3001
- Automatically create the database schema
- Set up all required tables

### 3. Start the Frontend

```bash
# In a new terminal, from the project root
npm start
```

The app will open in your browser at `http://localhost:3000`

## 🔧 Alternative Setup Options

### Option A: Docker Only (Easiest)

If you have Docker installed, this is the simplest approach:

```bash
cd backend
npm run start:dev
```

This automatically handles:
- PostgreSQL database setup
- Schema creation
- Backend server startup
- Environment configuration

### Option B: Local PostgreSQL

If you prefer to use a local PostgreSQL installation:

1. **Install PostgreSQL locally**
2. **Start PostgreSQL on port 1900**
3. **Setup the database:**

```bash
cd backend
cp env.example .env
npm run setup
npm run dev
```

### Option C: Hybrid (Local PostgreSQL + Docker Backend)

```bash
# Start local PostgreSQL on port 1900
# Then run backend in Docker
cd backend
docker-compose up backend
```

## 📊 Database Management

### View Database
```bash
# Connect to PostgreSQL
psql -h localhost -p 1900 -U postgres -d fallguard

# Or use a GUI tool like pgAdmin, DBeaver, etc.
# Connection: localhost:1900, user: postgres, password: postgres
```

### Reset Database
```bash
cd backend
npm run db:reset
```

### View Logs
```bash
cd backend
npm run docker:logs
```

## 🔍 Troubleshooting

### Common Issues

1. **Port 1900 already in use**
   ```bash
   # Check what's using the port
   lsof -i :1900
   
   # Kill the process or change the port in backend/.env
   ```

2. **Docker not running**
   ```bash
   # Start Docker Desktop
   # Then try again
   npm run docker:up
   ```

3. **Database connection failed**
   ```bash
   # Check if services are running
   docker-compose ps
   
   # Restart services
   npm run docker:down
   npm run docker:up
   ```

4. **Permission denied on scripts**
   ```bash
   # Make scripts executable
   chmod +x backend/scripts/*.sh
   ```

### Environment Variables

The backend uses these default settings:
- **Database**: localhost:1900, user: postgres, password: postgres
- **Backend API**: http://localhost:3001
- **Frontend**: http://localhost:3000

To customize, edit `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=1900
DB_NAME=fallguard
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your-secret-key
```

## 🛠️ Development Workflow

### Daily Development

1. **Start the backend:**
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Start the frontend:**
   ```bash
   # In another terminal
   npm start
   ```

3. **Make changes and test**

4. **Stop services when done:**
   ```bash
   cd backend
   npm run docker:down
   ```

### Useful Commands

```bash
# Backend commands
cd backend
npm run dev          # Start backend only
npm run docker:up    # Start all services
npm run docker:down  # Stop all services
npm run docker:logs  # View logs
npm run db:reset     # Reset database

# Frontend commands
npm start            # Start React Native app
npm run ios          # Run on iOS simulator
npm run android      # Run on Android emulator
```

## 📱 Testing the App

1. **Create test accounts:**
   - Register as a "Patient"
   - Register as a "Caretaker"
   - Link them using the referral code

2. **Test features:**
   - Complete fall risk screening
   - Log fall incidents
   - Track exercise minutes
   - Test settings and text size slider

## 🔐 Security Notes

- The default JWT secret should be changed in production
- Database credentials are for development only
- CORS is configured for localhost development

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Run `npm run check-deps` to verify dependencies
3. Check the logs with `npm run docker:logs`
4. Reset the database with `npm run db:reset`

## 🚀 Production Deployment

For production, you'll need to:

1. Set up a production PostgreSQL instance
2. Configure environment variables
3. Set up SSL/TLS
4. Use proper JWT secrets
5. Configure CORS for production domains

---

**That's it!** Your other developer should now be able to run the entire FallGuard app independently without needing you to start the PostgreSQL server for them.
