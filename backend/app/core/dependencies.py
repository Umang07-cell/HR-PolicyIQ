from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User


def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> User:
    role = request.headers.get("X-User-Role", "employee").strip().lower()
    allowed_roles = {"employee", "manager", "hr_admin", "executive"}
    if role not in allowed_roles:
        role = "employee"

    user = db.query(User).filter(User.role == role, User.is_active == True).first()
    if user:
        return user

    return User(
        id=1,
        email=f"{role}@company.com",
        full_name=role.replace("_", " ").title(),
        role=role,
        department="engineering",
        location="india",
        is_active=True,
    )


def require_role(*roles: str):
    def _check(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{current_user.role}' not permitted. Required: {list(roles)}",
            )
        return current_user
    return _check
