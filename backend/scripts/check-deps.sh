#!/bin/bash

# Dependency check script for FallGuard backend
# This script checks if all required tools are installed

echo "🔍 Checking dependencies..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
else
    NODE_VERSION=$(node --version)
    echo "✅ Node.js $NODE_VERSION"
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
else
    NPM_VERSION=$(npm --version)
    echo "✅ npm $NPM_VERSION"
fi

# Check Docker (optional)
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo "✅ Docker $DOCKER_VERSION"
else
    echo "⚠️  Docker not found (optional for local development)"
fi

# Check Docker Compose (optional)
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version)
    echo "✅ Docker Compose $COMPOSE_VERSION"
else
    echo "⚠️  Docker Compose not found (optional for local development)"
fi

# Check PostgreSQL client (optional for local development)
if command -v psql &> /dev/null; then
    PSQL_VERSION=$(psql --version)
    echo "✅ PostgreSQL client $PSQL_VERSION"
else
    echo "⚠️  PostgreSQL client not found (optional for local development)"
fi

echo ""
echo "🎉 Dependency check complete!"
echo ""
echo "Next steps:"
echo "1. For Docker setup: npm run start:dev"
echo "2. For local setup: npm install && npm run setup"
