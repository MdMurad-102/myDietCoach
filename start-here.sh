#!/bin/bash

# MyDietCoach - START HERE
# This script will guide you through the setup process

clear
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║         Welcome to MyDietCoach Cloud Database Setup!          ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "This script will help you migrate from local storage to cloud database."
echo ""
echo "📋 What we'll do:"
echo "  1. Install backend dependencies"
echo "  2. Setup PostgreSQL database"
echo "  3. Run database migrations"
echo "  4. Start the API server"
echo "  5. Update your mobile app"
echo ""
read -p "Press Enter to continue..."

# Step 1: Check prerequisites
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1: Checking Prerequisites..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "✅ Node.js installed: $NODE_VERSION"
else
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js from: https://nodejs.org/"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo "✅ npm installed: $NPM_VERSION"
else
    echo "❌ npm is not installed!"
    exit 1
fi

# Check PostgreSQL
if command -v psql &> /dev/null; then
    PSQL_VERSION=$(psql --version)
    echo "✅ PostgreSQL installed: $PSQL_VERSION"
else
    echo "❌ PostgreSQL is not installed!"
    echo ""
    echo "Install PostgreSQL:"
    echo "  Mac:   brew install postgresql"
    echo "  Linux: sudo apt-get install postgresql"
    echo ""
    read -p "Do you want to continue without PostgreSQL? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Step 2: Install backend dependencies
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Installing Backend Dependencies..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd backend
echo "📦 Running npm install..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully!"

# Step 3: Setup .env file
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3: Setting up Configuration..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ ! -f .env ]; then
    echo "⚙️  Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created!"
    echo ""
    echo "⚠️  IMPORTANT: Please update the following in .env:"
    echo ""
    echo "DATABASE_URL=postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/mydietcoach"
    echo ""
    echo "Replace YOUR_USERNAME and YOUR_PASSWORD with your PostgreSQL credentials"
    echo ""
    read -p "Press Enter after you've updated .env..."
else
    echo "✅ .env file already exists"
fi

# Step 4: Create database
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 4: Creating Database..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

read -p "Do you want to create the 'mydietcoach' database? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    createdb mydietcoach 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "✅ Database 'mydietcoach' created successfully!"
    else
        echo "⚠️  Database might already exist or creation failed"
        echo "You can create it manually: createdb mydietcoach"
    fi
fi

# Step 5: Run migrations
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 5: Running Database Migrations..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

read -p "Run database migrations now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run migrate
    
    if [ $? -eq 0 ]; then
        echo "✅ Migrations completed successfully!"
    else
        echo "❌ Migrations failed!"
        echo "Check your DATABASE_URL in .env file"
        exit 1
    fi
fi

# Step 6: Get IP address for mobile app
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 6: Mobile App Configuration..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "Finding your computer's IP address..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    IP_ADDRESS=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)
else
    # Linux
    IP_ADDRESS=$(hostname -I | awk '{print $1}')
fi

echo ""
echo "📱 Your computer's IP address is: $IP_ADDRESS"
echo ""
echo "To connect your mobile app to this server:"
echo ""
echo "1. Open:  service/api.cloud.ts"
echo "2. Change line 11 to:"
echo "   const API_URL = 'http://$IP_ADDRESS:3000/api';"
echo ""
echo "3. Switch to cloud API:"
echo "   mv service/api.ts service/api.local.ts"
echo "   mv service/api.cloud.ts service/api.ts"
echo ""
echo "4. Restart mobile app:"
echo "   npx expo start --clear"
echo ""
read -p "Press Enter to continue..."

# Step 7: Ready to start
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Backend dependencies installed"
echo "✅ Database created and migrated"
echo "✅ Configuration complete"
echo ""
echo "🚀 Next Steps:"
echo ""
echo "1. Start the backend server:"
echo "   npm run dev"
echo ""
echo "2. In a new terminal, start the mobile app:"
echo "   npx expo start --clear"
echo ""
echo "3. Test your setup:"
echo "   curl http://localhost:3000/health"
echo ""
echo "📚 Documentation:"
echo "   • backend/README.md     - Full documentation"
echo "   • backend/QUICKSTART.md - Quick start guide"
echo "   • backend/ARCHITECTURE.md - Architecture diagrams"
echo "   • backend/SUMMARY.md    - Complete summary"
echo ""
read -p "Do you want to start the server now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Starting server..."
    echo "Press Ctrl+C to stop"
    echo ""
    npm run dev
else
    echo ""
    echo "To start the server later, run:"
    echo "  cd backend"
    echo "  npm run dev"
    echo ""
fi
