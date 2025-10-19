#!/bin/bash

# PostgreSQL Migration Setup Script for Diet Coach App

echo "🚀 Starting PostgreSQL Migration Setup..."
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed!"
    echo "📦 Installing PostgreSQL via Homebrew..."
    brew install postgresql
    brew services start postgresql
else
    echo "✅ PostgreSQL is already installed"
fi

# Check if database exists
DB_EXISTS=$(psql -lqt | cut -d \| -f 1 | grep -w mydietcoach | wc -l)

if [ $DB_EXISTS -eq 0 ]; then
    echo "📊 Creating mydietcoach database..."
    createdb mydietcoach
    echo "✅ Database created successfully"
else
    echo "✅ Database mydietcoach already exists"
fi

# Run schema migration
echo "📝 Running schema migration..."
psql mydietcoach < database/schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Schema migration completed successfully"
else
    echo "❌ Schema migration failed"
    exit 1
fi

# Install npm dependencies
echo "📦 Installing npm dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "🎉 PostgreSQL Migration Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Update your .env.local file with the correct DATABASE_URL"
echo "2. Review DATABASE_MIGRATION.md for detailed instructions"
echo "3. Update your context providers to use the new database API"
echo "4. Test the application"
echo ""
echo "Default connection string:"
echo "EXPO_PUBLIC_DATABASE_URL=postgresql://localhost:5432/mydietcoach"
echo ""
