from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import OperationalError, IntegrityError

from app.config import settings
from app.database import get_db
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token
from app.services.auth_service import AuthService
from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])


def _normalize_role(data: UserCreate) -> str:
    """Only allow 'user' or 'admin'. Reject 'driver'."""
    if data.role == "driver":
        return "_reject_driver"
    if data.role not in ("user", "admin"):
        return "user"
    return data.role


@router.post("/register", response_model=Token)
async def register(data: UserCreate, db: AsyncSession = Depends(get_db)):
    try:
        if _normalize_role(data) == "_reject_driver":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Driver registration is not available.",
            )
        if data.role == "admin":
            code = (data.admin_invite_code or "").strip()
            required = (settings.admin_invite_code or "").strip()
            if not required or code != required:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Admin signup requires a valid invite code.",
                )
        existing = await AuthService.get_user_by_email(db, data.email)
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
        create_data = UserCreate(
            name=data.name,
            email=data.email,
            password=data.password,
            role=data.role,
            admin_invite_code=data.admin_invite_code,
            vehicle_mpg=None,
        )
        user = await AuthService.create_user(db, create_data)
        token = AuthService.create_access_token({"sub": str(user.id), "role": user.role})
        return Token(
            access_token=token,
            token_type="bearer",
            user=UserResponse.model_validate(user),
        )
    except HTTPException:
        raise
    except (OperationalError, IntegrityError) as e:
        err = str(e).lower()
        if "no such column" in err or "has no column" in err or "credits_balance" in err:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database schema is outdated. Stop the backend, delete the file bookharvest.db in the backend folder, then start the backend again.",
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}",
        )


@router.post("/login", response_model=Token)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    try:
        user = await AuthService.get_user_by_email(db, data.email)
        if not user or not AuthService.verify_password(data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        token = AuthService.create_access_token({"sub": str(user.id), "role": user.role})
        return Token(
            access_token=token,
            token_type="bearer",
            user=UserResponse.model_validate(user),
        )
    except HTTPException:
        raise
    except (OperationalError, IntegrityError) as e:
        err = str(e).lower()
        if "no such column" in err or "has no column" in err:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database schema is outdated. Stop the backend, delete bookharvest.db in the backend folder, then start the backend again.",
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}",
        )


@router.get("/me", response_model=UserResponse)
async def me(current: User = Depends(get_current_user)):
    return UserResponse.model_validate(current)
