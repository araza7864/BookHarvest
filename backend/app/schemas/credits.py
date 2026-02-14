from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class CreditsTransactionResponse(BaseModel):
    id: int
    driver_id: int
    amount: float
    reason: Optional[str] = None
    delivery_job_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class CreditsBalanceResponse(BaseModel):
    balance: float
    transactions: list[CreditsTransactionResponse]
