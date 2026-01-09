# 🔧 Frontend API URL Debugging & Fixes

## ✅ CURRENT CONFIGURATION ANALYSIS

### Environment Variable
**File:** `.env.local`
```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api
```
✅ **Status:** CORRECT

### Axios Configuration
**File:** `lib/api.ts`
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL; // ✅ From env
export const api = axios.create({
  baseURL: API_BASE_URL, // ✅ Set correctly
  ...
});
```
✅ **Status:** CORRECT

### API Endpoints
```typescript
// ✅ All use relative paths (no hardcoded full URLs)
authAPI.register: POST /auth/register/
authAPI.login:    POST /auth/login/
notesAPI.list:    GET  /notes/
notesAPI.create:  POST /notes/
```
✅ **Status:** CORRECT

---

## 🎯 HOW URL RESOLUTION WORKS

### Current Setup:
- **Base URL:** `http://127.0.0.1:8000/api`
- **Endpoint:** `/auth/register/`
- **Final URL:** `http://127.0.0.1:8000/api/auth/register/` ✅

### URL Construction:
```
baseURL          +  endpoint              = Final URL
─────────────────────────────────────────────────────────────
http://127.0.0.1:8000/api  +  /auth/register/  = http://127.0.0.1:8000/api/auth/register/
http://127.0.0.1:8000/api  +  /auth/login/     = http://127.0.0.1:8000/api/auth/login/
http://127.0.0.1:8000/api  +  /notes/          = http://127.0.0.1:8000/api/notes/
```

---

## ⚠️ COMMON URL MISTAKES (WHAT TO AVOID)

### ❌ Mistake 1: Double `/api/` in Path
```typescript
// WRONG - creates: http://127.0.0.1:8000/api/api/auth/register/
api.post('/api/auth/register/', data)

// CORRECT - creates: http://127.0.0.1:8000/api/auth/register/
api.post('/auth/register/', data)
```

### ❌ Mistake 2: Missing Leading Slash
```typescript
// WRONG - creates: http://127.0.0.1:8000/apiauth/register/
api.post('auth/register/', data)

// CORRECT
api.post('/auth/register/', data)
```

### ❌ Mistake 3: Full URL in Endpoint
```typescript
// WRONG - bypasses baseURL
api.post('http://127.0.0.1:8000/api/auth/register/', data)

// CORRECT - use relative path
api.post('/auth/register/', data)
```

### ❌ Mistake 4: Wrong Base URL Format
```env
# WRONG - Missing /api
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000

# WRONG - Trailing slash
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/

# CORRECT
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api
```

### ❌ Mistake 5: Calling /api/ Directly
```typescript
// WRONG - Backend doesn't expose /api/ as valid route
api.get('/')

// CORRECT - Call specific endpoints
api.get('/notes/')
```

---

## 🔍 VERIFICATION STEPS

### Step 1: Check Browser Console
Open DevTools (F12) → Console

**You should see:**
```
✅ API Base URL configured: http://127.0.0.1:8000/api
📤 POST http://127.0.0.1:8000/api/auth/register/
✅ 201 /auth/register/
```

**NOT:**
```
❌ POST http://127.0.0.1:8000/api/api/auth/register/  (double /api/)
❌ POST http://127.0.0.1:8000/apiauth/register/       (missing slash)
❌ POST http://127.0.0.1:8000/api/                    (wrong endpoint)
```

### Step 2: Check Network Tab
Open DevTools (F12) → Network Tab

1. Try to register/login
2. Find the request to `register` or `login`
3. Click on it
4. Check **Request URL** in Headers tab

**Should be exactly:**
```
Request URL: http://127.0.0.1:8000/api/auth/register/
Request Method: POST
Content-Type: application/json
```

### Step 3: Verify Environment Variable
Run in browser console:
```javascript
// Should output: http://127.0.0.1:8000/api
console.log(process.env.NEXT_PUBLIC_API_BASE_URL);
```

If `undefined`, restart Next.js:
```bash
# Stop server (Ctrl+C)
npm run dev
```

---

## 📋 DEBUGGING CHECKLIST

Use this checklist to diagnose issues:

### Environment
- [ ] `.env.local` exists in project root
- [ ] Contains `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api`
- [ ] No trailing slash in URL
- [ ] Next.js was restarted after env changes

### Axios Configuration
- [ ] `baseURL` uses `process.env.NEXT_PUBLIC_API_BASE_URL`
- [ ] No hardcoded URLs anywhere
- [ ] Endpoints use relative paths (start with `/`)
- [ ] No double `/api/` in paths

### Backend
- [ ] Django running at `http://127.0.0.1:8000`
- [ ] Endpoints exist at `/api/auth/register/`, `/api/auth/login/`, etc.
- [ ] CORS configured for `http://localhost:3000` or `http://localhost:3001`

### Browser
- [ ] Console shows correct API Base URL
- [ ] Network tab shows correct Request URLs
- [ ] No CORS errors in console
- [ ] Requests use correct HTTP methods (POST for register/login)

---

## 🧪 TEST EACH ENDPOINT

### Test 1: Registration
**Expected URL:** `POST http://127.0.0.1:8000/api/auth/register/`

```javascript
// Run in browser console
fetch('http://127.0.0.1:8000/api/auth/register/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'test',
    email: 'test@test.com',
    password: 'test123',
    password2: 'test123'
  })
})
.then(r => r.json())
.then(d => console.log('✅ Registration endpoint works:', d))
.catch(e => console.error('❌ Registration failed:', e));
```

### Test 2: Login
**Expected URL:** `POST http://127.0.0.1:8000/api/auth/login/`

```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}'
```

