from pydantic import BaseModel
from typing import Any, Optional, List, Dict


class RegisterIn(BaseModel):
    email: str
    password: str
    company_name: str
    name: Optional[str] = ""


class LoginIn(BaseModel):
    email: str
    password: str


class CalcIn(BaseModel):
    inputs: Dict[str, Any]
    suppliers: List[Dict[str, Any]] = []


class AssessmentIn(BaseModel):
    period: str = ""
    inputs: Dict[str, Any]
    suppliers: List[Dict[str, Any]] = []


class SupplierIn(BaseModel):
    name: str = ""
    mat: str = ""
    tonnes: float = 0
    factor: float = 1.46
    status: str = "none"


class FacilityIn(BaseModel):
    name: str = ""
    loc: str = ""
    act: str = ""
    s12: float = 0
    s3: float = 0


class FactorsIn(BaseModel):
    factors: Dict[str, float]
