#!/bin/bash

# MyDietCoach - iOS Simulator Launcher
# This script helps you easily launch your app on iOS Simulator

echo "🍎 MyDietCoach - iOS Simulator Launcher"
echo "========================================"
echo ""

# Check if Xcode is installed
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ Error: Xcode is not installed"
    echo "Please install Xcode from the Mac App Store"
    exit 1
fi

echo "✅ Xcode is installed"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "✅ Dependencies installed"
echo ""

# Show available simulators
echo "📱 Available iOS Simulators:"
echo "----------------------------"
xcrun simctl list devices available | grep -i "iphone" | head -5
echo ""

# Ask user which method to use
echo "Choose how to start:"
echo "1) Start Expo and manually press 'i' (Recommended)"
echo "2) Boot specific simulator and then start Expo"
echo "3) Run iOS directly"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Starting Expo development server..."
        echo "👉 When you see the menu, press 'i' to open iOS Simulator"
        echo ""
        npx expo start
        ;;
    2)
        echo ""
        echo "Available devices:"
        echo "1) iPhone 16 Pro (Latest)"
        echo "2) iPhone SE (3rd generation) (Compact)"
        echo "3) iPhone 16 Pro Max (Large)"
        echo ""
        read -p "Choose device (1-3): " device_choice
        
        case $device_choice in
            1)
                DEVICE="iPhone 16 Pro"
                UUID="31DD758C-5789-40A3-A5C5-C91AF3FB5223"
                ;;
            2)
                DEVICE="iPhone SE (3rd generation)"
                UUID="C265892F-5DCB-481A-921C-4E6F38C1AE0D"
                ;;
            3)
                DEVICE="iPhone 16 Pro Max"
                UUID="1D7FC124-BCEB-42B9-BE66-6147510133AF"
                ;;
            *)
                echo "Invalid choice. Using iPhone 16 Pro"
                DEVICE="iPhone 16 Pro"
                UUID="31DD758C-5789-40A3-A5C5-C91AF3FB5223"
                ;;
        esac
        
        echo ""
        echo "🔄 Booting $DEVICE..."
        xcrun simctl boot "$UUID" 2>/dev/null || echo "Simulator already booted"
        
        echo "📱 Opening Simulator app..."
        open -a Simulator
        
        echo "⏳ Waiting for simulator to be ready..."
        sleep 3
        
        echo "🚀 Starting Expo..."
        echo "👉 Press 'i' when the menu appears"
        echo ""
        npx expo start
        ;;
    3)
        echo ""
        echo "🚀 Running iOS directly..."
        echo "This will build and install the app"
        echo ""
        npm run ios
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac
