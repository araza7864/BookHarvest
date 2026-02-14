from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class DeliveryJob(Base):
    __tablename__ = "delivery_jobs"

    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False)
    pickup_location = Column(String(500), nullable=True)
    dropoff_location = Column(String(500), nullable=True)
    pickup_lat = Column(Float, nullable=True)
    pickup_lng = Column(Float, nullable=True)
    dropoff_lat = Column(Float, nullable=True)
    dropoff_lng = Column(Float, nullable=True)
    distance_miles = Column(Float, nullable=True)
    assigned_driver_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(String(30), default="pending", nullable=False)  # pending, assigned, in_transit, delivered
    credit_reward = Column(Float, default=0.0, nullable=False)
    requester_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    book = relationship("Book", back_populates="delivery_jobs")
    assigned_driver = relationship("User", back_populates="deliveries_assigned", foreign_keys=[assigned_driver_id])
