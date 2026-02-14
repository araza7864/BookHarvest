from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base, get_db
from app.routers import auth, books, deliveries, drivers, mpg, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title="SeamlessBook API",
    description="Smart Book Distribution & Volunteer Delivery Platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth")
app.include_router(books.router)
app.include_router(deliveries.router)
app.include_router(drivers.router, prefix="/drivers")
app.include_router(mpg.router)
app.include_router(admin.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
