#!/bin/bash

# MyDietCoach Backend Setup Script

echo "🚀 Setting up MyDietCoach Backend Server..."
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed!"
    echo "Please install PostgreSQL first:"
    echo "  Mac: brew install postgresql"
    echo "  Linux: sudo apt-get install postgresql"
    exit 1
fi

echo "✅ PostgreSQL found"

# Navigate to backend directory
cd "$(dirname "$0")"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"

# Check if .env exists
if [ ! -f .env ]; then
    echo ""
    echo "⚙️  Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Please update .env with your database credentials!"
    echo ""
    read -p "Press Enter to continue..."
fi

# Ask to create database
echo ""
read -p "📊 Do you want to create the database? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter database name (default: mydietcoach): " dbname
    dbname=${dbname:-mydietcoach}
    
    createdb $dbname 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "✅ Database '$dbname' created successfully"
    else
        echo "⚠️  Database might already exist or creation failed"
    fi
fi

# Ask to run migrations
echo ""
read -p "🔄 Do you want to run database migrations? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run migrate
    
    if [ $? -eq 0 ]; then
        echo "✅ Migrations completed successfully"
    else
        echo "❌ Migrations failed - please check your database configuration"
        exit 1
    fi
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the server:"
echo "  npm run dev    (development mode with auto-reload)"
echo "  npm start      (production mode)"
echo ""
echo "Server will run on: http://localhost:3000"
echo ""
