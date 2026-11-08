
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from .config import settings


def normalize_database_url(url: str) -> str:
    if not url:
        raise RuntimeError(
            "DATABASE_URL is missing. Configure your Neon connection "
            "string in Backend/.env"
        )

    if url.startswith("postgres://"):
        url = url.replace(
            "postgres://",
            "postgresql+psycopg://",
            1,
        )

    elif url.startswith("postgresql://"):
        url = url.replace(
            "postgresql://",
            "postgresql+psycopg://",
            1,
        )

    return url


DATABASE_URL = normalize_database_url(settings.database_url)

connect_args = {}

if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=5,
)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()
