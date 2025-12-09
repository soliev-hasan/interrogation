#!/bin/bash

# PM2 Setup Script
# This script helps set up and run the application with PM2

set -e

echo "🚀 PM2 Setup Script"
echo "==================="

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 is not installed. Installing PM2..."
    npm install -g pm2
    echo "✅ PM2 installed successfully"
else
    echo "✅ PM2 is already installed"
fi

# Create logs directories
echo "📁 Creating logs directories..."
mkdir -p logs backend/logs
echo "✅ Logs directories created"

# Check if frontend is built
if [ ! -d "dist" ]; then
    echo "📦 Building frontend..."
    npm install
    npm run build
    echo "✅ Frontend built successfully"
else
    echo "✅ Frontend already built"
fi

# Check if backend is built
if [ ! -d "backend/dist" ]; then
    echo "📦 Building Node.js backend..."
    cd backend
    npm install
    npm run build
    cd ..
    echo "✅ Backend built successfully"
else
    echo "✅ Backend already built"
fi

# Check Python dependencies
echo "🐍 Checking Python dependencies..."
cd backend-py
if ! python3 -c "import fastapi" &> /dev/null; then
    echo "📦 Installing Python dependencies..."
    pip3 install -r requirements.txt
    echo "✅ Python dependencies installed"
else
    echo "✅ Python dependencies already installed"
fi
cd ..

# Check .env file
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Make sure to create one with necessary environment variables."
else
    echo "✅ .env file found"
fi

echo ""
echo "🎯 Setup complete! You can now run:"
echo "   pm2 start ecosystem.config.js"
echo ""
echo "Or use individual commands:"
echo "   pm2 start ecosystem.config.js --only web-frontend"
echo "   pm2 start ecosystem.config.js --only node-backend"
echo "   pm2 start ecosystem.config.js --only python-backend"
echo ""
