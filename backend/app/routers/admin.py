from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.dependencies import RequireAdmin
from app.models.user import User
from app.models.book import Book
from app.models.delivery_job import DeliveryJob
from app.models.credits_transaction import CreditsTransaction

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/analytics")
async def get_analytics(
    db: AsyncSession = Depends(get_db),
    current: User = Depends(RequireAdmin),
):
    books_total = await db.scalar(select(func.count(Book.id)))
    books_available = await db.scalar(select(func.count(Book.id)).where(Book.status == "available"))
    books_delivered = await db.scalar(select(func.count(Book.id)).where(Book.status == "delivered"))
    deliveries_total = await db.scalar(select(func.count(DeliveryJob.id)))
    deliveries_pending = await db.scalar(select(func.count(DeliveryJob.id)).where(DeliveryJob.status == "pending"))
    deliveries_delivered = await db.scalar(select(func.count(DeliveryJob.id)).where(DeliveryJob.status == "delivered"))
    credits_issued = await db.scalar(
        select(func.coalesce(func.sum(CreditsTransaction.amount), 0)).where(CreditsTransaction.amount > 0)
    )
    return {
        "books": {"total": books_total or 0, "available": books_available or 0, "delivered": books_delivered or 0},
        "deliveries": {"total": deliveries_total or 0, "pending": deliveries_pending or 0, "delivered": deliveries_delivered or 0},
        "credits_issued": float(credits_issued or 0),
    }
