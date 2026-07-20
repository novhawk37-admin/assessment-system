import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.database import Base, engine
from app.routers import auth, tasks, assessments, users, dashboard

load_dotenv()

# Create tables if they don't exist yet
Base.metadata.create_all(bind=engine)

app = FastAPI(title="NovHawk API", version="1.0.0")

origins = [
    "http://localhost:5173",
    "https://novhawk-assessment.vercel.app",  # if deployed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(assessments.router)
app.include_router(users.router)
app.include_router(dashboard.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
