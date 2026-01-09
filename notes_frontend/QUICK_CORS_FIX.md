# 🚀 Quick CORS Fix (Copy-Paste Solution)

## In Your Django Backend:

### 1. Install Package
```bash
pip install django-cors-headers
```

### 2. Copy-Paste to settings.py

#### Add to INSTALLED_APPS:
```python
'corsheaders',
```

#### Add to MIDDLEWARE (as first item):
```python
'corsheaders.middleware.CorsMiddleware',
```

#### Add at the bottom of settings.py:
```python
# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]
```

### 3. Restart Django
```bash
python manage.py runserver 127.0.0.1:8000
```

### 4. Test
Try registration again - it should work! ✅

---

## Alternative (Dev Only - Quick Test):

If you just want to test quickly, use this:

```python
# settings.py (bottom)
CORS_ALLOW_ALL_ORIGINS = True  # DEVELOPMENT ONLY!
```

This allows all origins. **NOT for production!**

---

**That's it! Your CORS issue will be fixed.** 🎉
