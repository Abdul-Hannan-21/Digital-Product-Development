from sqlalchemy.orm import Session
from passlib.context import CryptContext
from . import models, schemas
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# User operations
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = pwd_context.hash(user.password)
    db_user = models.User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Exercise operations
def get_exercise(db: Session, exercise_id: int):
    return db.query(models.Exercise).filter(models.Exercise.id == exercise_id).first()

def get_exercises(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Exercise).offset(skip).limit(limit).all()

def create_exercise(db: Session, exercise: schemas.ExerciseCreate):
    db_exercise = models.Exercise(**exercise.dict())
    db.add(db_exercise)
    db.commit()
    db.refresh(db_exercise)
    return db_exercise

# Progress operations
def get_user_progress(db: Session, user_id: int):
    return db.query(models.Progress).filter(models.Progress.user_id == user_id).all()

def create_user_progress(db: Session, progress: schemas.ProgressCreate, user_id: int):
    db_progress = models.Progress(**progress.dict(), user_id=user_id)
    db.add(db_progress)
    db.commit()
    db.refresh(db_progress)
    return db_progress

# Calendar/Event CRUD
from . import models, schemas


def create_event(db: Session, event: schemas.EventCreate) -> models.Event:
    db_event = models.Event(**event.dict())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event


def get_events_for_user(db: Session, user_id: int, now: Optional[datetime] = None) -> List[models.Event]:
    query = db.query(models.Event).filter(models.Event.user_id == user_id)
    if now:
        query = query.filter(models.Event.event_datetime >= now)
    return query.order_by(models.Event.event_datetime.asc()).all()


def delete_event(db: Session, event_id: int) -> bool:
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if event:
        db.delete(event)
        db.commit()
        return True
    return False