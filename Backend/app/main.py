from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import Base, engine, SessionLocal
from .seed import seed_demo_data
from .routers import core, requests, donors, media, integrations

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_demo_data(db)
    yield

app=FastAPI(title=settings.app_name,version='1.0.0',description='RaktSaathi demo API. Forecasts and sample records are explicitly synthetic.',lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(core.router,prefix='/api/v1')
app.include_router(requests.router,prefix='/api/v1')
app.include_router(donors.router,prefix='/api/v1')
app.include_router(media.router,prefix='/api/v1')
app.include_router(integrations.router,prefix='/api/v1')

@app.get('/')
def root(): return {'service':'RaktSaathi API','docs':'/docs','api_prefix':'/api/v1'}
