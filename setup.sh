#!/bin/bash

# HikeMatch - Quick Setup Script
# This script helps set up your HikeMatch development environment

echo "🥾 HikeMatch - Quick Setup"
echo "=========================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed."
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env with your Firebase configuration!"
    echo "   1. Go to https://console.firebase.google.com/"
    echo "   2. Create a new project"
    echo "   3. Enable Firestore Database and Email/Password Auth"
    echo "   4. Copy your Firebase config to .env"
    echo ""
else
    echo "✅ .env file already exists"
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
    echo ""
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Success message
echo "🎉 Setup complete!"
echo ""
echo "📚 Next steps:"
echo "   1. Edit .env with your Firebase credentials (if not done)"
echo "   2. Run: npm run dev"
echo "   3. Open: http://localhost:5173"
echo "   4. Click 'Quick Demo Login' to test"
echo ""
echo "📖 Documentation:"
echo "   • SETUP.md - Detailed setup guide"
echo "   • README.md - Project overview"
echo "   • QUICKREF.md - Command reference"
echo ""
echo "Happy hiking! 🏔️"
