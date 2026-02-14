from sqlalchemy import Column, Integer, String, Float, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.database import Base


class UserRole(str, enum.Enum):
    user = "user"
    admin = "admin"
    driver = "driver"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default=UserRole.user.value, nullable=False)
    vehicle_mpg = Column(Float, nullable=True)
    credits_balance = Column(Float, default=0.0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    deliveries_assigned = relationship("DeliveryJob", back_populates="assigned_driver", foreign_keys="DeliveryJob.assigned_driver_id")
    credits_transactions = relationship("CreditsTransaction", back_populates="driver")
