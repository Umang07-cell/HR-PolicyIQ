from pydantic import BaseModel, EmailStr
from app.models.user import UserRole
from typing import Optional

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    department: Optional[str] = None
    location: Optional[str] = None

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: UserRole
    department: str | None
    location: str | None
    employee_id: str | None
    is_active: bool
    model_config = {"from_attributes": True}
