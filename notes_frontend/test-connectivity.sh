#!/bin/bash

# Frontend Connectivity Test Script
# Run this to verify your setup

echo "🔍 Frontend Connectivity Test"
echo "=============================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check .env.local exists
echo "📋 Test 1: Check .env.local file"
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✅ .env.local exists${NC}"
    echo "   Content:"
    cat .env.local | grep NEXT_PUBLIC_API_BASE_URL
else
    echo -e "${RED}❌ .env.local NOT FOUND${NC}"
    echo "   Fix: cp .env.local.example .env.local"
    exit 1
fi
echo ""

# Test 2: Check environment variable value
echo "📋 Test 2: Check API URL configuration"
API_URL=$(grep NEXT_PUBLIC_API_BASE_URL .env.local | cut -d '=' -f2)
if [ "$API_URL" = "http://127.0.0.1:8000/api" ]; then
    echo -e "${GREEN}✅ Correct: $API_URL${NC}"
elif [ "$API_URL" = "http://localhost:8000/api" ]; then
    echo -e "${YELLOW}⚠️  Using localhost instead of 127.0.0.1${NC}"
    echo "   This may cause issues. Recommend: http://127.0.0.1:8000/api"
else
    echo -e "${RED}❌ Unexpected URL: $API_URL${NC}"
fi
echo ""

# Test 3: Check if backend is running
echo "📋 Test 3: Check if backend is reachable"
if curl -s http://127.0.0.1:8000/api/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is reachable at http://127.0.0.1:8000/api/${NC}"
else
    echo -e "${RED}❌ Cannot reach backend at http://127.0.0.1:8000/api/${NC}"
    echo "   Possible fixes:"
    echo "   1. Start Django: python manage.py runserver 127.0.0.1:8000"
    echo "   2. Check if port 8000 is in use: lsof -i :8000"
    echo "   3. Verify Django is running on correct host/port"
fi
echo ""

# Test 4: Check if Node.js is installed
echo "📋 Test 4: Check Node.js installation"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✅ Node.js installed: $NODE_VERSION${NC}"
    
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_MAJOR" -ge 18 ]; then
        echo "   Version OK (18+)"
    else
        echo -e "${YELLOW}⚠️  Node.js 18+ recommended, you have: $NODE_VERSION${NC}"
    fi
else
    echo -e "${RED}❌ Node.js not installed${NC}"
    exit 1
fi
echo ""

# Test 5: Check if node_modules exists
echo "📋 Test 5: Check dependencies"
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ Dependencies installed (node_modules exists)${NC}"
else
    echo -e "${YELLOW}⚠️  Dependencies not installed${NC}"
    echo "   Run: npm install"
fi
echo ""

# Test 6: Check if Next.js is running
echo "📋 Test 6: Check if Next.js is running"
if lsof -i :3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Next.js is running on port 3000${NC}"
    echo -e "${YELLOW}⚠️  Did you restart after changing .env.local?${NC}"
    echo "   If not: Stop server (Ctrl+C) and run: npm run dev"
else
    echo -e "${YELLOW}⚠️  Next.js not running${NC}"
    echo "   Start it: npm run dev"
fi
echo ""

# Test 7: Test registration endpoint
echo "📋 Test 7: Test registration endpoint"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://127.0.0.1:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test","password":"test","password2":"test"}' \
  2>/dev/null)

if [ -n "$RESPONSE" ]; then
    if [ "$RESPONSE" = "400" ] || [ "$RESPONSE" = "201" ]; then
        echo -e "${GREEN}✅ Backend registration endpoint is working (HTTP $RESPONSE)${NC}"
        echo "   400 = Validation error (expected for test data)"
        echo "   201 = Success (user created)"
    else
        echo -e "${YELLOW}⚠️  Backend responded with HTTP $RESPONSE${NC}"
    fi
else
    echo -e "${RED}❌ Cannot reach registration endpoint${NC}"
    echo "   Make sure Django backend is running"
fi
echo ""

# Summary
echo "=================================="
echo "📊 SUMMARY"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. Make sure backend is running: python manage.py runserver 127.0.0.1:8000"
echo "2. If you changed .env.local, restart Next.js: npm run dev"
echo "3. Open browser: http://localhost:3000"
echo "4. Open DevTools Console (F12) and check for logs"
echo "5. Try registration and watch console for: '✅ API Base URL configured'"
echo ""
echo "For detailed debugging, see: DEBUG_CONNECTIVITY.md"
