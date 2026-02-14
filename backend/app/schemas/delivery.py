from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class DeliveryCreate(BaseModel):
    book_id: int
    dropoff_location: str
    dropoff_lat: Optional[float] = None
    dropoff_lng: Optional[float] = None
    requester_notes: Optional[str] = None
    credit_reward: float = 0.0


class DeliveryResponse(BaseModel):
    id: int
    book_id: int
    pickup_location: Optional[str] = None
    dropoff_location: Optional[str] = None
    distance_miles: Optional[float] = None
    assigned_driver_id: Optional[int] = None
    status: str
    credit_reward: float
    requester_notes: Optional[str] = None
    created_at: datetime
    book: Optional[dict] = None
    assigned_driver: Optional[dict] = None

    class Config:
        from_attributes = True


class DeliveryStatusUpdate(BaseModel):
    status: str
