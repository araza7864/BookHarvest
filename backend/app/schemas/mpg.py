from pydantic import BaseModel


class MPGEstimateRequest(BaseModel):
    distance_miles: float
    vehicle_mpg: float
    gas_price: float
    credit_reward: float = 0.0


class MPGEstimateResponse(BaseModel):
    fuel_cost: float
    net_reward: float
    credit_reward: float
