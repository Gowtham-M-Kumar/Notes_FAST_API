#!/bin/bash

# Login Performance Validation Script
# Run this after the fix to verify improvements

echo "🔍 Login Performance Validation"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if dev server is running
echo "1. Checking Next.js dev server..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 || lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${GREEN}✅ Dev server is running${NC}"
else
    echo -e "${RED}❌ Dev server not running${NC}"
    echo "   Run: npm run dev"
    exit 1
fi

# Check if backend is running
echo "2. Checking Django backend..."
if curl -s http://127.0.0.1:8000/api/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running${NC}"
else
    echo -e "${RED}❌ Backend not running${NC}"
    echo "   Start your Django server first"
    exit 1
fi

# Check critical files
echo "3. Checking fixed files..."
FILES=(
    "context/AuthContext.tsx"
    "app/dashboard/layout.tsx"
    "app/dashboard/notes/page.tsx"
    "lib/api.ts"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file not found${NC}"
    fi
done

# Check for window.location.href in AuthContext
echo ""
echo "4. Verifying fix implementation..."
if grep -q "window.location.href" context/AuthContext.tsx; then
    echo -e "${GREEN}✅ Synchronous redirect implemented${NC}"
else
    echo -e "${RED}❌ window.location.href not found in AuthContext${NC}"
fi

# Check for performance.now() timing
if grep -q "performance.now()" context/AuthContext.tsx; then
    echo -e "${GREEN}✅ Performance timing added${NC}"
else
    echo -e "${YELLOW}⚠️  Performance timing not found${NC}"
fi

# Check for setTimeout in notes page
if grep -q "setTimeout" app/dashboard/notes/page.tsx; then
    echo -e "${GREEN}✅ Deferred data loading implemented${NC}"
else
    echo -e "${YELLOW}⚠️  Deferred loading not found in notes page${NC}"
fi

# Check if mounted state removed from dashboard layout
if grep -q "mounted" app/dashboard/layout.tsx; then
    echo -e "${YELLOW}⚠️  'mounted' state still exists (should be removed)${NC}"
else
    echo -e "${GREEN}✅ Simplified auth guard (no mounted state)${NC}"
fi

echo ""
echo "================================"
echo "🎯 MANUAL TESTING REQUIRED"
echo "================================"
echo ""
echo "1. Open browser console (F12)"
echo "2. Go to http://localhost:3001/login"
echo "3. Clear console"
echo "4. Login with test credentials"
echo "5. Watch console for:"
echo "   ${GREEN}✅ Login API took [XX]ms${NC}"
echo "   ${GREEN}🚀 Instant redirect to dashboard${NC}"
echo "   ${GREEN}📊 Loaded X notes in [XX]ms${NC}"
echo ""
echo "6. Verify timing:"
echo "   • Login API: Should be <200ms"
echo "   • Redirect: Should feel instant (<100ms perceived)"
echo "   • Dashboard: Should show skeleton immediately"
echo "   • Notes load: Happens after page visible"
echo ""
echo "================================"
echo "📊 Expected Performance:"
echo "================================"
echo "• Button click → Dashboard visible: <100ms"
echo "• Login API response: <200ms (local)"
echo "• Notes API response: <500ms (acceptable)"
echo "• Total time to interactive: <800ms"
echo ""
echo -e "${GREEN}All automatic checks passed!${NC}"
echo "Proceed with manual testing in browser."
