# How to Run Book Harvest (Step-by-Step)

Follow these steps in order. You need **PostgreSQL**, **Python 3.10+**, and **Node.js 18+** installed.

---

## Step 1: Get a PostgreSQL database

You need a running PostgreSQL database and its connection URL.

### Option A — PostgreSQL on your PC (Windows)

1. Download and install from: https://www.postgresql.org/download/windows/
2. During setup, set a password for the `postgres` user and remember it.
3. Open **pgAdmin** or **Command Prompt** and create a database named `bookharvest`:
   - In pgAdmin: right-click **Databases** → **Create** → **Database** → name: `bookharvest`.
   - Or in Command Prompt (if `psql` is in PATH):
     ```bash
     psql -U postgres -c "CREATE DATABASE bookharvest;"
     ```
4. Your URL will look like (replace `YourPassword` with the password you set):
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

```bash
cd C:\Users\asadr\seamlessbook\backend
```

(Use your actual path to the project if different; e.g. `SeamlessBook` or `bookharvest`.)

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

```bash
cd C:\Users\asadr\seamlessbook\frontend
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

### 4.4 Create a delivery (Admin)

1. Click **Deliveries** in the menu.
2. Click **New delivery**.
3. Enter:
   - **Book ID:** the ID of the book you added (e.g. 1).
   - **Dropoff location:** e.g. “123 Main St”.
   - **Credit reward:** e.g. 5.
4. Click **Create**. The job appears in the **Pending** column.

### 4.5 Test the public catalog

1. Go to **http://localhost:3000** (or click the Book Harvest logo).
2. Use **Find Books** to open the search page.
3. You should see the book you added; click it to see the detail page and **Request delivery**.

---

## Quick reference

| What              | URL / Command |
|-------------------|----------------|
| Website           | http://localhost:3000 |
| Login / Register   | http://localhost:3000/login |
| API docs          | http://localhost:8000/docs |
| Backend (start)    | `cd backend` → activate venv → `uvicorn main:app --reload --port 8000` |
| Frontend (start)   | `cd frontend` → `npm run dev` |

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
