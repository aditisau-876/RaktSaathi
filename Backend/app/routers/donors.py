from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
router=APIRouter(prefix='/donors',tags=['Donor network'])

@router.get('',response_model=list[schemas.DonorOut])
def list_donors(blood_group: str | None=None, available: bool | None=None, consented_only: bool=True, db: Session=Depends(get_db)):
    q=db.query(models.Donor)
    if blood_group: q=q.filter(models.Donor.blood_group==blood_group.upper())
    if available is not None: q=q.filter(models.Donor.available.is_(available))
    if consented_only: q=q.filter(models.Donor.consented.is_(True))
    return q.order_by(models.Donor.distance_km).all()

@router.get('/prioritize')
def prioritize(blood_group: str, limit: int=20, db: Session=Depends(get_db)):
    donors=db.query(models.Donor).filter(models.Donor.blood_group==blood_group.upper(),models.Donor.available.is_(True),models.Donor.consented.is_(True)).order_by(models.Donor.distance_km).limit(min(limit,100)).all()
    return {'blood_group':blood_group.upper(),'count':len(donors),'data_mode':'SYNTHETIC_DEMO',
            'items':[{'id':d.id,'pseudonym':d.pseudonym,'location_zone':d.location_zone,'distance_km':d.distance_km,
                      'last_donation':d.last_donation,'contact_masked':d.contact_masked,
                      'priority_reason':'Demo: opted-in, marked available, matching blood group, nearer first'} for d in donors],
            'notice':'This is not medical eligibility screening. Approved blood-service rules and donor confirmation are required.'}
