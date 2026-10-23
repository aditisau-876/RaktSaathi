from datetime import datetime, date
from sqlalchemy import String, Integer, Float, Boolean, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .database import Base

class BloodBank(Base):
    __tablename__ = "blood_banks"
    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    location: Mapped[str] = mapped_column(String(200), nullable=False)
    region: Mapped[str] = mapped_column(String(80), default="India")
    stocks: Mapped[list["InventoryStock"]] = relationship(back_populates="bank", cascade="all, delete-orphan")

class InventoryStock(Base):
    __tablename__ = "inventory"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    bank_id: Mapped[str] = mapped_column(ForeignKey("blood_banks.id"), index=True)
    blood_group: Mapped[str] = mapped_column(String(3), index=True)
    units: Mapped[int] = mapped_column(Integer, default=0)
    safety_floor: Mapped[int] = mapped_column(Integer, default=10)
    incoming_units: Mapped[int] = mapped_column(Integer, default=0)
    collection_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    expiry_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    bank: Mapped[BloodBank] = relationship(back_populates="stocks")

class HospitalRequest(Base):
    __tablename__ = "hospital_requests"
    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    hospital_name: Mapped[str] = mapped_column(String(160), nullable=False)
    department: Mapped[str] = mapped_column(String(120), default="General")
    lead_clinician: Mapped[str] = mapped_column(String(120), default="Not provided")
    blood_group: Mapped[str] = mapped_column(String(3), index=True)
    units_requested: Mapped[int] = mapped_column(Integer)
    priority: Mapped[str] = mapped_column(String(20), default="ROUTINE")
    status: Mapped[str] = mapped_column(String(20), default="QUEUED")
    indication: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class Donor(Base):
    __tablename__ = "donors"
    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    pseudonym: Mapped[str] = mapped_column(String(100), nullable=False)
    blood_group: Mapped[str] = mapped_column(String(3), index=True)
    location_zone: Mapped[str] = mapped_column(String(120), default="Unassigned")
    distance_km: Mapped[float] = mapped_column(Float, default=0)
    last_donation: Mapped[date | None] = mapped_column(Date, nullable=True)
    available: Mapped[bool] = mapped_column(Boolean, default=False)
    consented: Mapped[bool] = mapped_column(Boolean, default=False)
    contact_masked: Mapped[str] = mapped_column(String(60), default="Not available")

class Donation(Base):
    __tablename__ = "donations"
    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    blood_group: Mapped[str] = mapped_column(String(3), index=True)
    date: Mapped[date] = mapped_column(Date)
    location: Mapped[str] = mapped_column(String(160))
    units: Mapped[int] = mapped_column(Integer, default=1)

class DocumentUpload(Base):
    __tablename__ = "document_uploads"
    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    filename: Mapped[str] = mapped_column(String(255))
    asset_url: Mapped[str] = mapped_column(Text, default="")
    extracted_fields: Mapped[str] = mapped_column(Text, default="{}")
    status: Mapped[str] = mapped_column(String(30), default="UPLOADED")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class Campaign(Base):
    __tablename__ = "campaigns"
    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    incident_id: Mapped[str] = mapped_column(String(40))
    blood_group: Mapped[str] = mapped_column(String(3))
    headline: Mapped[str] = mapped_column(String(200))
    body_text: Mapped[str] = mapped_column(Text)
    asset_url: Mapped[str] = mapped_column(Text, default="")
    format: Mapped[str] = mapped_column(String(30), default="1:1_SQUARE")
    status: Mapped[str] = mapped_column(String(30), default="DRAFT")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
