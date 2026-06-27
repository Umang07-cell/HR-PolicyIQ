from pydantic import BaseModel, EmailStr
from app.models.user import UserRole

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    full_name: str
    user_id: int

class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    role: UserRole = UserRole.employee
    department: str | None = None
    location: str | None = None
    employee_id: str | None = None

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
