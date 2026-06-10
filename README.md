# CarbonDesk

**A carbon compliance & decision tool for Malaysian SME manufacturers.** Upload the data you already have, and CarbonDesk returns your carbon footprint, what it means for keeping your customers, the single change that saves the most money, and the exact compliance report your buyer or regulator wants — in under a minute instead of three weeks.

It's not just another calculator. Calculators give you a *number*; CarbonDesk adds the **decision layer** on top — "so what, now what" — and prints **buyer- and regulator-ready reports** (IFRS S2 and EU CBAM) from one set of inputs.

---

## Features

- **GHG Protocol engine** — Emissions = activity data × published factor, split into Scope 1 / 2 / 3.
- **The "coach" (the differentiator)** — benchmark comparison + an explainable, rule-based recommendation of the one fix to make first, with estimated ringgit savings. No invented numbers.
- **What-if simulator** — drag levers (shift peak load, add solar, cut scrap) and see the new footprint and RM saved before you spend.
- **Multi-standard reports** — one input set → IFRS S2 (company-level) and CBAM (product-level), exportable to PDF and Word.
- **Guided 5-step assessment** — Input → Calculate → Explain → Detect → Report.
- **Supply chain (Scope 3)** — request real data from suppliers and roll it up.
- **Integrations** — connect accounting/ERP (SQL Account, AutoCount, QuickBooks, Xero) and utilities (TNB) to auto-fill activity data.
- **Multi-site roll-up, editable emission factors, audit trail, regulatory deadline tracker.**
- **Real accounts** — registration/login with hashed passwords + JWT, multi-tenant data isolation, per-company persistence in PostgreSQL.

## Tech stack

| Layer | Tech |
|-------|------|
| Frontend | React + Vite, Recharts, custom design system |
| Backend | FastAPI (Python) |
| Database | PostgreSQL (SQLAlchemy) |
| Auth | bcrypt password hashing + JWT (PyJWT) |
| Reports | HTML → print-to-PDF and Word (.doc) export |

## Project structure

```
Carbon/
├── src/                 # React frontend
│   ├── App.jsx, Shell.jsx, Login.jsx, Dashboard.jsx, Assessment.jsx
│   ├── api.js           # backend client
│   ├── calc.js          # GHG calc engine (client, mirrors the server)
│   ├── reports.js       # IFRS S2 / CBAM report builder + export
│   └── screens/         # Suppliers, Integrations, Factors, Facilities, Audit, Settings, Reports, Regulations
├── backend/
│   ├── app/             # main.py, models.py, schemas.py, auth.py, calc.py, db.py, config.py
│   ├── init_db.py       # create database + tables
│   ├── reset_db.py      # wipe to a clean slate
│   └── requirements.txt
├── DEPLOY.md            # deployment guide (Vercel + Railway)
└── README.md
```

## Run locally

You need **Node.js**, **Python 3.12+**, and **PostgreSQL**.

### Backend (terminal 1)
```bash
cd backend
python -m venv venv
.\venv\Scripts\python -m pip install -r requirements.txt
copy .env.example .env          # then edit DATABASE_URL with your postgres password
.\venv\Scripts\python init_db.py
.\venv\Scripts\python -m uvicorn app.main:app --reload --port 8000
```
API docs at http://localhost:8000/docs

### Frontend (terminal 2)
```bash
npm install
npm run dev
```
App at http://localhost:5173

## Environment variables

**Backend** (`backend/.env`):
- `DATABASE_URL` — e.g. `postgresql+psycopg2://postgres:PASSWORD@localhost:5432/carbondesk`
- `SECRET_KEY` — random string for signing JWTs
- `FRONTEND_ORIGIN` — allowed CORS origin (defaults to `http://localhost:5173`)

**Frontend** (`.env`):
- `VITE_API_BASE` — backend URL (defaults to `http://localhost:8000`)

## Deployment

See **[DEPLOY.md](DEPLOY.md)** — frontend to Vercel, backend + PostgreSQL to Railway (or Render).

## Honest scope notes

- Some integrations (real OAuth to accounting providers, supplier emails, regulator filing) are demonstrated as realistic mockups; production wiring is documented for the next phase.
- Anomaly detection ("Detect") needs granular per-machine / smart-meter data; on monthly bill data it is a Phase-2 capability and labelled as such.
- Emission factors and benchmarks come from published sources (Energy Commission / MGTC, DEFRA / IPCC) and are user-verifiable.

---

*Built for Tier-2 Penang / Klang Valley manufacturing SMEs facing EU CBAM (2026), Bursa IFRS S2 (2026), and MNC Scope-3 supplier pressure.*
