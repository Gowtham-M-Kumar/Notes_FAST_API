from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.api.v1.api import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# -------------------------
# Global Exception Handler
# -------------------------
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    print(f"❌ Validation Error: {errors}")
    return JSONResponse(
        status_code=422,
        content={"detail": errors},
    )

# -------------------------
# CORS (ALLOW ALL ORIGINS)
# -------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # ✅ allow all origins (Vercel preview safe)
    allow_credentials=False,  # ❗ must be False with "*"
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# API Routes
# -------------------------
app.include_router(api_router, prefix=settings.API_V1_STR)
