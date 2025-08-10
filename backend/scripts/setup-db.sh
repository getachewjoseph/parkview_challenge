#!/bin/bash

# Database setup script for FallGuard backend
# This script sets up PostgreSQL database for local development

set -e

echo "🚀 Setting up FallGuard database..."

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 1900 -U postgres > /dev/null 2>&1; then
    echo "❌ PostgreSQL is not running on localhost:1900"
    echo "Please start PostgreSQL or use Docker Compose"
    exit 1
fi

# Create database if it doesn't exist
echo "📦 Creating database 'fallguard'..."
psql -h localhost -p 1900 -U postgres -c "CREATE DATABASE fallguard;" 2>/dev/null || echo "Database 'fallguard' already exists"

# Run schema
echo "📋 Running database schema..."
psql -h localhost -p 1900 -U postgres -d fallguard -f src/db/schema.sql

echo "✅ Database setup complete!"
echo "You can now start the backend server with: npm run dev"
