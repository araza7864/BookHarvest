from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "user"  # "user" or "admin" (admin requires admin_invite_code)
    admin_invite_code: Optional[str] = None
    vehicle_mpg: Optional[float] = None  # unused now; kept for DB compatibility


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    vehicle_mpg: Optional[float] = None
    credits_balance: float = 0.0
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
