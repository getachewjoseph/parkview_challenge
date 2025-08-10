#!/bin/bash

# Development startup script for FallGuard backend
# This script starts the development environment

set -e

echo "🚀 Starting FallGuard development environment..."

# Check if Docker is available
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo "🐳 Using Docker Compose for development..."
    
    # Start services with Docker Compose
    docker-compose up --build -d
    
    echo "⏳ Waiting for services to be ready..."
    sleep 10
    
    echo "✅ Development environment is ready!"
    echo "📊 PostgreSQL is running on localhost:1900"
    echo "🔧 Backend server is running on localhost:3001"
    echo ""
    echo "To view logs: docker-compose logs -f"
    echo "To stop services: docker-compose down"
    
else
    echo "🐳 Docker not available, using local PostgreSQL..."
    
    # Check if PostgreSQL is running
    if ! pg_isready -h localhost -p 1900 -U postgres > /dev/null 2>&1; then
        echo "❌ PostgreSQL is not running on localhost:1900"
        echo "Please start PostgreSQL manually or install Docker"
        exit 1
    fi
    
    # Setup database
    ./scripts/setup-db.sh
    
    # Start backend server
    echo "🔧 Starting backend server..."
    npm run dev
fi
