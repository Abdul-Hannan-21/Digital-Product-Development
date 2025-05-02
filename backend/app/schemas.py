from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

# Exercise schemas
class ExerciseBase(BaseModel):
    title: str
    description: str
    difficulty: int
    category: str
    content: str

class ExerciseCreate(ExerciseBase):
    pass

class Exercise(ExerciseBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

# Progress schemas
class ProgressBase(BaseModel):
    exercise_id: int
    score: float
    completion_time: int

class ProgressCreate(ProgressBase):
    pass

class Progress(ProgressBase):
    id: int
    user_id: int
    completed_at: datetime

    class Config:
        orm_mode = True

# Calendar schemas
class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    event_datetime: datetime

class EventCreate(EventBase):
    user_id: int

class Event(EventBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True

class GameBase(BaseModel):
    user_id: int
    game_type: str
    score: float

class GameCreate(GameBase):
    pass

class Game(GameBase):
    id: int
    timestamp: datetime

    class Config:
        orm_mode = True

class Tip(BaseModel):
    title: str
    text: str
    source_url: Optional[str] = None