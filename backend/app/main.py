from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .db import get_db, Base, engine
from .config import FRONTEND_ORIGIN
from . import models, schemas, auth, calc

# create tables if they don't exist yet
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CarbonDesk API", version="0.1.0")
_origins = list({FRONTEND_ORIGIN, "http://localhost:5173", "http://127.0.0.1:5173"})
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "CarbonDesk API"}


@app.post("/api/auth/register")
def register(body: schemas.RegisterIn, db: Session = Depends(get_db)):
    if "@" not in body.email or "." not in body.email.split("@")[-1]:
        raise HTTPException(status_code=400, detail="Enter a valid email address")
    if len(body.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    if not body.company_name.strip():
        raise HTTPException(status_code=400, detail="Company name is required")
    if db.query(models.User).filter_by(email=body.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    company = models.Company(name=body.company_name)
    db.add(company)
    db.flush()
    user = models.User(email=body.email, password_hash=auth.hash_pw(body.password),
                       name=body.name or "", company_id=company.id)
    db.add(user)
    # seed sensible starter data so a new account isn't empty
    db.add_all([
        models.Supplier(company_id=company.id, name="SteelCo Penang", mat="Hot-rolled coil", tonnes=55, factor=1.46, status="received"),
        models.Supplier(company_id=company.id, name="MetalSource", mat="Cold-rolled sheet", tonnes=30, factor=1.46, status="received"),
        models.Facility(company_id=company.id, name="Line A", loc="Penang", act="Metal stamping", s12=100.4, s3=124.1),
        models.Facility(company_id=company.id, name="Line B", loc="Penang", act="Assembly", s12=96.0, s3=88.0),
        models.CompanySettings(company_id=company.id, factors={"elec": 0.74, "diesel": 2.68, "gas": 2.02, "steel": 1.46}),
    ])
    db.commit()
    return {"token": auth.make_token(user), "user": {"email": user.email, "name": user.name, "company": company.name}}


@app.post("/api/auth/login")
def login(body: schemas.LoginIn, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(email=body.email).first()
    if not user or not auth.verify_pw(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"token": auth.make_token(user), "user": {"email": user.email, "name": user.name, "company": user.company.name}}


@app.get("/api/auth/me")
def me(user=Depends(auth.current_user)):
    return {"email": user.email, "name": user.name, "company": user.company.name, "role": user.role}


@app.post("/api/calc")
def do_calc(body: schemas.CalcIn):
    return calc.compute(body.inputs, body.suppliers)


@app.post("/api/assessments")
def save_assessment(body: schemas.AssessmentIn, user=Depends(auth.current_user), db: Session = Depends(get_db)):
    result = calc.compute(body.inputs, body.suppliers)
    a = models.Assessment(company_id=user.company_id, period=body.period,
                          inputs=body.inputs, suppliers=body.suppliers, result=result)
    db.add(a)
    db.commit()
    db.refresh(a)
    return {"id": a.id, "period": a.period, "result": result}


@app.get("/api/assessments")
def list_assessments(user=Depends(auth.current_user), db: Session = Depends(get_db)):
    rows = (db.query(models.Assessment)
              .filter_by(company_id=user.company_id)
              .order_by(models.Assessment.created_at.desc()).all())
    return [{"id": r.id, "period": r.period, "result": r.result, "created_at": r.created_at.isoformat()} for r in rows]


DEFAULT_FACTORS = {"elec": 0.74, "diesel": 2.68, "gas": 2.02, "steel": 1.46}


# ---- Suppliers ----
@app.get("/api/suppliers")
def get_suppliers(user=Depends(auth.current_user), db: Session = Depends(get_db)):
    rows = db.query(models.Supplier).filter_by(company_id=user.company_id).order_by(models.Supplier.id).all()
    return [{"id": r.id, "name": r.name, "mat": r.mat, "tonnes": r.tonnes, "factor": r.factor, "status": r.status} for r in rows]


@app.post("/api/suppliers")
def add_supplier(body: schemas.SupplierIn, user=Depends(auth.current_user), db: Session = Depends(get_db)):
    r = models.Supplier(company_id=user.company_id, **body.model_dump())
    db.add(r); db.commit(); db.refresh(r)
    return {"id": r.id}


@app.put("/api/suppliers/{sid}")
def update_supplier(sid: int, body: schemas.SupplierIn, user=Depends(auth.current_user), db: Session = Depends(get_db)):
    r = db.query(models.Supplier).filter_by(id=sid, company_id=user.company_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Supplier not found")
    for k, v in body.model_dump().items():
        setattr(r, k, v)
    db.commit()
    return {"ok": True}


@app.delete("/api/suppliers/{sid}")
def delete_supplier(sid: int, user=Depends(auth.current_user), db: Session = Depends(get_db)):
    r = db.query(models.Supplier).filter_by(id=sid, company_id=user.company_id).first()
    if r:
        db.delete(r); db.commit()
    return {"ok": True}


# ---- Facilities ----
@app.get("/api/facilities")
def get_facilities(user=Depends(auth.current_user), db: Session = Depends(get_db)):
    rows = db.query(models.Facility).filter_by(company_id=user.company_id).order_by(models.Facility.id).all()
    return [{"id": r.id, "name": r.name, "loc": r.loc, "act": r.act, "s12": r.s12, "s3": r.s3} for r in rows]


@app.post("/api/facilities")
def add_facility(body: schemas.FacilityIn, user=Depends(auth.current_user), db: Session = Depends(get_db)):
    r = models.Facility(company_id=user.company_id, **body.model_dump())
    db.add(r); db.commit(); db.refresh(r)
    return {"id": r.id}


@app.delete("/api/facilities/{fid}")
def delete_facility(fid: int, user=Depends(auth.current_user), db: Session = Depends(get_db)):
    r = db.query(models.Facility).filter_by(id=fid, company_id=user.company_id).first()
    if r:
        db.delete(r); db.commit()
    return {"ok": True}


# ---- Factors ----
@app.get("/api/factors")
def get_factors(user=Depends(auth.current_user), db: Session = Depends(get_db)):
    s = db.query(models.CompanySettings).filter_by(company_id=user.company_id).first()
    return s.factors if (s and s.factors) else DEFAULT_FACTORS


@app.put("/api/factors")
def put_factors(body: schemas.FactorsIn, user=Depends(auth.current_user), db: Session = Depends(get_db)):
    s = db.query(models.CompanySettings).filter_by(company_id=user.company_id).first()
    if not s:
        s = models.CompanySettings(company_id=user.company_id)
        db.add(s)
    s.factors = body.factors
    db.commit()
    return {"ok": True}
