from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..config import settings
from ..database import get_db
from ..snowflake import test_connection, sync_snapshot

router = APIRouter(prefix="/integrations", tags=["Integrations"])

@router.get("/status")
def integration_status():
    return {
        "cloudinary": {"configured": settings.cloudinary_configured, "purpose": "document storage and campaign asset hosting", "active": settings.cloudinary_configured},
        "snowflake": {"configured": settings.snowflake_configured, "purpose": "optional analytics warehouse; SQLite remains operational database", "active": False},
        "ocr": {"configured": False, "purpose": "not implemented; requires an OCR provider and human review"},
    }

@router.post("/snowflake/test")
def snowflake_test():
    if not settings.snowflake_configured:
        raise HTTPException(400, "Add Snowflake settings to backend .env first.")
    try:
        return test_connection()
    except Exception as exc:
        raise HTTPException(502, f"Snowflake connection failed: {type(exc).__name__}")

@router.post("/snowflake/sync")
def snowflake_sync(db: Session = Depends(get_db)):
    if not settings.snowflake_configured:
        raise HTTPException(400, "Add Snowflake settings to backend .env first.")
    try:
        return sync_snapshot(db)
    except Exception as exc:
        raise HTTPException(502, f"Snowflake snapshot sync failed: {type(exc).__name__}. Confirm schema.sql has been run.")
