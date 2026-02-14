from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    author = Column(String(255), nullable=False)
    isbn = Column(String(20), index=True, nullable=True)
    age_range = Column(String(50), nullable=True)
    condition = Column(String(50), nullable=True)
    category = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    photo_url = Column(String(1000), nullable=True)
    status = Column(String(30), default="available", nullable=False)  # available, reserved, delivered
    location_lat = Column(Float, nullable=True)
    location_lng = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    delivery_jobs = relationship("DeliveryJob", back_populates="book")
