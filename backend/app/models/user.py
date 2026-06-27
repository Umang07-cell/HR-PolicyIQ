from sqlalchemy import Column, Integer, String, Boolean, Enum as SAEnum
from app.db.base import Base
from app.models.base import TimestampMixin
import enum


class UserRole(str, enum.Enum):
    employee = "employee"
    manager = "manager"
    hr_admin = "hr_admin"
    executive = "executive"


class User(Base, TimestampMixin):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="employee")
    department = Column(String(100), nullable=True)
    location = Column(String(100), nullable=True)
    employee_id = Column(String(50), nullable=True, unique=True)
    is_active = Column(Boolean, default=True, nullable=False)
