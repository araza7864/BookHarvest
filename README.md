# Book Harvest — Smart Book Distribution & Volunteer Delivery Platform

Full-stack system for distributing donated books to families: searchable catalog, admin dashboard, and volunteer delivery.

## Stack

- **Backend:** Python, FastAPI, SQLAlchemy (async), PostgreSQL, JWT auth
- **Frontend:** React, TypeScript, Tailwind CSS, Framer Motion, React Router
- **Maps:** OpenRouteService API (optional, for distance/route)

## Quick start

### 1. PostgreSQL

Create a database and set:

```bash
# Backend .env (copy from backend/.env.example)
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/bookharvest
SECRET_KEY=your-secret-key
ADMIN_INVITE_CODE=your-secret-admin-code   # optional; required for admin signup
OPENROUTESERVICE_API_KEY=  # optional, for route distance
```

### 2. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
# source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Tables are created on startup. API docs: http://localhost:8000/docs

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000. The app proxies `/api` to the backend (port 8000).

### 4. First admin user

Set `ADMIN_INVITE_CODE` in backend `.env`, then register at http://localhost:3000/login with role **Admin** and enter that code. Regular users can register with role **User** (no code needed).

## Project structure

```
backend/
  app/
    models/       # SQLAlchemy models (User, Book, DeliveryJob, CreditsTransaction)
    schemas/      # Pydantic request/response
    routers/      # auth, books, deliveries, drivers, mpg, admin
    services/     # auth, book, delivery, search, MPG, OpenRoute, ISBN lookup
  main.py
frontend/
  src/
    api/          # axios client, types
    context/      # AuthContext
    layouts/      # Public, Admin
    pages/        # public (Home, Search, BookDetail), admin
```

## API overview

- **Auth:** `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- **Books:** `GET/POST /books`, `GET/PUT/DELETE /books/{id}`, `GET /books/search?q=&age=&category=`, `GET /books/lookup-isbn/{isbn}` (admin)
- **Deliveries:** `GET/POST /deliveries`, `POST /deliveries/{id}/accept`, `POST /deliveries/{id}/start`, `POST /deliveries/{id}/complete`
- **Drivers:** `GET /drivers/me/credits`, `GET /drivers/me/history`
- **MPG:** `POST /mpg/estimate` — body: `distance_miles`, `vehicle_mpg`, `gas_price`, `credit_reward` → `fuel_cost`, `net_reward`
- **Admin:** `GET /admin/analytics`

## Features

- **Public catalog:** Kid-friendly UI, search/filter, book detail, request delivery
- **Admin:** Dashboard KPIs, inventory table, deliveries Kanban, finance (credits issued)
- **AI/automation:** ISBN lookup (Open Library) for auto-categorization; OpenRouteService for distance (when API key set)
