from app.schemas.mpg import MPGEstimateRequest, MPGEstimateResponse


class MPGService:
    @staticmethod
    def estimate(data: MPGEstimateRequest) -> MPGEstimateResponse:
        """fuel_cost = (distance_miles / vehicle_mpg) * gas_price"""
        if data.vehicle_mpg <= 0:
            fuel_cost = 0.0
        else:
            fuel_cost = (data.distance_miles / data.vehicle_mpg) * data.gas_price
        net_reward = data.credit_reward - fuel_cost
        return MPGEstimateResponse(
            fuel_cost=round(fuel_cost, 2),
            net_reward=round(net_reward, 2),
            credit_reward=data.credit_reward,
        )
