#!/bin/bash

# Fix Rollup native binary issue on Ubuntu/Linux
# This script removes macOS-specific rollup and lets npm install the correct one

set -e

echo "🔧 Fixing Rollup native binary for Linux..."
echo "==========================================="

cd "$(dirname "$0")/.."

# Remove macOS-specific rollup if it exists
if [ -d "node_modules/@rollup/rollup-darwin-arm64" ]; then
    echo "🗑️  Removing macOS-specific rollup binary..."
    rm -rf node_modules/@rollup/rollup-darwin-arm64
fi

# Remove node_modules/@rollup to force reinstall
if [ -d "node_modules/@rollup" ]; then
    echo "🗑️  Removing @rollup directory to force reinstall..."
    rm -rf node_modules/@rollup
fi

# Remove package-lock.json to regenerate with correct platform binaries
if [ -f "package-lock.json" ]; then
    echo "🗑️  Removing package-lock.json..."
    rm -f package-lock.json
fi

# Install dependencies - npm will automatically pick the correct rollup binary
echo "📦 Installing dependencies (npm will auto-select correct rollup binary)..."
npm install --legacy-peer-deps

echo ""
echo "✅ Rollup fix complete!"
echo ""
echo "The correct platform-specific rollup binary should now be installed."
echo "You can verify by checking:"
echo "  ls node_modules/@rollup/ | grep rollup"
echo ""
