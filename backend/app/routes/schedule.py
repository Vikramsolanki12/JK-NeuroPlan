from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

from app.services.scheduler import generate_schedule

router = APIRouter()


class ScheduleRequest(BaseModel):
    subjects: List[str]
    hours_per_day: int
    weaknesses: List[str] = []


@router.post("/schedule")
def create_schedule(data: ScheduleRequest):

    result = generate_schedule(
        subjects=data.subjects,
        hours_per_day=data.hours_per_day,
        weaknesses=data.weaknesses
    )

    return {
        "schedule": result
    }
