from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from .. import models
from ..services import radar, risk_for, expected_demand

router = APIRouter(tags=['Dashboard and inventory'])

@router.get('/health')
def health():
    from ..config import settings
    return {'status':'ok','service':'RaktSaathi API','database':'configured','cloudinary_configured':settings.cloudinary_configured,
            'snowflake_configured':settings.snowflake_configured,'environment':settings.environment}

@router.get('/dashboard/summary')
def summary(db: Session = Depends(get_db)):
    risks = radar(db)
    return {'blood_banks':db.query(models.BloodBank).count(), 'inventory_rows':db.query(models.InventoryStock).count(),
            'open_requests':db.query(models.HospitalRequest).filter(models.HospitalRequest.status.in_(['QUEUED','ANALYZING'])).count(),
            'red_cells':sum(r['risk']=='RED' for r in risks), 'amber_cells':sum(r['risk']=='AMBER' for r in risks),
            'green_cells':sum(r['risk']=='GREEN' for r in risks), 'data_mode':'SYNTHETIC_DEMO'}

@router.get('/banks')
def list_banks(db: Session = Depends(get_db)):
    return [{'id':b.id,'name':b.name,'location':b.location,'region':b.region} for b in db.query(models.BloodBank).order_by(models.BloodBank.name).all()]

@router.get('/inventory')
def inventory(bank_id: str | None = None, blood_group: str | None = None, db: Session = Depends(get_db)):
    q = db.query(models.InventoryStock, models.BloodBank).join(models.BloodBank)
    if bank_id: q = q.filter(models.InventoryStock.bank_id == bank_id)
    if blood_group: q = q.filter(models.InventoryStock.blood_group == blood_group)
    return [{'bank_id':b.id,'bank_name':b.name,'location':b.location,'blood_group':s.blood_group,'units':s.units,
             'safety_floor':s.safety_floor,'incoming_units':s.incoming_units,'collection_date':s.collection_date,
             'expiry_date':s.expiry_date} for s,b in q.order_by(models.BloodBank.name, models.InventoryStock.blood_group).all()]

@router.get('/radar')
def get_radar(db: Session = Depends(get_db)):
    return {'data_mode':'SYNTHETIC_DEMO','method':'DEMO_RULE_BASED','items':radar(db)}

@router.get('/radar/{bank_id}/{blood_group}')
def radar_detail(bank_id: str, blood_group: str, db: Session = Depends(get_db)):
    row = db.query(models.BloodBank, models.InventoryStock).join(models.InventoryStock).filter(
        models.BloodBank.id==bank_id, models.InventoryStock.blood_group==blood_group.upper()).first()
    if not row: raise HTTPException(404, 'No inventory row for that bank and blood group')
    bank, stock = row
    demand = expected_demand(db, stock.blood_group, bank.id)
    score = risk_for(stock.units, stock.safety_floor, demand, stock.incoming_units)
    donors = db.query(models.Donor).filter(models.Donor.blood_group==stock.blood_group, models.Donor.available.is_(True), models.Donor.consented.is_(True)).count()
    surplus = db.query(models.InventoryStock, models.BloodBank).join(models.BloodBank).filter(
        models.InventoryStock.blood_group==stock.blood_group, models.BloodBank.id!=bank_id,
        models.InventoryStock.units > models.InventoryStock.safety_floor).all()
    alternatives = [{'bank_id':b.id,'bank_name':b.name,'location':b.location,'units':s.units,'safety_floor':s.safety_floor,
                     'potential_surplus_units':max(0,s.units-s.safety_floor)} for s,b in surplus]
    return {'bank_id':bank.id,'bank_name':bank.name,'location':bank.location,'blood_group':stock.blood_group,**score,
            'eligible_consented_available_donor_count_demo':donors,'potential_transfer_sources':alternatives,
            'recommended_actions':['Verify stock and expiry with the source bank','Check approved inter-bank transfer and cold-chain procedures',
                                   'If still required, ask authorized staff to review targeted donor outreach'],
            'notice':'Demo estimates only. Staff must verify inventory, compatibility, donor eligibility and transfer feasibility.'}
