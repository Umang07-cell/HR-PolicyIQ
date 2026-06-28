from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import verify_password, create_access_token
from app.core.dependencies import get_current_user
from app.schemas.auth import LoginRequest, TokenResponse
from app.models.user import User
from pydantic import BaseModel, field_validator

router = APIRouter(prefix="/auth", tags=["Authentication"])


class PasswordLoginRequest(LoginRequest):
    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


@router.post("/login", response_model=TokenResponse, summary="Obtain access token")
def login(req: PasswordLoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        User.email == req.email.lower().strip(),
        User.is_active == True,
    ).first()

    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token_data = {
        "sub": str(user.id),
        "role": user.role,
        "department": user.department,
        "location": user.location,
    }
    access_token = create_access_token(data=token_data)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        role=user.role,
        full_name=user.full_name,
        user_id=user.id,
    )


@router.get("/me", summary="Get current user info")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "department": current_user.department,
        "is_active": current_user.is_active,
    }