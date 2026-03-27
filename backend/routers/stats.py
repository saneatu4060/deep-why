from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class StatsSummaryResponse(BaseModel):
    average_score: float
    most_improved_metric: str
    consecutive_days: int


@router.get("/summary", response_model=StatsSummaryResponse)
async def get_summary() -> StatsSummaryResponse:
    return StatsSummaryResponse(
        average_score=0.65,
        most_improved_metric="具体性",
        consecutive_days=3
    )


@router.get("/score-history")
async def get_score_history() -> dict:
    return {"message": "stub: get_score_history"}


@router.get("/category-distribution")
async def get_category_distribution() -> dict:
    return {"message": "stub: get_category_distribution"}
