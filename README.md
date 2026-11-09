# Harvest Reach

A full-stack book donation and distribution prototype built with **Python, FastAPI, React, TypeScript, and SQLAlchemy**. This is the React/FastAPI implementation featured on my resume.

## Features

- Public book catalog with search, filters, and book details.
- JWT sign-in, password hashing, and separate user/admin access.
- Admin inventory creation and editing, request creation, and summary dashboards.
- Async database access: SQLite for a local demo; PostgreSQL through configuration.
- Optional Open Library ISBN lookup and OpenRouteService distance calculation.

The project is inspired by Book Harvest. It is separate from the Books on Break partner-onboarding collaboration. The newer Next.js implementation is not included in this showcase.

## Run locally

Requires Python 3.12 and Node.js 22+.

```bash
git clone https://github.com/araza7864/BookHarvest.git
cd BookHarvest/backend
python -m venv .venv
```

Activate with `.venv\Scripts\activate` on Windows or `source .venv/bin/activate` on macOS/Linux.

```bash
python -m pip install -r requirements.txt
```

Copy `.env.example` to `.env`. Set a long random `SECRET_KEY` and your own `ADMIN_INVITE_CODE`. The default `DATABASE_URL` creates an empty local SQLite database; no existing database or personal records are included.

```bash
python -m uvicorn main:app --reload --port 8000
```

In a second terminal, from the repository root:

```bash
cd frontend
npm ci
npm run dev
```

Open `http://localhost:3000`. Register a user, or choose Admin and enter the invitation code from your backend environment file. Admins can add books in Inventory and create requests in Requests. API docs: `http://localhost:8000/docs`.

To use PostgreSQL, create an empty development database and set `DATABASE_URL=postgresql+asyncpg://USER:PASSWORD@localhost:5432/harvest_reach` in `.env`.

## Verification

```bash
# From backend/: isolated SQLite database, synthetic records, no API keys
python -m unittest discover -s tests

# From frontend/
npm run build
```

GitHub Actions checks backend workflows and the frontend build. Backend checks cover registration, sign-in, admin authorization, inventory, search, and request creation.

## Scope and limitations

This version does not contain an OpenAI recommendation integration. Request creation is currently an admin workflow; there is no customer checkout flow. Driver registration is disabled, so the original driver delivery lifecycle is not a complete user-facing workflow. These are prototype limitations, not completed features.

Use synthetic records for demonstrations. Local databases, credentials, caches, and installed dependencies are excluded from Git. Before deployment, review authentication, dependency security, migrations, and operational requirements.
