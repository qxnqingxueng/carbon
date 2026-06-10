import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from .db import Base


class Company(Base):
    __tablename__ = "companies"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    industry = Column(String, default="")
    location = Column(String, default="")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, default="")
    role = Column(String, default="Owner")
    company_id = Column(Integer, ForeignKey("companies.id"))
    company = relationship("Company")


class Assessment(Base):
    __tablename__ = "assessments"
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), index=True)
    period = Column(String, default="")
    inputs = Column(JSONB)
    suppliers = Column(JSONB)
    result = Column(JSONB)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Supplier(Base):
    __tablename__ = "suppliers"
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), index=True)
    name = Column(String, default="")
    mat = Column(String, default="")
    tonnes = Column(Float, default=0)
    factor = Column(Float, default=1.46)
    status = Column(String, default="none")


class Facility(Base):
    __tablename__ = "facilities"
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), index=True)
    name = Column(String, default="")
    loc = Column(String, default="")
    act = Column(String, default="")
    s12 = Column(Float, default=0)
    s3 = Column(Float, default=0)


class CompanySettings(Base):
    __tablename__ = "company_settings"
    company_id = Column(Integer, ForeignKey("companies.id"), primary_key=True)
    factors = Column(JSONB)
