from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from . import crud, schemas, models
from .database import get_db
from typing import List
from datetime import datetime

from . import models, schemas, crud
from .database import engine, get_db
from .chatbot_router import router as chatbot_router
from .games_router import router as games_router
from .caregiver_learn_router import router as caregiver_learn_router
from .caregiver_progress_router import router as caregiver_progress_router

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="MemoryTrain API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to MemoryTrain API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# User endpoints
@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@app.get("/users/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

# Memory exercise endpoints
@app.get("/exercises/", response_model=list[schemas.Exercise])
def read_exercises(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    exercises = crud.get_exercises(db, skip=skip, limit=limit)
    return exercises

@app.get("/exercises/{exercise_id}", response_model=schemas.Exercise)
def read_exercise(exercise_id: int, db: Session = Depends(get_db)):
    db_exercise = crud.get_exercise(db, exercise_id=exercise_id)
    if db_exercise is None:
        raise HTTPException(status_code=404, detail="Exercise not found")
    return db_exercise

# User progress endpoints
@app.post("/users/{user_id}/progress/", response_model=schemas.Progress)
def create_user_progress(user_id: int, progress: schemas.ProgressCreate, db: Session = Depends(get_db)):
    return crud.create_user_progress(db=db, progress=progress, user_id=user_id)

@app.get("/users/{user_id}/progress/", response_model=list[schemas.Progress])
def read_user_progress(user_id: int, db: Session = Depends(get_db)):
    progress = crud.get_user_progress(db, user_id=user_id)
    return progress


calendar_router = APIRouter(prefix="/calendar", tags=["calendar"])

@calendar_router.post("/events/", response_model=schemas.Event)
def add_event(event: schemas.EventCreate, db: Session = Depends(get_db)):
    return crud.create_event(db, event)

@calendar_router.get("/events/{user_id}", response_model=List[schemas.Event])
def list_events(user_id: int, db: Session = Depends(get_db)):
    now = datetime.utcnow()
    return crud.get_events_for_user(db, user_id, now=now)

@calendar_router.delete("/events/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db)):
    success = crud.delete_event(db, event_id)
    if not success:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"ok": True}

app.include_router(calendar_router)
app.include_router(chatbot_router)
app.include_router(games_router)
app.include_router(caregiver_learn_router)
app.include_router(caregiver_progress_router)