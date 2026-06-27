from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.core.dependencies import get_current_user, require_role
from app.core.audit import log_action
from app.models.user import User
from app.models.document import Document
from app.models.audit_log import AuditLog
from app.models.leave import LeaveRequest, LeaveStatus
from app.models.grievance import Grievance, GrievanceStatus
from pydantic import BaseModel, EmailStr
from app.core.security import get_password_hash

router = APIRouter(prefix="/admin", tags=["Admin"])


class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "employee"
    department: Optional[str] = None
    location: Optional[str] = None
    employee_id: Optional[str] = None


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    department: Optional[str]
    location: Optional[str]
    is_active: bool
    model_config = {"from_attributes": True}


@router.get("/dashboard", summary="Platform dashboard statistics")
def get_dashboard(db: Session = Depends(get_db), _: User = Depends(require_role("hr_admin", "executive"))):
    return {
        "total_users": db.query(User).count(),
        "total_documents": db.query(Document).count(),
        "indexed_documents": db.query(Document).filter(Document.is_indexed == True).count(),
        "total_queries": db.query(AuditLog).filter(AuditLog.action == "CHAT_QUERY").count(),
        "pending_leaves": db.query(LeaveRequest).filter(LeaveRequest.status == LeaveStatus.pending).count(),
        "open_grievances": db.query(Grievance).filter(Grievance.status.in_([GrievanceStatus.submitted, GrievanceStatus.in_progress])).count(),
    }


@router.get("/users", response_model=List[UserOut], summary="List all users")
def list_users(db: Session = Depends(get_db), _: User = Depends(require_role("hr_admin", "executive"))):
    return db.query(User).order_by(User.id.desc()).all()


@router.post("/users", response_model=UserOut, summary="Create a user")
def create_user(req: UserCreate, db: Session = Depends(get_db), current_user: User = Depends(require_role("hr_admin"))):
    if db.query(User).filter(User.email == req.email.lower()).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=req.email.lower().strip(),
        hashed_password=get_password_hash(req.password),
        full_name=req.full_name,
        role=req.role,
        department=req.department,
        location=req.location,
        employee_id=req.employee_id,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    log_action(db, current_user.id, "USER_CREATE", "user", str(user.id), {"email": req.email})
    return user


@router.patch("/users/{user_id}/deactivate", summary="Deactivate a user")
def deactivate_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_role("hr_admin"))):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    db.commit()
    log_action(db, current_user.id, "USER_DEACTIVATE", "user", str(user_id))
    return {"message": "User deactivated"}


@router.get("/audit-logs", summary="Retrieve audit logs")
def get_audit_logs(
    limit: int = 100,
    action: Optional[str] = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("hr_admin", "executive")),
):
    q = db.query(AuditLog)
    if action:
        q = q.filter(AuditLog.action == action)
    return q.order_by(AuditLog.timestamp.desc()).limit(limit).all()
