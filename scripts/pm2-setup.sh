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

# Install/update frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install --legacy-peer-deps

# Check if frontend is built
if [ ! -d "dist" ]; then
    echo "📦 Building frontend..."
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

# Setup Python virtual environment
echo "🐍 Setting up Python virtual environment..."
if [ ! -d "backend-py/venv" ]; then
    echo "📦 Creating Python virtual environment and installing dependencies..."
    ./scripts/setup-python-venv.sh
    echo "✅ Python virtual environment created"
else
    echo "✅ Python virtual environment already exists"
    # Check if uvicorn is installed in venv
    if ! ./backend-py/venv/bin/python3 -c "import uvicorn" &> /dev/null; then
        echo "📦 Installing Python dependencies in virtual environment..."
        cd backend-py
        source venv/bin/activate
        pip install -r requirements.txt
        cd ..
        echo "✅ Python dependencies installed"
    else
        echo "✅ Python dependencies already installed in virtual environment"
    fi
fi

# Check .env file
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Make sure to create one with necessary environment variables."
else
    echo "✅ .env file found"
fi

echo ""
echo "🎯 Setup complete! You can now run:"
echo "   pm2 start ecosystem.config.cjs"
echo ""
echo "Or use individual commands:"
echo "   pm2 start ecosystem.config.cjs --only web-frontend"
echo "   pm2 start ecosystem.config.cjs --only node-backend"
echo "   pm2 start ecosystem.config.cjs --only python-backend"
echo ""
