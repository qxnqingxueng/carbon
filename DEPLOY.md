# Deploying CarbonDesk

The app is two pieces: a **React frontend** (static site → Vercel) and a **FastAPI backend + PostgreSQL** (→ Railway or Render). Do the backend first so you have its URL for the frontend.

> Prerequisite: the project is pushed to GitHub (see the repo setup we did). Both Vercel and Railway deploy straight from your GitHub repo.

## 1. Backend + database — Railway (easiest)

1. Go to **railway.app**, sign in with GitHub, **New Project → Deploy from GitHub repo**, pick this repo.
2. In the service **Settings → Root Directory**, set it to **`backend`**.
3. Add a database: **New → Database → PostgreSQL**. Railway automatically exposes a `DATABASE_URL` variable to your service.
4. In the backend service **Variables**, add:
   - `SECRET_KEY` = a long random string
   - `FRONTEND_ORIGIN` = your Vercel URL (fill this in after step 2 below; you can set it to a placeholder for now and update it)
5. Railway uses the **Procfile** automatically (`uvicorn app.main:app --host 0.0.0.0 --port $PORT`). The tables are created on first start.
6. Copy the public backend URL (e.g. `https://carbondesk-api.up.railway.app`).

*(Render works the same way: New Web Service → root `backend` → Build `pip install -r requirements.txt` → Start `uvicorn app.main:app --host 0.0.0.0 --port $PORT`, then add a Render PostgreSQL instance and its `DATABASE_URL`.)*

## 2. Frontend — Vercel

1. Go to **vercel.com**, sign in with GitHub, **Add New → Project**, import this repo.
2. Framework preset: **Vite** (auto-detected). Root directory: the repo root (where `package.json` is).
3. Add an Environment Variable:
   - `VITE_API_BASE` = your backend URL from step 1 (e.g. `https://carbondesk-api.up.railway.app`)
4. **Deploy**. Vercel gives you a URL like `https://carbondesk.vercel.app`.

## 3. Connect them

1. Back in Railway, set the backend's **`FRONTEND_ORIGIN`** to your Vercel URL and redeploy (so CORS allows it).
2. Open your Vercel URL, register an account — it now talks to the live backend + database.

## Notes
- Database tables auto-create on backend startup; no manual migration needed for this version.
- For a custom domain, add it in Vercel (frontend) and update `FRONTEND_ORIGIN` accordingly.
- Keep `SECRET_KEY` private and different from the dev value.
