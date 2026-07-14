import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://novhawk_user:g5TUMficxI0C8QaHIyrGPvLr3v6pGGwJ@dpg-d9b6lsgqmsqc73ee9nq0-a/novhawk",
)

engine = create_engine(
    DATABASE_URL,
    connect_args={
        "options": "-csearch_path=novhawk_assessment"
    },
    echo=True,  
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
