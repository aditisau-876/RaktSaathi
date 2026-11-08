from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import SessionLocal
from .seed import seed_demo_data
from . import models
from .routers import core, requests, donors, media, integrations, inventory_management

@asynccontextmanager
async def lifespan(app: FastAPI):
    with SessionLocal() as db:
        seed_demo_data(db)
    yield

app=FastAPI(title=settings.app_name,version='1.0.0',description='RaktSaathi demo API. Forecasts and sample records are explicitly synthetic.',lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(core.router,prefix='/api/v1')
app.include_router(requests.router,prefix='/api/v1')
app.include_router(donors.router,prefix='/api/v1')
app.include_router(media.router,prefix='/api/v1')
app.include_router(integrations.router,prefix='/api/v1')
app.include_router(inventory_management.router, prefix="/api/v1")

@app.get('/')
def root(): return {'service':'RaktSaathi API','docs':'/docs','api_prefix':'/api/v1'}
