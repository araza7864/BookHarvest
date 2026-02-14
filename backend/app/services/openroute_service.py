import httpx
from app.config import settings


class OpenRouteService:
    BASE_URL = "https://api.openrouteservice.org"

    @classmethod
    async def get_route(
        cls,
        start_lng: float,
        start_lat: float,
        end_lng: float,
        end_lat: float,
    ) -> dict | None:
        if not settings.openrouteservice_api_key:
            return None
        url = f"{cls.BASE_URL}/v2/directions/driving-car"
        headers = {"Authorization": settings.openrouteservice_api_key}
        body = {
            "coordinates": [[start_lng, start_lat], [end_lng, end_lat]],
        }
        async with httpx.AsyncClient() as client:
            try:
                r = await client.post(url, json=body, headers=headers, timeout=10.0)
                if r.status_code != 200:
                    return None
                data = r.json()
                if not data.get("routes"):
                    return None
                route = data["routes"][0]
                distance_m = route["summary"]["distance"]
                distance_miles = distance_m / 1609.34
                duration_s = route["summary"]["duration"]
                duration_minutes = duration_s / 60
                return {
                    "distance_miles": round(distance_miles, 2),
                    "duration_minutes": round(duration_minutes, 1),
                    "geometry": route.get("geometry"),
                    "raw": data,
                }
            except Exception:
                return None

    @classmethod
    async def get_distance_miles(
        cls,
        start_lat: float,
        start_lng: float,
        end_lat: float,
        end_lng: float,
    ) -> float | None:
        result = await cls.get_route(start_lng, start_lat, end_lng, end_lat)
        if result:
            return result["distance_miles"]
        return None
