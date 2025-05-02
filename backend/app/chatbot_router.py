from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from . import models
from .database import get_db

router = APIRouter(prefix="/chatbot", tags=["chatbot"])

@router.post("/query/")
def query_faq(keyword: str, db: Session = Depends(get_db)):
    answer = db.query(FaqAnswer).filter(FaqAnswer.keyword == keyword.lower()).first()
    if answer:
        return {"response": answer.response_text}
    return {"response": "I'm sorry, I don't know that yet."}