from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Dict, Any
from . import models, schemas
from .database import get_db

router = APIRouter(prefix="/caregiver/progress", tags=["caregiver-progress"])

@router.get("/summary/{patient_id}")
def get_progress_summary(patient_id: int, db: Session = Depends(get_db)) -> Dict[str, Any]:
    now = datetime.utcnow()
    week_ago = now - timedelta(days=7)

    # Games completed and average score
    games = db.query(models.Game).filter(models.Game.user_id == patient_id, models.Game.timestamp >= week_ago).all()
    games_completed = len(games)
    avg_game_score = round(sum(g.score for g in games) / games_completed, 2) if games_completed > 0 else 0

    # Missed calendar events (events in the past week, not completed)
    events = db.query(models.Event).filter(models.Event.user_id == patient_id, models.Event.event_datetime >= week_ago, models.Event.event_datetime <= now).all()
    # For demo, assume all events are missed (no completion tracking in model)
    missed_events = len(events)

    # Friendly summary
    user = db.query(models.User).filter(models.User.id == patient_id).first()
    username = user.username if user else "the patient"
    summary = {
        "message": f"This week, {username} completed {games_completed} memory exercises! 👍",
        "games_completed": games_completed,
        "average_game_score": avg_game_score,
        "missed_events": missed_events
    }
    return summary