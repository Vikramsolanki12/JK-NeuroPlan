from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.analytics import router as analytics_router
from app.routes.schedule import router as schedule_router
from app.routes.recommendations import router as recommendations_router

app = FastAPI()

# Allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analytics_router)
app.include_router(schedule_router)
app.include_router(recommendations_router)