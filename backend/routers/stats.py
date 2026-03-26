from fastapi import APIRouter
<<<<<<< HEAD
=======
from pydantic import BaseModel

router = APIRouter()

# 将来的には DB操作ロジックを分離するため、以下のようにサービス層をインポートします
# from services import stats_service
>>>>>>> 9800d04 (feat(backend): S01画面用のAPIスタブとモックデータを実装)

router = APIRouter()


@router.get("/summary")
async def get_summary():
    return {"message": "stub: get_summary"}


@router.get("/score-history")
<<<<<<< HEAD
async def get_score_history():
=======
async def get_score_history() -> dict:
    """S04グラフ用: 長期スコア推移取得（今回はスタブのみ）"""
>>>>>>> 9800d04 (feat(backend): S01画面用のAPIスタブとモックデータを実装)
    return {"message": "stub: get_score_history"}


@router.get("/category-distribution")
<<<<<<< HEAD
async def get_category_distribution():
=======
async def get_category_distribution() -> dict:
    """S04グラフ用: テーマカテゴリ分布取得（今回はスタブのみ）"""
>>>>>>> 9800d04 (feat(backend): S01画面用のAPIスタブとモックデータを実装)
    return {"message": "stub: get_category_distribution"}
