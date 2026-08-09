from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict

from app.services.predictor import analyze_study_data

router = APIRouter()

class Task(BaseModel):
    text: str
    done: bool
    subject: str | None = None


class Timetable(BaseModel):
    daily: List[Dict] = []
    weekly: Dict = {}
    monthly: List[Dict] = []


class RecommendationRequest(BaseModel):
    tasks: List[Task]
    timetable: Timetable


@router.post("/recommendations")
def get_recommendations(data: RecommendationRequest):

    tasks = [task.dict() for task in data.tasks]
    timetable = data.timetable.dict()

    result = analyze_study_data(tasks, timetable)

    return {
        "strengths": result["strengths"],
        "weaknesses": result["weaknesses"],
        "topics_to_improve": result["topics_to_improve"],
        "study_plan": result["study_plan"],
        "insights": result["insights"]
    }
