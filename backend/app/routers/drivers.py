from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.schemas.credits import CreditsTransactionResponse, CreditsBalanceResponse
from app.dependencies import RequireDriver
from app.models.user import User
from app.models.credits_transaction import CreditsTransaction

router = APIRouter(prefix="/drivers", tags=["drivers"])


@router.get("/me/credits", response_model=CreditsBalanceResponse)
async def get_my_credits(
    db: AsyncSession = Depends(get_db),
    current: User = Depends(RequireDriver),
):
    result = await db.execute(
        select(CreditsTransaction)
        .where(CreditsTransaction.driver_id == current.id)
        .order_by(CreditsTransaction.created_at.desc())
        .limit(100)
    )
    transactions = list(result.scalars().all())
    return CreditsBalanceResponse(
        balance=current.credits_balance or 0.0,
        transactions=[CreditsTransactionResponse.model_validate(t) for t in transactions],
    )


@router.get("/me/history", response_model=list[CreditsTransactionResponse])
async def get_my_history(
    db: AsyncSession = Depends(get_db),
    current: User = Depends(RequireDriver),
):
    result = await db.execute(
        select(CreditsTransaction)
        .where(CreditsTransaction.driver_id == current.id)
        .order_by(CreditsTransaction.created_at.desc())
        .limit(100)
    )
    transactions = list(result.scalars().all())
    return [CreditsTransactionResponse.model_validate(t) for t in transactions]
