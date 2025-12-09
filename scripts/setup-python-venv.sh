#!/bin/bash

# Setup Python Virtual Environment for Backend
# This script creates a virtual environment and installs dependencies

set -e

echo "🐍 Setting up Python virtual environment..."
echo "=========================================="

# Navigate to backend-py directory
cd "$(dirname "$0")/../backend-py"

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check Python version (need 3.8+)
PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
echo "✅ Found Python version: $PYTHON_VERSION"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "📥 Installing Python dependencies..."
pip install -r requirements.txt

echo ""
echo "✅ Python virtual environment setup complete!"
echo ""
echo "To activate manually:"
echo "  cd backend-py && source venv/bin/activate"
echo ""
echo "Virtual environment Python path:"
echo "  $(pwd)/venv/bin/python3"
