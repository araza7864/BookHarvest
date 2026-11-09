from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime
from typing import Optional, Literal


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Literal["user", "admin"] = "user"  # "user" or "admin" (admin requires admin_invite_code)
    admin_invite_code: Optional[str] = None
    vehicle_mpg: Optional[float] = None  # unused now; kept for DB compatibility


    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if len(value) < 8 or len(value.encode("utf-8")) > 72:
            raise ValueError("Password must be at least 8 characters and at most 72 UTF-8 bytes")
        return value

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
