from datetime import date, datetime
from typing import Literal
from pydantic import BaseModel, Field, ConfigDict
BloodGroup = Literal['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']

class BankOut(BaseModel):
    id: str; name: str; location: str; region: str
    model_config = ConfigDict(from_attributes=True)

class StockOut(BaseModel):
    bank_id: str; blood_group: str; units: int; safety_floor: int; incoming_units: int
    model_config = ConfigDict(from_attributes=True)

class RequestCreate(BaseModel):
    hospital_name: str = Field(min_length=2, max_length=160)
    department: str = "General"
    lead_clinician: str = "Not provided"
    blood_group: BloodGroup
    units_requested: int = Field(gt=0, le=500)
    priority: Literal['STAT','URGENT','ROUTINE'] = 'ROUTINE'
    indication: str = ""

class RequestOut(BaseModel):
    id: str; hospital_name: str; department: str; lead_clinician: str
    blood_group: str; units_requested: int; priority: str; status: str; indication: str; created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class RequestStatusUpdate(BaseModel):
    status: Literal['ALLOCATED','IN_TRANSIT','QUEUED','ANALYZING']

class CampaignCreate(BaseModel):
    incident_id: str = "INC-DEMO-001"
    blood_group: BloodGroup
    headline: str = Field(min_length=3, max_length=200)
    body_text: str = Field(min_length=5, max_length=2000)
    format: Literal['1:1_SQUARE','9:16_STORY','16:9_LANDSCAPE','DOOH_TOTEM'] = '1:1_SQUARE'

class DonorOut(BaseModel):
    id: str; pseudonym: str; blood_group: str; location_zone: str; distance_km: float
    last_donation: date | None; available: bool; consented: bool; contact_masked: str
    model_config = ConfigDict(from_attributes=True)


class InventoryStockOut(BaseModel):
    id: int
    bank_id: str
    bank_name: str
    bank_location: str
    blood_group: BloodGroup
    units: int
    safety_floor: int
    incoming_units: int
    collection_date: date | None
    expiry_date: date | None
    stock_status: Literal["EXPIRED", "LOW", "HEALTHY", "NO_EXPIRY"]

class InventoryStockUpdate(BaseModel):
    safety_floor: int | None = Field(default=None, ge=0, le=100000)
    collection_date: date | None = None
    expiry_date: date | None = None

class InventoryAdjustmentCreate(BaseModel):
    units_delta: int = Field(ne=0, ge=-100000, le=100000)
    reason: str = Field(min_length=3, max_length=500)
    reference: str = Field(default="", max_length=100)

class InventoryMovementOut(BaseModel):
    id: int
    stock_id: int
    movement_type: str
    units_delta: int
    units_before: int
    units_after: int
    reason: str
    reference: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
