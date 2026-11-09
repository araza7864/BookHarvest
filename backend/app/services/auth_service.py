from datetime import datetime, timedelta
import bcrypt
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import settings
from app.models.user import User
from app.schemas.user import UserCreate

# Bcrypt only supports passwords up to 72 bytes
BCRYPT_MAX_BYTES = 72


def _password_bytes(password: str) -> bytes:
    pwd_bytes = password.encode("utf-8")
    if len(pwd_bytes) > BCRYPT_MAX_BYTES:
        raise ValueError("Password exceeds bcrypt maximum length")
    return pwd_bytes


class AuthService:
    @staticmethod
    def hash_password(password: str) -> str:
        return bcrypt.hashpw(_password_bytes(password), bcrypt.gensalt()).decode("utf-8")

    @staticmethod
    def verify_password(plain: str, hashed: str) -> bool:
        try:
            return bcrypt.checkpw(_password_bytes(plain), hashed.encode("utf-8"))
        except Exception:
            return False

    @staticmethod
    def create_access_token(data: dict) -> str:
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)

    @staticmethod
    def decode_token(token: str) -> dict | None:
        try:
            return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        except JWTError:
            return None

    @staticmethod
    async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
        result = await db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_user_by_id(db: AsyncSession, user_id: int) -> User | None:
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def create_user(db: AsyncSession, data: UserCreate) -> User:
        user = User(
            name=data.name,
            email=data.email,
            hashed_password=AuthService.hash_password(data.password),
            role=data.role,
            vehicle_mpg=data.vehicle_mpg,
        )
        db.add(user)
        await db.flush()
        await db.refresh(user)
        return user
