from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class BookCreate(BaseModel):
    title: str
    author: str
    isbn: Optional[str] = None
    age_range: Optional[str] = None
    condition: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    photo_url: Optional[str] = None
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None


class BookUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    isbn: Optional[str] = None
    age_range: Optional[str] = None
    condition: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    photo_url: Optional[str] = None
    status: Optional[str] = None
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None


class BookResponse(BaseModel):
    id: int
    title: str
    author: str
    isbn: Optional[str] = None
    age_range: Optional[str] = None
    condition: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    photo_url: Optional[str] = None
    status: str
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True
