from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.user import User, UserRole
from app.core.security import hash_password

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()

def list_users(db: Session, role: Optional[UserRole] = None) -> List[User]:
    q = db.query(User)
    if role:
        q = q.filter(User.role == role)
    return q.all()

def deactivate_user(db: Session, user_id: int) -> bool:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return False
    user.is_active = False
    db.commit()
    return True
