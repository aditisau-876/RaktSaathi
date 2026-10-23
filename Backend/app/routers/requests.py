from uuid import uuid4
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
router = APIRouter(prefix='/requests', tags=['Hospital requests'])

@router.get('', response_model=list[schemas.RequestOut])
def list_requests(status: str | None = None, db: Session = Depends(get_db)):
    q=db.query(models.HospitalRequest)
    if status: q=q.filter(models.HospitalRequest.status==status.upper())
    return q.order_by(models.HospitalRequest.created_at.desc()).all()

@router.post('', response_model=schemas.RequestOut, status_code=201)
def create_request(payload: schemas.RequestCreate, db: Session = Depends(get_db)):
    item=models.HospitalRequest(id=f'REQ-{uuid4().hex[:8].upper()}', **payload.model_dump(), status='ANALYZING')
    db.add(item); db.commit(); db.refresh(item); return item

@router.patch('/{request_id}/status', response_model=schemas.RequestOut)
def update_status(request_id: str, payload: schemas.RequestStatusUpdate, db: Session = Depends(get_db)):
    item=db.get(models.HospitalRequest, request_id)
    if not item: raise HTTPException(404,'Request not found')
    item.status=payload.status; db.commit(); db.refresh(item); return item
