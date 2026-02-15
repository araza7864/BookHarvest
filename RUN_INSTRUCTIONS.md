# How to Run Book Harvest (Step-by-Step)

Follow these steps in order. You need **PostgreSQL**, **Python 3.10+**, and **Node.js 18+** installed.

---

## Step 1: Get a PostgreSQL database

You need a running PostgreSQL database and its connection URL.

### Option A — PostgreSQL on your PC

**Windows:**
1. Download and install from: https://www.postgresql.org/download/windows/
2. During setup, set a password for the `postgres` user and remember it.
3. Open **pgAdmin** or **Command Prompt** and create a database named `bookharvest`:
   - In pgAdmin: right-click **Databases** → **Create** → **Database** → name: `bookharvest`.
   - Or in Command Prompt (if `psql` is in PATH):
     ```bash
     psql -U postgres -c "CREATE DATABASE bookharvest;"
     ```

**macOS:**
1. Install via Homebrew: `brew install postgresql@16` (or latest), then `brew services start postgresql@16`
2. Create the database:
   ```bash
   createdb bookharvest
   ```
   Or with `psql`:
   ```bash
   psql postgres -c "CREATE DATABASE bookharvest;"
   ```
3. Your URL (replace `YourPassword` with your macOS user password if using peer auth, or use a configured user):
   ```
   postgresql+asyncpg://localhost:5432/bookharvest
   ```
   Or with password: `postgresql+asyncpg://postgres:YourPassword@localhost:5432/bookharvest`

**Both:** Your URL will look like:
   ```
   postgresql+asyncpg://postgres:YourPassword@localhost:5432/bookharvest
   ```

### Option B — Free cloud PostgreSQL (no local install)

1. Sign up for a free database:
   - **Neon**: https://neon.tech → Create project → copy the connection string
   - **Supabase**: https://supabase.com → New project → Settings → Database → Connection string (URI)
   - **ElephantSQL**: https://www.elephantsql.com → Create instance → copy URL
2. The URL is usually like:
   ```
   postgresql://user:password@host:5432/dbname
   ```
3. **Important:** Change the start to use the async driver. If the URL is:
   ```
   postgresql://user:pass@host/dbname
   ```
   use instead:
   ```
   postgresql+asyncpg://user:pass@host/dbname
   ```
   (Replace `postgresql://` with `postgresql+asyncpg://`.)

---

## Step 2: Backend — Python / FastAPI

All commands below are run in a terminal (PowerShell or Command Prompt).

### 2.1 Open the backend folder

**Windows:**
```bash
cd C:\Users\asadr\SeamlessBook\backend
```

**macOS:**
```bash
cd /Users/yourusername/SeamlessBook/backend
```

(Use your actual path to the project if different.)

### 2.2 Create a virtual environment

```bash
python -m venv venv
```

### 2.3 Activate the virtual environment

**Windows (PowerShell):**
```powershell
.\venv\Scripts\Activate.ps1
```

**Windows (Command Prompt):**
```cmd
venv\Scripts\activate.bat
```

**macOS / Linux:**
```bash
source venv/bin/activate
```

You should see `(venv)` at the start of the line.

### 2.4 Install dependencies

```bash
pip install -r requirements.txt
```

### 2.5 Create the `.env` file

1. In the `backend` folder, create a file named `.env` (no filename before the dot).
2. Put this inside (use **your** database URL from Step 1):

```env
DATABASE_URL=postgresql+asyncpg://postgres:YourPassword@localhost:5432/bookharvest
SECRET_KEY=any-random-string-for-dev
ADMIN_INVITE_CODE=my-secret-admin-code
```

- Replace the `DATABASE_URL` with your real URL (from Option A or B).
- For cloud DBs, use the `postgresql+asyncpg://...` form.
- **ADMIN_INVITE_CODE:** Only users who enter this code when registering can sign up as **Admin**. Keep it secret. Leave empty to disable admin self-registration entirely.
- Save the file.

### 2.6 Start the backend server

Still in `backend` with `venv` active:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

You should see something like:

```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

- **API docs:** open http://localhost:8000/docs in your browser.
- Leave this terminal open; the server must keep running.

---

## Step 3: Frontend — React / Vite

Open a **second** terminal (backend keeps running in the first).

### 3.1 Go to the frontend folder

**Windows:**
```bash
cd C:\Users\asadr\SeamlessBook\frontend
```

**macOS:**
```bash
cd /Users/yourusername/SeamlessBook/frontend
```

(Use your actual path to the project if different.)

### 3.2 Install dependencies

```bash
npm install
```

### 3.3 Start the frontend dev server

```bash
npm run dev
```

You should see something like:

```
  Vite dev server running at:
  > Local:   http://localhost:3000/
