#!/bin/bash

# Detect Python path for PM2 configuration
# This script helps identify the correct Python interpreter to use

echo "🔍 Detecting Python interpreter..."
echo "=================================="
echo ""

# Check for virtual environment
if [ -f "./backend-py/venv/bin/python3" ]; then
    echo "✅ Found virtual environment:"
    echo "   ./backend-py/venv/bin/python3"
    echo ""
    echo "To use this, update ecosystem.config.cjs:"
    echo "   script: \"./backend-py/venv/bin/python3\""
    exit 0
fi

# Check for pyenv
if command -v pyenv &> /dev/null; then
    PYENV_PYTHON=$(pyenv which python3 2>/dev/null)
    if [ -n "$PYENV_PYTHON" ]; then
        echo "✅ Found pyenv Python:"
        echo "   $PYENV_PYTHON"
        echo ""
        echo "To use this, update ecosystem.config.cjs:"
        echo "   script: \"$PYENV_PYTHON\""
        exit 0
    fi
fi

# Check system Python
SYSTEM_PYTHON=$(which python3)
if [ -n "$SYSTEM_PYTHON" ]; then
    echo "⚠️  Found system Python:"
    echo "   $SYSTEM_PYTHON"
    echo ""
    
    # Check if uvicorn is installed
    if python3 -c "import uvicorn" &> /dev/null; then
        echo "✅ uvicorn is installed in system Python"
        echo ""
        echo "To use this, update ecosystem.config.cjs:"
        echo "   script: \"python3\""
    else
        echo "❌ uvicorn is NOT installed in system Python"
        echo ""
        echo "Recommendation: Create a virtual environment:"
        echo "   ./scripts/setup-python-venv.sh"
        echo ""
        echo "Or install uvicorn globally:"
        echo "   pip3 install uvicorn[standard] fastapi python-multipart"
    fi
fi
