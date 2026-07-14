# NovHawk Dashboard

Full-stack task & assessment tracking dashboard with separate **User** and **Admin** views, matching the NovHawk mockup.

**Stack:** Python (FastAPI) · React (Vite + Tailwind + Recharts) · PostgreSQL

---

## 1. Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL 13+ running locally (or a hosted instance)

---

## 2. Database setup

Create the database and a user (adjust names/passwords as you like):

```sql
CREATE DATABASE novhawk;
CREATE USER novhawk_user WITH PASSWORD 'novhawk_pass';
GRANT ALL PRIVILEGES ON DATABASE novhawk TO novhawk_user;
```

---

## 3. Backend setup (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt

cp .env.example .env
# Edit .env: set DATABASE_URL to match your Postgres credentials, and set a real SECRET_KEY

# Create tables + seed demo data (users, tasks, assessments, activity feed)
python -m app.seed

# Run the API server
uvicorn app.main:app --reload --port 8000
```

The API is now live at `http://localhost:8000`. Interactive docs: `http://localhost:8000/docs`.

### Demo accounts (created by the seed script)
| Role  | Email                 | Password     |
|-------|------------------------|--------------|
| Admin | admin@novhawk.com       | admin123     |
| User  | vishnu@novhawk.com      | password123  |

Other seeded users (karthik, dharshini, praveen, harini @novhawk.com) all use `password123`.

---

## 4. Frontend setup (React)

```bash
cd frontend
npm install

cp .env.example .env
# VITE_API_URL should point at your backend, e.g. http://localhost:8000

npm run dev
```

Visit `http://localhost:5173`, log in with a demo account above — admins land on `/admin`, regular users on `/dashboard`.

### Static demo data (backend not running)

You don't need the backend running to preview the UI. If the frontend can't reach the API, logging in with either demo account (`admin@novhawk.com` / `admin123` or `vishnu@novhawk.com` / `password123`) automatically switches to **offline demo mode**: every page renders realistic static data from `frontend/src/mockData.js` instead of calling the API, and an orange banner ("Showing static demo data — backend isn't connected") appears at the top of each page. Edits made in this mode (completing a task, adding an assessment, etc.) only update the in-memory demo state and aren't persisted. Once the real backend is reachable and you log in again, it switches back to live data automatically.

---

## 5. What's included

**Backend (`/backend`)**
- FastAPI app with JWT auth (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`)
- SQLAlchemy models: `User`, `Task`, `Assessment`, `Activity`
- REST endpoints for tasks, assessments, users (role-aware: admins see everything, users see their own)
- Aggregation endpoints powering both dashboards: `/api/dashboard/user`, `/api/dashboard/admin`
- Seed script with realistic demo data matching the mockup numbers

**Frontend (`/frontend`)**
- React Router with protected routes split by role (`user` vs `admin`)
- User Dashboard: task/assessment stat cards, "My Tasks", assessment donut chart, upcoming deadlines
- Admin Dashboard: platform-wide stats, task overview line chart, assessment analytics donut, top performing users, recent activity feed, "Add New Task" shortcut
- Shared Tasks & Assessments pages (read-only for users, full CRUD for admins)
- Tailwind design tokens matching the NovHawk palette (purple primary, orange/green/blue accents)

---

## 6. Notes for production

- Set a strong, random `SECRET_KEY` in `backend/.env`.
- Restrict `CORS_ORIGINS` to your real frontend domain.
- Put the FastAPI app behind a proper ASGI server (e.g. `uvicorn` with `gunicorn` workers, or behind Nginx).
- Consider Alembic for schema migrations instead of `create_all` once the schema stabilizes.
