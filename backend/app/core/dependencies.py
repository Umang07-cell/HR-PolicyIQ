from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import decode_token
from app.models.user import User

from fastapi import Request

def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> User:
    role = request.headers.get("X-User-Role", "employee")
    # Mock user for the system
    return User(
        id=1, 
        email=f"{role}@company.com", 
        role=role, 
        department="engineering", 
        location="india", 
        is_active=True
    )


def require_role(*roles: str):
    def _check(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Role '{current_user.role}' not permitted. Required: {list(roles)}")
        return current_user
    return _check
