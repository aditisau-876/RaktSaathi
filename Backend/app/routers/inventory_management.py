
from datetime import date, datetime
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/inventory-management",
    tags=["Inventory Management"],
)

MOVEMENT_TYPES = {
    "RECEIPT",
    "ISSUE",
    "CORRECTION",
}


def get_stock_or_404(db: Session, stock_id: int) -> models.InventoryStock:
    stock = db.get(models.InventoryStock, stock_id)
    if stock is None:
        raise HTTPException(status_code=404, detail="Inventory record not found.")
    return stock


def validate_dates(
    collection_date: date | None,
    expiry_date: date | None,
) -> None:
    if collection_date and expiry_date and expiry_date < collection_date:
        raise HTTPException(
            status_code=422,
            detail="Expiry date cannot be earlier than collection date.",
        )


def get_stock_status(stock: models.InventoryStock) -> str:
    if stock.expiry_date and stock.expiry_date < date.today():
        return "EXPIRED"
    if stock.units < stock.safety_floor:
        return "LOW"
    if stock.expiry_date is None:
        return "NO_EXPIRY"
    return "HEALTHY"


def serialize_stock(stock: models.InventoryStock) -> dict:
    bank = stock.bank
    return {
        "id": stock.id,
        "bank_id": stock.bank_id,
        "bank_name": bank.name,
        "bank_location": bank.location,
        "blood_group": stock.blood_group,
        "units": stock.units,
        "safety_floor": stock.safety_floor,
        "incoming_units": stock.incoming_units,
        "collection_date": stock.collection_date,
        "expiry_date": stock.expiry_date,
        "stock_status": get_stock_status(stock),
    }


@router.get("/stocks", response_model=list[schemas.InventoryStockOut])
def list_inventory(
    bank_id: str | None = None,
    blood_group: schemas.BloodGroup | None = None,
    status: Literal["EXPIRED", "LOW", "HEALTHY", "NO_EXPIRY"] | None = None,
    search: str | None = Query(default=None, max_length=160),
    db: Session = Depends(get_db),
):
    query = (
        select(models.InventoryStock)
        .join(models.BloodBank)
        .order_by(models.BloodBank.name, models.InventoryStock.blood_group)
    )

    if bank_id:
        query = query.where(models.InventoryStock.bank_id == bank_id)

    if blood_group:
        query = query.where(models.InventoryStock.blood_group == blood_group)

    if search:
        term = f"%{search.strip()}%"
        query = query.where(
            models.BloodBank.name.ilike(term)
            | models.BloodBank.location.ilike(term)
        )

    stocks = db.scalars(query).all()
    results = [serialize_stock(stock) for stock in stocks]

    if status:
        results = [
            item for item in results
            if item["stock_status"] == status
        ]

    return results


@router.patch(
    "/stocks/{stock_id}",
    response_model=schemas.InventoryStockOut,
)
def update_inventory_metadata(
    stock_id: int,
    payload: schemas.InventoryStockUpdate,
    db: Session = Depends(get_db),
):
    stock = get_stock_or_404(db, stock_id)
    changes = payload.model_dump(exclude_unset=True)

    collection_date = changes.get("collection_date", stock.collection_date)
    expiry_date = changes.get("expiry_date", stock.expiry_date)
    validate_dates(collection_date, expiry_date)

    for field, value in changes.items():
        setattr(stock, field, value)

    db.commit()
    db.refresh(stock)
    return serialize_stock(stock)


@router.post(
    "/stocks/{stock_id}/adjustments",
    response_model=schemas.InventoryMovementOut,
    status_code=201,
)
def adjust_inventory(
    stock_id: int,
    payload: schemas.InventoryAdjustmentCreate,
    db: Session = Depends(get_db),
):
    stock = get_stock_or_404(db, stock_id)

    if stock.expiry_date and stock.expiry_date < date.today():
        raise HTTPException(
            status_code=409,
            detail="Expired stock cannot be adjusted through this endpoint.",
        )

    before = stock.units
    after = before + payload.units_delta

    if after < 0:
        raise HTTPException(
            status_code=422,
            detail=f"Insufficient stock. Available units: {before}.",
        )

    if payload.units_delta > 0:
        movement_type = "RECEIPT"
    elif payload.units_delta < 0:
        movement_type = "ISSUE"
    else:
        movement_type = "CORRECTION"

    movement = models.InventoryMovement(
        stock_id=stock.id,
        movement_type=movement_type,
        units_delta=payload.units_delta,
        units_before=before,
        units_after=after,
        reason=payload.reason.strip(),
        reference=payload.reference.strip(),
    )

    try:
        stock.units = after
        db.add(movement)
        db.commit()
        db.refresh(movement)
    except Exception:
        db.rollback()
        raise

    return movement


@router.get(
    "/stocks/{stock_id}/movements",
    response_model=list[schemas.InventoryMovementOut],
)
def list_stock_movements(
    stock_id: int,
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    get_stock_or_404(db, stock_id)

    query = (
        select(models.InventoryMovement)
        .where(models.InventoryMovement.stock_id == stock_id)
        .order_by(models.InventoryMovement.created_at.desc())
        .limit(limit)
    )

    return db.scalars(query).all()


@router.get("/summary")
def inventory_summary(db: Session = Depends(get_db)):
    stocks = db.scalars(
        select(models.InventoryStock).order_by(models.InventoryStock.id)
    ).all()

    return {
        "total_records": len(stocks),
        "total_units": sum(stock.units for stock in stocks),
        "low_stock_records": sum(
            1 for stock in stocks
            if get_stock_status(stock) == "LOW"
        ),
        "expired_records": sum(
            1 for stock in stocks
            if get_stock_status(stock) == "EXPIRED"
        ),
        "no_expiry_records": sum(
            1 for stock in stocks
            if get_stock_status(stock) == "NO_EXPIRY"
        ),
        "last_calculated_at": datetime.utcnow(),
    }
