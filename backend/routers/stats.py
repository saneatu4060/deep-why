from fastapi import APIRouter

router = APIRouter()


@router.get("/summary")
async def get_summary():
    return {"message": "stub: get_summary"}


@router.get("/score-history")
async def get_score_history():
    return {"message": "stub: get_score_history"}


@router.get("/category-distribution")
async def get_category_distribution():
    return {"message": "stub: get_category_distribution"}
