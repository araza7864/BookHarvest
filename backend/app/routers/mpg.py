from fastapi import APIRouter, Depends

from app.schemas.mpg import MPGEstimateRequest, MPGEstimateResponse
from app.services.mpg_service import MPGService

router = APIRouter(prefix="/mpg", tags=["mpg"])


@router.post("/estimate", response_model=MPGEstimateResponse)
async def estimate_mpg(data: MPGEstimateRequest):
    return MPGService.estimate(data)
