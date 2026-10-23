import json, uuid
from pathlib import Path
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from ..config import settings

router=APIRouter(tags=['Documents and campaigns'])
ALLOWED_TYPES={'image/jpeg','image/png','image/webp','application/pdf'}
MAX_BYTES=10*1024*1024

@router.post('/documents/upload')
async def upload_document(file: UploadFile=File(...), db: Session=Depends(get_db)):
    if file.content_type not in ALLOWED_TYPES: raise HTTPException(415,'Upload a JPG, PNG, WEBP or PDF document')
    raw=await file.read()
    if len(raw)>MAX_BYTES: raise HTTPException(413,'Maximum upload size is 10 MB')
    asset_url=''
    status='UPLOADED_LOCAL'
    if settings.cloudinary_configured:
        try:
            import cloudinary, cloudinary.uploader
            cloudinary.config(cloud_name=settings.cloudinary_cloud_name,api_key=settings.cloudinary_api_key,api_secret=settings.cloudinary_api_secret,secure=True)
            result=cloudinary.uploader.upload(raw,folder=settings.cloudinary_upload_folder,resource_type='auto',public_id=uuid.uuid4().hex)
            asset_url=result.get('secure_url',''); status='UPLOADED_CLOUDINARY'
        except Exception as exc:
            raise HTTPException(502, f'Cloudinary upload failed: {type(exc).__name__}')
    item=models.DocumentUpload(id=f'DOC-{uuid.uuid4().hex[:10].upper()}',filename=file.filename or 'upload',asset_url=asset_url,
                               extracted_fields=json.dumps({'needs_human_review':True,'ocr_status':'NOT_RUN','note':'OCR is not configured in this starter; do not treat unreviewed extraction as inventory truth.'}),status=status)
    db.add(item); db.commit(); db.refresh(item)
    return {'id':item.id,'filename':item.filename,'asset_url':item.asset_url,'status':item.status,
            'ocr_status':'NOT_CONFIGURED','next_step':'Connect an OCR provider or import reviewed extraction JSON; verify fields before updating inventory.'}

@router.get('/documents')
def list_documents(db: Session=Depends(get_db)):
    return [{'id':x.id,'filename':x.filename,'asset_url':x.asset_url,'status':x.status,'created_at':x.created_at} for x in db.query(models.DocumentUpload).order_by(models.DocumentUpload.created_at.desc()).all()]

@router.post('/campaigns',status_code=201)
def create_campaign(payload: schemas.CampaignCreate, db: Session=Depends(get_db)):
    from ..campaign_art import build_campaign_svg
    campaign_id=f'CAM-{uuid.uuid4().hex[:8].upper()}'
    svg=build_campaign_svg(payload.headline,payload.body_text,payload.blood_group)
    asset_url=''
    status='GENERATED_LOCAL_SVG'
    if settings.cloudinary_configured:
        try:
            import cloudinary, cloudinary.uploader
            cloudinary.config(cloud_name=settings.cloudinary_cloud_name,api_key=settings.cloudinary_api_key,api_secret=settings.cloudinary_api_secret,secure=True)
            result=cloudinary.uploader.upload(svg.encode('utf-8'),folder=settings.cloudinary_upload_folder,public_id=campaign_id,resource_type='image',format='svg')
            asset_url=result.get('secure_url',''); status='GENERATED_AND_UPLOADED'
        except Exception as exc:
            raise HTTPException(502,f'Campaign created but Cloudinary upload failed: {type(exc).__name__}')
    item=models.Campaign(id=campaign_id,incident_id=payload.incident_id,blood_group=payload.blood_group,headline=payload.headline,
                         body_text=payload.body_text,asset_url=asset_url,format=payload.format,status=status)
    db.add(item); db.commit(); db.refresh(item)
    return {'id':item.id,'incident_id':item.incident_id,'blood_group':item.blood_group,'headline':item.headline,
            'body_text':item.body_text,'asset_url':item.asset_url,'format':item.format,'status':item.status,
            'svg_preview':svg if not asset_url else None,
            'notice':'Generated creative is a draft. Review clinical wording and contact details before publishing.'}

@router.get('/campaigns')
def list_campaigns(db: Session=Depends(get_db)):
    return [{'id':x.id,'incident_id':x.incident_id,'blood_group':x.blood_group,'headline':x.headline,'asset_url':x.asset_url,
             'format':x.format,'status':x.status,'created_at':x.created_at} for x in db.query(models.Campaign).order_by(models.Campaign.created_at.desc()).all()]
