from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.database import engine, Base, get_db
from app.routers import auth, books, deliveries, mpg, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title="Book Harvest API",
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

app.include_router(auth.router)
app.include_router(books.router)
app.include_router(deliveries.router)
app.include_router(mpg.router)
app.include_router(admin.router)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Return 500 with the actual error message so the frontend can display it."""
    if isinstance(exc, HTTPException):
        raise exc
    # Log so it appears in the backend terminal
    import traceback
    print("Server error:", exc, flush=True)
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
    )


@app.get("/health")
async def health():
    return {"status": "ok"}
