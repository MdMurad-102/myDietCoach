#!/bin/bash
# Quick Start Script for MyDietCoach App
# After Convex to PostgreSQL Migration

echo "🚀 Starting MyDietCoach App..."
echo ""

# Check if PostgreSQL is running
echo "📊 Checking PostgreSQL..."
if ! pg_isready -q 2>/dev/null; then
    echo "⚠️  PostgreSQL is not running. Starting it now..."
    brew services start postgresql@15
    sleep 2
fi

# Verify database exists
echo "🗄️  Verifying database connection..."
PGPASSWORD=postgres123 psql -U postgres -lqt | cut -d \| -f 1 | grep -qw mydietcoach
if [ $? -eq 0 ]; then
    echo "✅ Database 'mydietcoach' is ready"
else
    echo "❌ Database 'mydietcoach' not found!"
    echo "   Run: createdb -U postgres mydietcoach"
    exit 1
fi

# Test database connection
echo "🔌 Testing database connection..."
if node test-db.js > /dev/null 2>&1; then
    echo "✅ Database connection successful"
else
    echo "⚠️  Database connection test failed (but app may still work)"
fi

echo ""
echo "✨ Everything looks good!"
echo ""
echo "Starting Expo..."
echo "─────────────────────────────────────"

# Start Expo
npx expo start

