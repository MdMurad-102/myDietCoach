#!/bin/bash

# Kill any existing processes
echo "Stopping any existing servers..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:8081 | xargs kill -9 2>/dev/null || true

# Start backend server
echo "Starting backend server on port 3000..."
cd /Users/rere-admin1/Documents/Mobile_App/myDietCoach/backend
nohup node server.js > backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend server started with PID: $BACKEND_PID"

# Wait for backend to start
sleep 2

# Test backend
echo "Testing backend..."
curl -s http://localhost:3000/health || echo "Backend not responding"

echo ""
echo "✅ Backend server is running!"
echo "📡 API URL: http://192.168.1.110:3000/api"
echo "📋 Logs: tail -f backend/backend.log"
echo ""
echo "Now start your mobile app from the ROOT directory:"
echo "cd /Users/rere-admin1/Documents/Mobile_App/myDietCoach"
echo "npx expo start --clear"
