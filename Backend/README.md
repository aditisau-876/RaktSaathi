# RaktSaathi backend starter

This is a runnable FastAPI backend for the existing React/Vite frontend. It provides a local SQLite database, clearly labelled synthetic demo data, REST endpoints, optional Cloudinary asset hosting, and an optional Snowflake connection test/schema. It is a development/demo foundation, **not production-ready healthcare infrastructure**.

## 1. Run locally (Windows PowerShell)

```powershell
cd RaktSaathi_Backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload
```

Open http://127.0.0.1:8000/docs for interactive API docs and http://127.0.0.1:8000/api/v1/health for health status. The first run creates `raktsaathi.db` and seeds demo rows. Delete that database file only if you want a clean reseed; do not do this if you need to keep local changes.

## 2. Current endpoints

- `GET /api/v1/health` — API and integration configuration status
- `GET /api/v1/dashboard/summary` — dashboard counters
- `GET /api/v1/banks` — blood banks
- `GET /api/v1/inventory?bank_id=BB-DEL-A&blood_group=O-` — inventory
- `GET /api/v1/radar` — all bank × blood-group risk cells
- `GET /api/v1/radar/{bank_id}/{blood_group}` — drill-down, possible surplus banks, donor count and review actions
- `GET /api/v1/requests` — hospital requests
- `POST /api/v1/requests` — create a request
- `PATCH /api/v1/requests/{request_id}/status` — update request status
- `GET /api/v1/donors?blood_group=O-` — synthetic, consent-filtered donor records
- `GET /api/v1/donors/prioritize?blood_group=O-` — nearest demo donor records first
- `POST /api/v1/documents/upload` — upload JPG/PNG/WEBP/PDF (10 MB max)
- `GET /api/v1/documents` — uploaded document list
- `POST /api/v1/campaigns` — generate a campaign SVG draft; uploads it to Cloudinary if configured
- `GET /api/v1/campaigns` — campaign history
- `GET /api/v1/integrations/status` — integration readiness
- `POST /api/v1/integrations/snowflake/test` — test optional Snowflake connectivity
- `POST /api/v1/integrations/snowflake/sync` — one-way snapshot export of inventory, requests, donation aggregates and pseudonymous donor metadata to Snowflake (run `snowflake/schema.sql` first)

## 3. Connect the frontend

In `Frontend/.env` add:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

Then create a small `src/services/api.ts` wrapper around `fetch` and replace imports from `src/data/mock*.ts` and mutation-only `IncidentContext` behavior with API requests. Example:

```ts
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api/v1';
export async function getRadar() {
  const response = await fetch(`${API_BASE}/radar`);
  if (!response.ok) throw new Error(`API request failed: ${response.status}`);
  return response.json();
}
```

The backend endpoints are a sensible first integration target, but they do **not** automatically connect your existing screens. Adapt response field names and add loading, error, empty, and stale-data states.

## 4. Cloudinary setup

Create a Cloudinary account, copy its cloud name, API key, and API secret into the backend `.env`, then restart the server. Keep the API secret on the server only. Document uploads are stored in Cloudinary when configured. Campaign SVG drafts are generated locally and uploaded to Cloudinary if configured. Without credentials, the API still returns the generated SVG markup for preview.

**OCR is not implemented in this starter.** Uploading a scanned report is not the same as extracting reliable fields. Add a chosen OCR provider, parse extracted text into a typed schema, show a human-review/confirmation step, and only then write verified inventory records. The response intentionally marks OCR as not configured rather than pretending it ran.

## 5. Snowflake setup and role

SQLite is the runnable transactional store for this starter. Snowflake is optional and currently has a connection-test endpoint plus a starter analytics schema at `snowflake/schema.sql`; the app does **not** yet automatically mirror every SQLite change into Snowflake or run its risk queries there. To make Snowflake the source of truth, implement a repository/warehouse layer and migration/ingestion jobs, then move the risk/forecast queries to Snowflake and add integration tests. This is a deliberate, visible limitation rather than fake integration.

Set Snowflake connection fields in `.env`, run `snowflake/schema.sql` in that database/schema, then call `POST /api/v1/integrations/snowflake/test` followed by `POST /api/v1/integrations/snowflake/sync`. Use a restricted service role. The sync endpoint intentionally excludes donor contact details. Never expose Snowflake credentials in Vite `VITE_*` variables.

## 6. What the risk number means

The demo uses a transparent rule-based heuristic: `projected_gap = expected_demand_24h - available_units - expected_incoming_units`. Risk is red if stock is below the safety floor or the projected gap is positive; amber near the floor; otherwise green. The forecast baseline is intentionally simple and uses a small demo request baseline. It is **not a trained ML model, not validated, and not safe to use for real operational decisions**. Replace it with properly validated forecasting trained on approved historical data, account for expiry/compatible components and uncertainty, and review with blood-service experts.

## 7. Production blockers before any real deployment

- Authentication, role-based access control, secure session/token lifecycle and audit logging are not implemented.
- Add database migrations, automated tests, backups, monitoring, rate limits, secret management and deployment hardening.
- Replace synthetic records with authorized, validated integrations; do not scrape donor personal data.
- Donor eligibility is not determined here. Integrate only the blood service's approved eligibility rules, and keep final review with qualified staff.
- Transfer suggestions are leads to verify, not executable orders. No transfer or donor notification is actually dispatched by this starter.
- Add consent capture/revocation, retention policy, access controls and applicable legal/privacy review before handling real donor or hospital information.
- Add a real OCR pipeline and human verification before changing inventory from uploaded documents.

## 8. Example requests

Create a hospital request:

```json
{
  "hospital_name": "Demo General Hospital",
  "department": "Emergency",
  "lead_clinician": "Duty Clinician",
  "blood_group": "O-",
  "units_requested": 3,
  "priority": "URGENT",
  "indication": "Synthetic demonstration request"
}
```

Generate a campaign draft:

```json
{
  "incident_id": "INC-DEMO-001",
  "blood_group": "O-",
  "headline": "Help support the local blood supply",
  "body_text": "Contact an authorized blood service for verified donation details.",
  "format": "1:1_SQUARE"
}
```


## 9. Integration status truth

- Cloudinary is active only when all three Cloudinary credentials are present. It stores uploaded media and generated campaign SVG assets; it does not perform OCR in this codebase.
- Snowflake is active only when its connection fields are present. The app database remains SQLite; the explicit sync endpoint exports a snapshot to Snowflake.
- OCR is not implemented. Document uploads are stored, marked `NOT_RUN`, and must not be used to update stock automatically.
- Campaign delivery (WhatsApp/SMS/donor app/DOOH) is not implemented. Campaign creation only creates a draft asset.
- CORS now reads `FRONTEND_ORIGINS` from `.env`; add the exact frontend origin used by your Vite server.
