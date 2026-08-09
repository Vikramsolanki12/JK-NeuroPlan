from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional, Dict
import json

from app.services.deepseek_ai import generate_ai_insights

router = APIRouter()


class Task(BaseModel):
    text: Optional[str] = None
    subject: Optional[str] = None
    done: bool = False
    date: Optional[str] = None


class Timetable(BaseModel):
    daily: Optional[List[Dict]] = []
    weekly: Optional[Dict] = {}
    monthly: Optional[List[Dict]] = []


class AnalyticsRequest(BaseModel):
    tasks: List[Task]
    timetable: Optional[Timetable] = None


@router.post("/analytics")
async def get_analysis(data: AnalyticsRequest):

    tasks = [task.dict() for task in data.tasks]

    timetable = {}
    if data.timetable:
        timetable = data.timetable.dict()

    ai_response = generate_ai_insights(tasks, timetable)

    try:
        result = json.loads(ai_response)
    except:
        return {"insights": ai_response}

    return result