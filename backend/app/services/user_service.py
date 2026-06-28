from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.user import User, UserRole
from app.core.security import get_password_hash


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email.lower().strip()).first()


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


def list_users(db: Session, role: Optional[UserRole] = None) -> List[User]:
    q = db.query(User)
    if role:
        q = q.filter(User.role == role)
    return q.all()


def create_user(
    db: Session,
    email: str,
    password: str,
    full_name: str,
    role: UserRole = UserRole.employee,
    department: Optional[str] = None,
    location: Optional[str] = None,
    employee_id: Optional[str] = None,
) -> User:
    user = User(
        email=email.lower().strip(),
        hashed_password=get_password_hash(password),
        full_name=full_name,
        role=role,
        department=department,
        location=location,
        employee_id=employee_id,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def deactivate_user(db: Session, user_id: int) -> bool:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return False
    user.is_active = False
    db.commit()
    return True