```

### 3.4 Open the website

In your browser go to:

**http://localhost:3000**

The React app runs on port 3000 and forwards API calls to the backend on port 8000.

---

## Step 3.5: Next.js (Shop & Admin) — optional but recommended

The **Find Books** button opens the Next.js shop. To run it:

### 3.5.1 Open the project root

**Windows:**
```bash
cd C:\Users\asadr\SeamlessBook
```

**macOS:**
```bash
cd /Users/yourusername/SeamlessBook
```

### 3.5.2 Create `.env` for Next.js

Create a `.env` file in the project root with:
```
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_HOMEPAGE_URL="http://localhost:3000"
```

### 3.5.3 Install dependencies and set up the database

```bash
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
```

(Optionally run `npx tsx prisma/seed-books.ts` to add sample books.)

### 3.5.4 Start Next.js

```bash
npm run dev
```

Next.js runs on **http://localhost:3005**. The homepage **Find Books** button links here.

---

## Step 4: Test the app

### 4.1 Create a user (regular)

1. In the browser, go to **http://localhost:3000/login**.
2. Click **Register**.
3. Fill in Name, Email, Password.
4. **Role:** choose **User**.
5. Click **Register**. You can browse and request books.

### 4.2 Create an admin user

1. Go to **http://localhost:3000/login** and click **Register**.
2. Fill in Name, Email, Password.
3. **Role:** choose **Admin**.
4. Enter the **Admin invite code** (same value as `ADMIN_INVITE_CODE` in backend `.env`).
5. Click **Register**. You should be redirected to the Admin dashboard.

### 4.3 Add a book (Admin)

1. In the left menu click **Inventory**.
2. Click **Add book**.
3. Fill in at least **Title** and **Author** (e.g. “The Little Prince”, “Antoine de Saint-Exupéry”).
4. Optionally: Age range, Category, Description, Photo URL.
5. Click **Save**. The book appears in the table.

### 4.4 Create a request (Admin)

1. Click **Requests** in the menu.
2. Click **New request**.
3. Enter:
   - **Book ID:** the ID of the book you added (e.g. 1).
   - **Pick-up location (hub):** e.g. “123 Main St”.
   - **Credit reward:** e.g. 5.
4. Click **Create**. The job appears in the **Pending** column.

### 4.5 Test the public catalog

1. Go to **http://localhost:3000** (or click the Book Harvest logo).
2. Use **Find Books** to open the shop (Next.js on port 3005).
3. You should see books; click one to see the detail page and **Request** or add to cart.

---

## Quick reference

| What              | URL / Command |
|-------------------|----------------|
| Homepage          | http://localhost:3000 |
| Login / Register  | http://localhost:3000/login |
| Shop (Find Books) | http://localhost:3005 |
| API docs          | http://localhost:8000/docs |
| Backend (start)   | `cd backend` → activate venv → `uvicorn main:app --reload --port 8000` |
| Frontend (start)  | `cd frontend` → `npm run dev` |
| Next.js (start)   | In project root: `npm run dev` (port 3005) |

**macOS venv activate:** `source venv/bin/activate`

---

## If something fails

- **Backend: “could not connect to server”**  
  PostgreSQL is not running or the URL in `.env` is wrong. Check the URL (user, password, host, port, database name) and that the DB exists.

- **Frontend: “Network Error” or 404 on API**  
  Start the backend first (port 8000). The frontend proxies `/api` to `http://localhost:8000`.

- **“Admin signup requires a valid invite code”**  
  Set `ADMIN_INVITE_CODE` in backend `.env` and enter the same value in the Admin invite code field when registering as Admin.

- **“ModuleNotFoundError: No module named 'app'”**  
  Run `uvicorn` from inside the `backend` folder (where `main.py` is).

- **Port already in use**  
  Either stop the other program using port 8000 or 3000, or run backend on another port, e.g. `uvicorn main:app --reload --port 8001`, and then set in `frontend/.env`: `VITE_API_URL=http://localhost:8001` (and in `frontend/vite.config.ts` change the proxy target to `http://localhost:8001`).
