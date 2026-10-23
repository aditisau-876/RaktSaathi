from datetime import date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from . import models
from .config import settings


def risk_for(units: int, safety_floor: int, expected_demand: int, incoming: int) -> dict:
    # Transparent demo heuristic, not a validated clinical/operational model.
    projected_gap = expected_demand - units - incoming
    if units < safety_floor or projected_gap > 0:
        risk = 'RED'
    elif units <= safety_floor * 1.25 or projected_gap == 0:
        risk = 'AMBER'
    else:
        risk = 'GREEN'
    return {'available_units': units, 'safety_floor': safety_floor, 'expected_demand_24h': expected_demand,
            'expected_incoming_units': incoming, 'projected_gap': projected_gap, 'risk': risk,
            'risk_window_hours': 24 if risk == 'RED' else (48 if risk == 'AMBER' else None),
            'method': 'DEMO_RULE_BASED', 'is_synthetic': True}


def expected_demand(db: Session, blood_group: str, bank_id: str) -> int:
    # Use the recent synthetic donation/request counts as a simple baseline proxy.
    recent = date.today() - timedelta(days=14)
    request_units = db.query(func.coalesce(func.sum(models.HospitalRequest.units_requested), 0)).filter(
        models.HospitalRequest.blood_group == blood_group,
        models.HospitalRequest.created_at >= recent,
    ).scalar() or 0
    # Keep a minimum visible forecast in the demo; label it as a heuristic.
    return max(6, round(float(request_units) / 2))


def radar(db: Session):
    rows = db.query(models.BloodBank, models.InventoryStock).join(models.InventoryStock).all()
    results = []
    for bank, stock in rows:
        demand = expected_demand(db, stock.blood_group, bank.id)
        score = risk_for(stock.units, stock.safety_floor, demand, stock.incoming_units)
        results.append({'bank_id': bank.id, 'bank_name': bank.name, 'location': bank.location,
                        'blood_group': stock.blood_group, **score})
    order = {'RED': 0, 'AMBER': 1, 'GREEN': 2}
    results.sort(key=lambda x: (order[x['risk']], x['bank_name'], x['blood_group']))
    return results


def cloudinary_ready():
    return settings.cloudinary_configured
