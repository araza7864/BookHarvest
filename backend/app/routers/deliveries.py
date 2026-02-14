from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.delivery import DeliveryCreate, DeliveryResponse
from app.services.delivery_service import DeliveryService
from app.services.book_service import BookService
from app.services.openroute_service import OpenRouteService
from app.dependencies import get_current_user, RequireAdmin, RequireDriver
from app.models.user import User
from app.models.delivery_job import DeliveryJob

router = APIRouter(prefix="/deliveries", tags=["deliveries"])


def _delivery_to_response(job: DeliveryJob) -> dict:
    d = {
        "id": job.id,
        "book_id": job.book_id,
        "pickup_location": job.pickup_location,
        "dropoff_location": job.dropoff_location,
        "distance_miles": job.distance_miles,
        "assigned_driver_id": job.assigned_driver_id,
        "status": job.status,
        "credit_reward": job.credit_reward,
        "requester_notes": job.requester_notes,
        "created_at": job.created_at,
        "book": None,
        "assigned_driver": None,
    }
    if job.book:
        d["book"] = {
            "id": job.book.id,
            "title": job.book.title,
            "author": job.book.author,
            "photo_url": job.book.photo_url,
            "status": job.book.status,
        }
    if job.assigned_driver:
        d["assigned_driver"] = {
            "id": job.assigned_driver.id,
            "name": job.assigned_driver.name,
            "email": job.assigned_driver.email,
        }
    return d


@router.get("", response_model=list[dict])
async def list_deliveries(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    status: str | None = None,
    db: AsyncSession = Depends(get_db),
    current: User = Depends(get_current_user),
):
    driver_id = current.id if current.role == "driver" else None
    if current.role == "user":
        driver_id = None
    jobs = await DeliveryService.get_all(db, skip=skip, limit=limit, status=status, driver_id=driver_id)
    return [_delivery_to_response(j) for j in jobs]


@router.get("/{job_id}", response_model=dict)
async def get_delivery(
    job_id: int,
    db: AsyncSession = Depends(get_db),
    current: User = Depends(get_current_user),
):
    job = await DeliveryService.get_by_id(db, job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Delivery not found")
    return _delivery_to_response(job)


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_delivery(
    data: DeliveryCreate,
    db: AsyncSession = Depends(get_db),
    current: User = Depends(RequireAdmin),
):
    book = await BookService.get_by_id(db, data.book_id)
    if not book:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")
    if book.status != "available":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Book is not available for delivery")
    pickup_lat, pickup_lng = book.location_lat, book.location_lng
    dropoff_lat, dropoff_lng = data.dropoff_lat, data.dropoff_lng
    distance_miles = None
    if pickup_lat and pickup_lng and dropoff_lat and dropoff_lng:
        distance_miles = await OpenRouteService.get_distance_miles(
            pickup_lat, pickup_lng, dropoff_lat, dropoff_lng
        )
    pickup_location = None
    if pickup_lat and pickup_lng:
        pickup_location = f"{pickup_lat},{pickup_lng}"
    job = await DeliveryService.create(
        db, data,
        pickup_location=pickup_location,
        pickup_lat=pickup_lat,
        pickup_lng=pickup_lng,
        distance_miles=distance_miles,
    )
    book.status = "reserved"
    await db.flush()
    job = await DeliveryService.get_by_id(db, job.id)
    return _delivery_to_response(job)


@router.post("/{job_id}/accept", response_model=dict)
async def accept_delivery(
    job_id: int,
    db: AsyncSession = Depends(get_db),
    current: User = Depends(RequireDriver),
):
    job = await DeliveryService.get_by_id(db, job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Delivery not found")
    if job.status != "pending":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Delivery is not pending")
    job = await DeliveryService.accept(db, job, current.id)
    job = await DeliveryService.get_by_id(db, job.id)
    return _delivery_to_response(job)


@router.post("/{job_id}/complete", response_model=dict)
async def complete_delivery(
    job_id: int,
    db: AsyncSession = Depends(get_db),
    current: User = Depends(RequireDriver),
):
    job = await DeliveryService.get_by_id(db, job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Delivery not found")
    if job.assigned_driver_id != current.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your delivery")
    if job.status not in ("assigned", "in_transit"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid status for completion")
    job = await DeliveryService.complete(db, job)
    job = await DeliveryService.get_by_id(db, job.id)
    return _delivery_to_response(job)


@router.post("/{job_id}/start", response_model=dict)
async def start_delivery(
    job_id: int,
    db: AsyncSession = Depends(get_db),
    current: User = Depends(RequireDriver),
):
    job = await DeliveryService.get_by_id(db, job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Delivery not found")
    if job.assigned_driver_id != current.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your delivery")
    if job.status != "assigned":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Delivery must be assigned first")
    job = await DeliveryService.start_transit(db, job)
    job = await DeliveryService.get_by_id(db, job.id)
    return _delivery_to_response(job)
