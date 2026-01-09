from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.api import deps
from app.core import security
from app.core.config import settings
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, UserLogin
from app.schemas.token import Token
from pydantic import BaseModel

router = APIRouter()

class LoginResponse(BaseModel):
    message: str
    user: UserResponse
    access: str
    refresh: str
    token_type: str = "bearer"

@router.post("/register/", response_model=LoginResponse, status_code=201)
def register(
    user_in: UserCreate,
    db: Session = Depends(deps.get_db),
) -> Any:
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system",
        )
    user_by_name = db.query(User).filter(User.username == user_in.username).first()
    if user_by_name:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system",
        )
    
    if user_in.password != user_in.password2:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    hashed_password = security.get_password_hash(user_in.password)
    db_user = User(
        email=user_in.email,
        username=user_in.username,
        hashed_password=hashed_password,
        is_active=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    access_token = security.create_access_token(
        subject=db_user.id
    )
    refresh_token = security.create_refresh_token(subject=db_user.id)
    
    return {
        "message": "User registered successfully",
        "user": db_user,
        "access": access_token,
        "refresh": refresh_token,
        "token_type": "bearer"
    }

@router.post("/login/", response_model=LoginResponse)
def login(
    login_data: UserLogin,
    db: Session = Depends(deps.get_db),
) -> Any:
    user = db.query(User).filter(User.username == login_data.username).first()
    if not user:
        # Check email if username not found? Specs said username.
        pass
    
    if not user or not security.verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    
    access_token = security.create_access_token(subject=user.id)
    refresh_token = security.create_refresh_token(subject=user.id)
    
    return {
        "message": "Login successful",
        "user": user,
        "access": access_token,
        "refresh": refresh_token,
        "token_type": "bearer"
    }
