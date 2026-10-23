from fastapi import APIRouter, HTTPException
from ..config import settings
from ..snowflake import test_connection
router=APIRouter(prefix='/integrations',tags=['Integrations'])

@router.get('/status')
def integration_status():
    return {'cloudinary':{'configured':settings.cloudinary_configured,'purpose':'media upload and campaign asset hosting'},
            'snowflake':{'configured':settings.snowflake_configured,'purpose':'optional analytics warehouse; SQLite remains app database in this starter'},
            'ocr':{'configured':False,'purpose':'requires a chosen OCR provider and human review step'}}

@router.post('/snowflake/test')
def snowflake_test():
    if not settings.snowflake_configured: raise HTTPException(400,'Add Snowflake settings to backend .env first')
    try: return test_connection()
    except Exception as exc: raise HTTPException(502,f'Snowflake connection failed: {type(exc).__name__}')