### Test 3: Notes List
**Expected URL:** `GET http://127.0.0.1:8000/api/notes/`

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://127.0.0.1:8000/api/notes/
```

---

## 🔧 FIXES FOR SPECIFIC ISSUES

### Issue 1: 404 Not Found on Registration
**Symptoms:** `POST /auth/register/` returns 404

**Possible causes:**
1. Backend endpoint path is different
2. Django URL configuration incorrect
3. Wrong HTTP method

**Debug:**
```bash
# Check if endpoint exists
curl -X POST http://127.0.0.1:8000/api/auth/register/ -v
```

**Frontend is calling:** `http://127.0.0.1:8000/api/auth/register/`
**Backend must expose:** `POST /api/auth/register/`

### Issue 2: CORS Error
**Symptoms:** Browser console shows CORS policy error

**Frontend calls are correct, but backend needs:**
```python
# Django settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
]
```

### Issue 3: 405 Method Not Allowed
**Symptoms:** Endpoint found but method wrong

**Check:**
- Registration/Login must use `POST`
- Notes list must use `GET`
- Notes create must use `POST`

**Current frontend (CORRECT):**
```typescript
authAPI.register: api.post('/auth/register/', data)  // ✅ POST
authAPI.login:    api.post('/auth/login/', data)     // ✅ POST
notesAPI.list:    api.get('/notes/')                 // ✅ GET
notesAPI.create:  api.post('/notes/', data)          // ✅ POST
```

### Issue 4: Environment Variable Not Loading
**Symptoms:** Console shows `undefined` for API URL

**Fix:**
1. Ensure `.env.local` is in project root (not in subdirectory)
2. Variable must start with `NEXT_PUBLIC_`
3. Restart Next.js completely (not just refresh)
4. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)

---

## 📝 CORRECT IMPLEMENTATION

### `.env.local` (Root Directory)
```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api
```

### `lib/api.ts`
```typescript
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is not defined');
}

export const api = axios.create({
  baseURL: API_BASE_URL,  // http://127.0.0.1:8000/api
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API
export const authAPI = {
  register: async (data: RegisterData) => {
    // Calls: http://127.0.0.1:8000/api/auth/register/
    const response = await api.post('/auth/register/', data);
    return response.data;
  },

  login: async (data: LoginData) => {
    // Calls: http://127.0.0.1:8000/api/auth/login/
    const response = await api.post('/auth/login/', data);
    return response.data;
  },
};

// Notes API
export const notesAPI = {
  list: async () => {
    // Calls: http://127.0.0.1:8000/api/notes/
    const response = await api.get('/notes/');
    return response.data;
  },

  create: async (data: CreateNoteData) => {
    // Calls: http://127.0.0.1:8000/api/notes/
    const response = await api.post('/notes/', data);
    return response.data;
  },
};
```

---

## ✅ VERIFICATION SCRIPT

Run this to verify everything:

```bash
#!/bin/bash

echo "🔍 Verifying API URL Configuration"
echo "===================================="

# Check env file
echo "1. Checking .env.local..."
if grep -q "NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api" .env.local; then
  echo "✅ Environment variable correct"
else
  echo "❌ Check .env.local file"
fi

# Test backend endpoints
echo ""
echo "2. Testing backend endpoints..."

# Test registration endpoint
if curl -s -o /dev/null -w "%{http_code}" -X POST \
  http://127.0.0.1:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{}' | grep -q "400\|201"; then
  echo "✅ Registration endpoint reachable"
else
  echo "❌ Registration endpoint not found"
fi

# Test login endpoint
if curl -s -o /dev/null -w "%{http_code}" -X POST \
  http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{}' | grep -q "400\|401\|200"; then
  echo "✅ Login endpoint reachable"
else
  echo "❌ Login endpoint not found"
fi

echo ""
echo "3. Next steps:"
echo "   - Open http://localhost:3001"
echo "   - Open DevTools Console (F12)"
echo "   - Check for: '✅ API Base URL configured: http://127.0.0.1:8000/api'"
echo "   - Try registration and watch Network tab"
```

---

## 🎯 QUICK REFERENCE

### Correct URLs
| Action | Method | Frontend Path | Final URL |
|--------|--------|---------------|-----------|
| Register | POST | `/auth/register/` | `http://127.0.0.1:8000/api/auth/register/` |
| Login | POST | `/auth/login/` | `http://127.0.0.1:8000/api/auth/login/` |
| List Notes | GET | `/notes/` | `http://127.0.0.1:8000/api/notes/` |
| Create Note | POST | `/notes/` | `http://127.0.0.1:8000/api/notes/` |
| Get Note | GET | `/notes/{id}/` | `http://127.0.0.1:8000/api/notes/{id}/` |

### Environment Variable
```env
# ✅ CORRECT
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api

# ❌ WRONG (missing /api)
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000

# ❌ WRONG (trailing slash)
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/

# ❌ WRONG (localhost instead of 127.0.0.1)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

---

## 🚀 FINAL CHECKLIST

Before declaring "it works":

1. ✅ Backend running: `python manage.py runserver 127.0.0.1:8000`
2. ✅ Frontend running: `npm run dev`
3. ✅ `.env.local` correct: `http://127.0.0.1:8000/api`
4. ✅ Console shows: `✅ API Base URL configured`
5. ✅ Network tab shows correct URLs
6. ✅ No CORS errors
7. ✅ Registration/Login work
8. ✅ Can create notes
9. ✅ Can view notes
10. ✅ Version history works

---

**Status:** ✅ All frontend URL configurations are CORRECT

**The issue is likely:**
1. Backend not running
2. CORS not configured
3. Frontend not restarted after env change

**NOT frontend URL calling issues - the configuration is correct!**
