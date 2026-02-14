from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.delivery_job import DeliveryJob
from app.models.book import Book
from app.models.user import User
from app.models.credits_transaction import CreditsTransaction
from app.schemas.delivery import DeliveryCreate


class DeliveryService:
    @staticmethod
    async def get_all(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        status: str | None = None,
        driver_id: int | None = None,
    ) -> list[DeliveryJob]:
        q = select(DeliveryJob).options(
            selectinload(DeliveryJob.book),
            selectinload(DeliveryJob.assigned_driver),
        ).offset(skip).limit(limit)
        if status:
            q = q.where(DeliveryJob.status == status)
        if driver_id is not None:
            q = q.where(DeliveryJob.assigned_driver_id == driver_id)
        result = await db.execute(q)
        return list(result.scalars().all())

    @staticmethod
    async def get_by_id(db: AsyncSession, job_id: int) -> DeliveryJob | None:
        result = await db.execute(
            select(DeliveryJob)
            .options(
                selectinload(DeliveryJob.book),
                selectinload(DeliveryJob.assigned_driver),
            )
            .where(DeliveryJob.id == job_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def create(db: AsyncSession, data: DeliveryCreate, pickup_location: str | None = None,
                     pickup_lat: float | None = None, pickup_lng: float | None = None,
                     distance_miles: float | None = None) -> DeliveryJob:
        job = DeliveryJob(
            book_id=data.book_id,
            pickup_location=pickup_location,
            dropoff_location=data.dropoff_location,
            dropoff_lat=data.dropoff_lat,
            dropoff_lng=data.dropoff_lng,
            pickup_lat=pickup_lat,
            pickup_lng=pickup_lng,
            distance_miles=distance_miles,
            credit_reward=data.credit_reward,
            requester_notes=data.requester_notes,
            status="pending",
        )
        db.add(job)
        await db.flush()
        await db.refresh(job)
        return job

    @staticmethod
    async def accept(db: AsyncSession, job: DeliveryJob, driver_id: int) -> DeliveryJob:
        job.assigned_driver_id = driver_id
        job.status = "assigned"
        await db.flush()
        await db.refresh(job)
        return job

    @staticmethod
    async def start_transit(db: AsyncSession, job: DeliveryJob) -> DeliveryJob:
        job.status = "in_transit"
        await db.flush()
        await db.refresh(job)
        return job

    @staticmethod
    async def complete(db: AsyncSession, job: DeliveryJob) -> DeliveryJob:
        job.status = "delivered"
        if job.assigned_driver_id and job.credit_reward > 0:
            driver_result = await db.execute(select(User).where(User.id == job.assigned_driver_id))
            driver = driver_result.scalar_one_or_none()
            if driver:
                driver.credits_balance = (driver.credits_balance or 0) + job.credit_reward
                txn = CreditsTransaction(
                    driver_id=driver.id,
                    amount=job.credit_reward,
                    reason="Delivery completed",
                    delivery_job_id=job.id,
                )
                db.add(txn)
            book = await db.get(Book, job.book_id)
            if book:
                book.status = "delivered"
        await db.flush()
        await db.refresh(job)
        return job
