#!/bin/bash

# Notes Frontend - Setup Script
# This script automates the initial setup process

set -e

echo "🚀 Notes Frontend Setup Script"
echo "================================"
echo ""

# Check Node.js version
echo "📦 Checking Node.js version..."
node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$node_version" -lt 18 ]; then
    echo "❌ Error: Node.js 18 or higher is required"
    echo "   Current version: $(node -v)"
    exit 1
fi
echo "✅ Node.js version OK: $(node -v)"
echo ""

# Check npm
echo "📦 Checking npm..."
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed"
    exit 1
fi
echo "✅ npm version: $(npm -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Setup environment file
echo "⚙️  Setting up environment variables..."
if [ ! -f .env.local ]; then
    cp .env.local.example .env.local
    echo "✅ Created .env.local from example"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env.local and set your backend API URL"
    echo "   Current value: NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api"
else
    echo "⚠️  .env.local already exists, skipping"
fi
echo ""

# Success message
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Edit .env.local with your backend API URL"
echo "   2. Run 'npm run dev' to start the development server"
echo "   3. Open http://localhost:3000 in your browser"
echo ""
echo "📚 Documentation:"
echo "   - README.md - Full documentation"
echo "   - QUICKSTART.md - Quick start guide"
echo "   - COMPONENTS.md - Component reference"
echo "   - DEPLOYMENT.md - Deployment instructions"
echo ""
echo "Happy coding! 🎉"
