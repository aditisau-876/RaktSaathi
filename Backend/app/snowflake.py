"""Optional Snowflake analytics export. SQLite remains the operational database."""
from .config import settings

def connection():
    if not settings.snowflake_configured:
        raise RuntimeError("Snowflake credentials are not configured")
    import snowflake.connector
    kwargs = {
        "account": settings.snowflake_account,
        "user": settings.snowflake_user,
        "password": settings.snowflake_password,
        "warehouse": settings.snowflake_warehouse,
        "database": settings.snowflake_database,
        "schema": settings.snowflake_schema,
    }
    if settings.snowflake_role:
        kwargs["role"] = settings.snowflake_role
    return snowflake.connector.connect(**kwargs)

def test_connection():
    conn = connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT CURRENT_VERSION(), CURRENT_DATABASE(), CURRENT_SCHEMA()")
            row = cur.fetchone()
            return {"connected": True, "version": row[0], "database": row[1], "schema": row[2]}
    finally:
        conn.close()

def sync_snapshot(db):
    """Upsert a pseudonymized operational snapshot into the Snowflake analytics tables.

    Run snowflake/schema.sql first. This is a one-way snapshot export, not a live
    bidirectional database connection. Donor contact data is deliberately excluded.
    """
    from . import models
    conn = connection()
    counts = {"inventory": 0, "requests": 0, "donations": 0, "donors": 0}
    try:
        with conn.cursor() as cur:
            stocks = db.query(models.InventoryStock, models.BloodBank).join(models.BloodBank).all()
            for stock, bank in stocks:
                cur.execute("""MERGE INTO INVENTORY t USING (SELECT %s ID, %s BANK, %s BANK_ID, %s BG, %s UNITS, %s FLOOR, %s INCOMING, %s CD, %s ED, %s REGION, TRUE SYNTH) s ON t.INVENTORY_ID=s.ID
                    WHEN MATCHED THEN UPDATE SET BLOOD_BANK=s.BANK, BLOOD_BANK_ID=s.BANK_ID, BLOOD_GROUP=s.BG, UNITS=s.UNITS, SAFETY_FLOOR=s.FLOOR, EXPECTED_INCOMING_UNITS=s.INCOMING, COLLECTION_DATE=s.CD, EXPIRY_DATE=s.ED, REGION=s.REGION, UPDATED_AT=CURRENT_TIMESTAMP(), IS_SYNTHETIC=s.SYNTH
                    WHEN NOT MATCHED THEN INSERT (INVENTORY_ID,BLOOD_BANK,BLOOD_BANK_ID,BLOOD_GROUP,UNITS,SAFETY_FLOOR,EXPECTED_INCOMING_UNITS,COLLECTION_DATE,EXPIRY_DATE,REGION,IS_SYNTHETIC) VALUES (s.ID,s.BANK,s.BANK_ID,s.BG,s.UNITS,s.FLOOR,s.INCOMING,s.CD,s.ED,s.REGION,s.SYNTH)""",
                    (str(stock.id), bank.name, bank.id, stock.blood_group, stock.units, stock.safety_floor, stock.incoming_units, stock.collection_date, stock.expiry_date, bank.region))
                counts["inventory"] += 1
            for req in db.query(models.HospitalRequest).all():
                cur.execute("""MERGE INTO REQUEST t USING (SELECT %s ID,%s HOSPITAL,%s BG,%s UNITS,%s URGENCY,%s DT,%s REGION,TRUE SYNTH) s ON t.REQUEST_ID=s.ID
                    WHEN MATCHED THEN UPDATE SET HOSPITAL=s.HOSPITAL,BLOOD_GROUP=s.BG,UNITS_REQUIRED=s.UNITS,URGENCY=s.URGENCY,REQUEST_DATE=s.DT,REGION=s.REGION,IS_SYNTHETIC=s.SYNTH
                    WHEN NOT MATCHED THEN INSERT (REQUEST_ID,HOSPITAL,BLOOD_GROUP,UNITS_REQUIRED,URGENCY,REQUEST_DATE,REGION,IS_SYNTHETIC) VALUES (s.ID,s.HOSPITAL,s.BG,s.UNITS,s.URGENCY,s.DT,s.REGION,s.SYNTH)""",
                    (req.id, req.hospital_name, req.blood_group, req.units_requested, req.priority, req.created_at, "India"))
                counts["requests"] += 1
            for donation in db.query(models.Donation).all():
                cur.execute("""MERGE INTO DONATION t USING (SELECT %s ID,%s BG,%s DT,%s LOC,%s UNITS,TRUE SYNTH) s ON t.DONATION_ID=s.ID
                    WHEN MATCHED THEN UPDATE SET BLOOD_GROUP=s.BG,DONATION_DATE=s.DT,LOCATION=s.LOC,UNITS=s.UNITS,IS_SYNTHETIC=s.SYNTH
                    WHEN NOT MATCHED THEN INSERT (DONATION_ID,BLOOD_GROUP,DONATION_DATE,LOCATION,UNITS,IS_SYNTHETIC) VALUES (s.ID,s.BG,s.DT,s.LOC,s.UNITS,s.SYNTH)""",
                    (donation.id, donation.blood_group, donation.date, donation.location, donation.units))
                counts["donations"] += 1
            for donor in db.query(models.Donor).all():
                cur.execute("""MERGE INTO DONOR_NETWORK t USING (SELECT %s ID,%s BG,%s ZONE,%s AVAIL,%s LAST,%s CONSENT,TRUE SYNTH) s ON t.DONOR_ID=s.ID
                    WHEN MATCHED THEN UPDATE SET BLOOD_GROUP=s.BG,LOCATION_ZONE=s.ZONE,AVAILABLE=s.AVAIL,LAST_DONATION=s.LAST,CONSENT=s.CONSENT,DATASET_LABEL='SYNTHETIC_DEMO'
                    WHEN NOT MATCHED THEN INSERT (DONOR_ID,BLOOD_GROUP,LOCATION_ZONE,AVAILABLE,LAST_DONATION,CONSENT,DATASET_LABEL) VALUES (s.ID,s.BG,s.ZONE,s.AVAIL,s.LAST,s.CONSENT,'SYNTHETIC_DEMO')""",
                    (donor.id, donor.blood_group, donor.location_zone, donor.available, donor.last_donation, donor.consented))
                counts["donors"] += 1
        conn.commit()
        return {"synced": True, "mode": "ONE_WAY_SNAPSHOT", "counts": counts, "notice": "Synthetic demo records only; donor contact details are excluded."}
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
