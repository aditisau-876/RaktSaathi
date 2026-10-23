from datetime import date, timedelta
from sqlalchemy.orm import Session
from . import models

BLOOD_GROUPS = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']

def seed_demo_data(db: Session):
    if db.query(models.BloodBank).first():
        return
    banks = [
        models.BloodBank(id='BB-DEL-A', name='Metro Trauma Hub (Bank A)', location='New Delhi', region='India'),
        models.BloodBank(id='BB-NOI-B', name='Noida Regional Center (Bank B)', location='Noida, Uttar Pradesh', region='India'),
        models.BloodBank(id='BB-GGN-C', name='Gurugram Community Bank (Bank C)', location='Gurugram, Haryana', region='India'),
    ]
    db.add_all(banks)
    db.flush()
    stock_values = {'BB-DEL-A': {'O-': (8,26,0), 'O+': (36,20,4), 'A-': (12,12,0), 'A+': (42,18,3), 'B-': (15,10,0), 'B+': (29,15,2), 'AB-': (6,6,0), 'AB+': (18,10,0)},
                    'BB-NOI-B': {'O-': (47,20,4), 'O+': (33,18,0), 'A-': (22,10,0), 'A+': (38,18,0), 'B-': (17,8,0), 'B+': (31,14,0), 'AB-': (9,5,0), 'AB+': (14,8,0)},
                    'BB-GGN-C': {'O-': (21,16,0), 'O+': (26,15,0), 'A-': (14,10,0), 'A+': (25,16,0), 'B-': (12,8,0), 'B+': (20,12,0), 'AB-': (5,5,0), 'AB+': (11,8,0)}}
    for bank_id, groups in stock_values.items():
        for bg, (units, floor, incoming) in groups.items():
            db.add(models.InventoryStock(bank_id=bank_id, blood_group=bg, units=units, safety_floor=floor, incoming_units=incoming,
                                         collection_date=date.today()-timedelta(days=2), expiry_date=date.today()+timedelta(days=30)))
    db.add_all([
      models.HospitalRequest(id='REQ-1001', hospital_name='Metro Trauma Hospital', department='Emergency', lead_clinician='Duty Clinician', blood_group='O-', units_requested=6, priority='STAT', status='ANALYZING', indication='Synthetic demo request'),
      models.HospitalRequest(id='REQ-1002', hospital_name='City General Hospital', department='Surgery', lead_clinician='Duty Clinician', blood_group='A+', units_requested=4, priority='URGENT', status='QUEUED', indication='Synthetic demo request'),
    ])
    for i, (bg, zone, km, available, consented, weeks) in enumerate([
      ('O-', 'Central Delhi', 2.4, True, True, 16), ('O-', 'South Delhi', 4.8, True, True, 24), ('O-', 'Noida Sector 18', 7.2, True, True, 30),
      ('O-', 'West Delhi', 8.1, False, True, 20), ('A+', 'Central Delhi', 3.0, True, True, 12), ('B+', 'Noida Sector 62', 5.5, True, True, 18),
    ]):
      db.add(models.Donor(id=f'DEMO-D{i+1:03d}', pseudonym=f'Demo Donor {i+1}', blood_group=bg, location_zone=zone, distance_km=km,
                          last_donation=date.today()-timedelta(weeks=weeks), available=available, consented=consented,
                          contact_masked='***-***-0101'))
    for i in range(30):
      bg = BLOOD_GROUPS[i % len(BLOOD_GROUPS)]
      db.add(models.Donation(id=f'DON-DEMO-{i+1:03d}', blood_group=bg, date=date.today()-timedelta(days=i), location=['New Delhi','Noida','Gurugram'][i%3], units=1))
    db.commit()
