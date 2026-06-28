from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.core.dependencies import get_current_user, require_role
from app.core.audit import log_action
from app.models.user import User
from app.models.audit_log import AuditLog
from app.schemas.auth import UserCreate, UserOut
from app.services.user_service import create_user, deactivate_user
from app.api.analytics import get_platform_stats

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/dashboard", summary="Platform dashboard statistics")
def get_dashboard(
    db: Session = Depends(get_db),
    _: User = Depends(require_role("hr_admin", "executive")),
):
    return get_platform_stats(db)


@router.get("/users", response_model=List[UserOut], summary="List all users")
def list_users(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("hr_admin", "executive")),
):
    limit = min(limit, 200)
    return db.query(User).order_by(User.id.desc()).offset(skip).limit(limit).all()


@router.post("/users", response_model=UserOut, summary="Create a user")
def create_user_endpoint(
    req: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("hr_admin")),
):
    if len(req.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    if db.query(User).filter(User.email == req.email.lower()).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = create_user(
        db=db,
        email=req.email,
        password=req.password,
        full_name=req.full_name,
        role=req.role,
        department=req.department,
        location=req.location,
        employee_id=req.employee_id,
    )
    log_action(db, current_user.id, "USER_CREATE", "user", str(user.id), {"email": req.email})
    return user


@router.patch("/users/{user_id}/deactivate", summary="Deactivate a user")
def deactivate_user_endpoint(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("hr_admin")),
):
    if not deactivate_user(db, user_id):
        raise HTTPException(status_code=404, detail="User not found")
    log_action(db, current_user.id, "USER_DEACTIVATE", "user", str(user_id))
    return {"message": "User deactivated"}


@router.get("/audit-logs", summary="Retrieve audit logs")
def get_audit_logs(
    skip: int = 0,
    limit: int = 100,
    action: Optional[str] = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("hr_admin", "executive")),
):
    limit = min(limit, 500)
    q = db.query(AuditLog)
    if action:
        q = q.filter(AuditLog.action == action)
    return q.order_by(AuditLog.timestamp.desc()).offset(skip).limit(limit).all()
