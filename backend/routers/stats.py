from fastapi import APIRouter
from pydantic import BaseModel

# 将来的には DB操作ロジックを分離するため、以下のようにサービス層をインポートします
# from services import stats_service

router = APIRouter()

# ==========================================
# レスポンスモデル定義
# (※将来的には models/schemas.py 等に切り出すことを推奨します)
# ==========================================


class StatsSummaryResponse(BaseModel):
    average_score: float
    most_improved_metric: str
    consecutive_days: int


# ==========================================
# エンドポイント
# ==========================================
@router.get("/summary", response_model=StatsSummaryResponse)
async def get_summary():
    """
    S01・S04用: 成長ステータスサマリー取得
    直近5セッションの平均スコア・最も伸びた指標・連続セッション日数を返す
    """
    # TODO: サービス層（stats_service.py等）を作成し、SQLiteから実際のデータを計算するロジックを実装する。
    # 現在はS01のフロントエンド開発・結合テストを進めるためのモックデータを返却します。
    return StatsSummaryResponse(
        average_score=0.65,
        most_improved_metric="具体性",
        consecutive_days=3
    )


@router.get("/score-history")
async def get_score_history():
    """S04グラフ用: 長期スコア推移取得"""
    return {"message": "stub: get_score_history"}


@router.get("/category-distribution")
async def get_category_distribution():
    """S04グラフ用: テーマカテゴリ分布取得"""
    return {"message": "stub: get_category_distribution"}
