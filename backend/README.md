# FallGuard Backend

This is the backend server for the FallGuard app, providing API endpoints for user management, fall tracking, and screening data.

## 🚀 Quick Start

### Option 1: Using Docker (Recommended)

The easiest way to get started is using Docker Compose, which will set up both PostgreSQL and the backend server automatically.

```bash
# Clone the repository and navigate to backend
cd backend

# Start the development environment
npm run start:dev

# Or manually with Docker Compose
npm run docker:up
```

### Option 2: Local PostgreSQL

If you prefer to use a local PostgreSQL installation:

```bash
# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Setup database (requires PostgreSQL running on localhost:1900)
npm run setup

# Start development server
npm run dev
```

## 📋 Prerequisites

### For Docker Setup
- Docker
- Docker Compose

### For Local Setup
- Node.js 18+
- PostgreSQL 15+
- PostgreSQL client tools (`psql`)

## 🔧 Configuration

### Environment Variables

Copy `env.example` to `.env` and configure:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=1900
DB_NAME=fallguard
DB_USER=postgres
DB_PASSWORD=postgres

# JWT Configuration
JWT_SECRET=your-secret-key-change-this-in-production

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### Database Setup

The database schema is automatically created when using Docker Compose. For local setup, run:

```bash
npm run setup
```

## 🐳 Docker Commands

```bash
# Start services
npm run docker:up

# Stop services
npm run docker:down

# View logs
npm run docker:logs

# Reset database (removes all data)
npm run db:reset
```

## 📊 Database Schema

The database includes the following tables:

- **users**: User accounts (patients and caretakers)
- **screenings**: Fall risk screening data
- **falls**: Fall incident logs
- **exercise_logs**: Weekly exercise tracking
- **tai_chi_favorites**: User's favorite Tai Chi locations

## 🔌 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user

### Screenings
- `POST /screenings` - Submit screening data
- `GET /screenings` - Get user's screening history

### Falls
- `POST /falls` - Log a fall incident
- `GET /falls` - Get user's fall history

### Exercise
- `POST /exercise` - Log exercise minutes
- `GET /exercise` - Get exercise history

### Users
- `GET /users/referral-code` - Get referral code (caretakers)
- `PUT /users/referral-code` - Update referral code
- `POST /users/link-caretaker` - Link patient to caretaker

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run setup        # Setup database schema
npm run start:dev    # Start full development environment
```

### Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── db/             # Database schema and migrations
│   ├── middleware/     # Express middleware
│   ├── routes/         # API route handlers
│   ├── types/          # TypeScript type definitions
│   └── server.ts       # Main server file
├── scripts/            # Setup and utility scripts
├── docker-compose.yml  # Docker services configuration
├── Dockerfile         # Backend container definition
└── package.json       # Dependencies and scripts
```

## 🔍 Troubleshooting

### Common Issues

1. **Port 1900 already in use**
   ```bash
   # Check what's using the port
   lsof -i :1900
   
   # Kill the process or change the port in .env
   ```

2. **Database connection failed**
   ```bash
   # Check if PostgreSQL is running
   pg_isready -h localhost -p 1900 -U postgres
   
   # Restart Docker services
   npm run docker:down
   npm run docker:up
   ```

3. **Permission denied on scripts**
   ```bash
   # Make scripts executable
   chmod +x scripts/*.sh
   ```

### Logs

View application logs:
```bash
# Docker logs
npm run docker:logs

# Or directly
docker-compose logs -f backend
```

## 🚀 Deployment

For production deployment, ensure to:

1. Change the JWT secret
2. Use environment-specific database credentials
3. Configure proper CORS origins
4. Set up SSL/TLS
5. Use a production PostgreSQL instance

## 📝 Contributing

1. Create a feature branch
2. Make your changes
3. Test with the provided scripts
4. Submit a pull request

## 📞 Support

For issues or questions, please check the troubleshooting section above or contact the development team.
