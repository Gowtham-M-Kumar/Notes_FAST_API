# Notes API with Version History

A robust FastAPI backend for taking notes with automatic version snapshots on every update. Includes a full-featured authentication system and a Next.js frontend.

## 🚀 Features

- **User Authentication**: Secure JWT-based registration and login.
- **Notes CRUD**: Full Create, Read, Update, and Delete operations for user-owned notes.
- **Automatic Versioning**: Every time a note is updated, the previous state is automatically saved as a version.
- **Version Management**: List version history, view specific snapshots, and restore notes to any previous version.
- **Frontend Integration**: Includes a modern Next.js frontend built with Tailwind CSS and ShadCN UI.
- **Postgres DB**: Production-ready database schema with migrations via Alembic.

## 🛠 Tech Stack

- **Backend**: FastAPI (Python 3.14)
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Migrations**: Alembic
- **Frontend**: Next.js 14 (App Router)
- **Authentication**: JWT (JSON Web Tokens)
- **Hashing**: Bcrypt

## 📋 Prerequisites

- Python 3.12+
- Node.js 18+ (for frontend)
- PostgreSQL (or use a cloud provider like Railway/Neon)

## 🏗 Setup & Run (Local)

### 1. Backend Setup
1. Clone the repository and navigate to the root:
   ```bash
   cd fastapi_backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables in `.env`:
   ```env
   DATABASE_URL=postgresql://user:password@host:port/dbname
   ```
5. Run migrations:
   ```bash
   export PYTHONPATH=$PYTHONPATH:.
   alembic upgrade head
   ```
6. Start the server:
   ```bash
   uvicorn app.main:app --reload
   ```

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd notes_frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy and configure environment:
   ```bash
   cp .env.local.example .env.local
   ```
4. Start development server:
   ```bash
   npm run dev
   ```

## 🧪 Running Tests

Ensure your virtual environment is active and run:
```bash
export PYTHONPATH=$PYTHONPATH:.
pytest tests/test_api.py
```

## 📮 API Documentation

- **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Redoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- **Postman Collection**: `Notes_API.postman_collection.json` (See root directory)

## 🌐 Deployment

- **Backend Hosted on**: Railway (PostgreSQL)
- **Deployment URL**: [Your Live API URL Here]

## 🤝 Project Deliverables Checklist

- [x] Modern modular code structure
- [x] Alembic migration scripts
- [x] JWT Authentication & Secure Hashing
- [x] CRUD Note Endpoints
- [x] Automatic Version History
- [x] Version Fetch & Restore
- [x] Descriptive Error Handling & Validation
- [x] Comprehensive Pytest suite
- [x] Postman Collection with examples & scripts
- [x] Professional README documentation
- [x] NextJS Frontend (Bonus)

## 📞 Support & Repository Access

Grant repository access to:
- `jmrpatel257@gmail.com`
- `shubhammishralpu@gmail.com`
- GitHub Id: `rabbit-ninja`
