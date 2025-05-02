from fastapi import APIRouter
from typing import List, Optional
from . import schemas

router = APIRouter(prefix="/caregiver/learn", tags=["caregiver-learn"])

# Example static tips; in a real app, these could come from a database
EDUCATIONAL_TIPS = [
    {"title": "Encourage Routine", "text": "Establishing a daily routine helps memory retention.", "source_url": "https://alz.org/routine-tips"},
    {"title": "Use Visual Aids", "text": "Visual reminders can help with remembering tasks.", "source_url": None},
    {"title": "Stay Positive", "text": "Positive reinforcement boosts confidence and motivation.", "source_url": "https://caregiver.org/positive-reinforcement"}
]

@router.get("/tips/", response_model=List[schemas.Tip])
def get_educational_tips():
    return EDUCATIONAL_TIPS