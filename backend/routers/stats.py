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
async def get_score_history() -> list[dict]:
    """S04: 長期スコア推移を取得するスタブ（グラフ描画用）"""
    return [
        {"session_id": "sess_001", "average_score": 0.45, "concreteness": 0.40, "causality": 0.45, "definitiveness": 0.50},
        {"session_id": "sess_002", "average_score": 0.52, "concreteness": 0.48, "causality": 0.55, "definitiveness": 0.53},
        {"session_id": "sess_003", "average_score": 0.58, "concreteness": 0.55, "causality": 0.60, "definitiveness": 0.59},
        {"session_id": "sess_004", "average_score": 0.65, "concreteness": 0.62, "causality": 0.68, "definitiveness": 0.65},
        {"session_id": "sess_005", "average_score": 0.72, "concreteness": 0.75, "causality": 0.70, "definitiveness": 0.71},
    ]


@router.get("/category-distribution")
async def get_category_distribution() -> list[dict]:
    """S04: テーマカテゴリ分布を取得するスタブ（グラフ描画用）"""
    return [
        {"category": "技術・スキル", "count": 8},
        {"category": "タスク・業務", "count": 5},
        {"category": "コミュニケーション", "count": 3},
        {"category": "キャリア・強み", "count": 2},
        {"category": "価値観", "count": 1},
        {"category": "自由入力", "count": 1},
    ]
