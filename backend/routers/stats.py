from fastapi import APIRouter
<<<<<<< HEAD
<<<<<<< HEAD
=======
from pydantic import BaseModel

router = APIRouter()

# 将来的には DB操作ロジックを分離するため、以下のようにサービス層をインポートします
# from services import stats_service
>>>>>>> 9800d04 (feat(backend): S01画面用のAPIスタブとモックデータを実装)
=======
from pydantic import BaseModel
>>>>>>> 9800d046eea40da01880dd795ad5c647220cf39d

router = APIRouter()

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
<<<<<<< HEAD
<<<<<<< HEAD
async def get_score_history():
=======
async def get_score_history() -> dict:
    """S04グラフ用: 長期スコア推移取得（今回はスタブのみ）"""
>>>>>>> 9800d04 (feat(backend): S01画面用のAPIスタブとモックデータを実装)
=======
async def get_score_history() -> dict:
    """S04グラフ用: 長期スコア推移取得（今回はスタブのみ）"""
>>>>>>> 9800d046eea40da01880dd795ad5c647220cf39d
    return {"message": "stub: get_score_history"}


@router.get("/category-distribution")
<<<<<<< HEAD
<<<<<<< HEAD
async def get_category_distribution():
=======
async def get_category_distribution() -> dict:
    """S04グラフ用: テーマカテゴリ分布取得（今回はスタブのみ）"""
>>>>>>> 9800d04 (feat(backend): S01画面用のAPIスタブとモックデータを実装)
=======
async def get_category_distribution() -> dict:
    """S04グラフ用: テーマカテゴリ分布取得（今回はスタブのみ）"""
>>>>>>> 9800d046eea40da01880dd795ad5c647220cf39d
    return {"message": "stub: get_category_distribution"}
