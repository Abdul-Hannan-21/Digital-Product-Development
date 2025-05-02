from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from . import models, schemas
from .database import get_db
from datetime import datetime

router = APIRouter(prefix="/games", tags=["games"])

@router.get("/start/{game_type}", response_model=schemas.Game)
def start_game(game_type: str, user_id: int, db: Session = Depends(get_db)):
    # For demo: create a new game session with score 0
    game = models.Game(user_id=user_id, game_type=game_type, score=0)
    db.add(game)
    db.commit()
    db.refresh(game)
    return game

@router.post("/submit/", response_model=schemas.Game)
def submit_game_result(game: schemas.GameCreate, db: Session = Depends(get_db)):
    db_game = models.Game(**game.dict(), timestamp=datetime.utcnow())
    db.add(db_game)
    db.commit()
    db.refresh(db_game)
    return db_game