from typing import List, Optional
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

# ==========================================
# レスポンスモデル定義
# ==========================================


class SessionResponse(BaseModel):
    session_id: str
    theme: str
    category: str
    status: str  # "in_progress" (思考中), "completed" (完了)
    created_at: str
    updated_at: str
    turn_count: int
    average_score: Optional[float] = None  # 思考中の場合はスコアが存在しないためOptional

# ==========================================
# エンドポイント
# ==========================================


@router.post("")
async def create_session() -> dict:
    """新規セッション作成"""
    return {"message": "stub: create_session"}


@router.get("", response_model=List[SessionResponse])
async def get_sessions() -> List[SessionResponse]:
    """
    S01・S04用: セッション一覧取得
    テストコードとS01の「最近のセッション」表示に合わせたモックデータを返却
    """
    return [
        SessionResponse(
            session_id="sess_001",
            theme="あの報連相はなぜうまくいかなかったか",
            category="コミュニケーション",
            status="in_progress",
            created_at="2026-03-25T10:00:00",
            updated_at="2026-03-25T10:15:00",
            turn_count=2,
            average_score=None
        ),
        SessionResponse(
            session_id="sess_002",
            theme="自分が得意な技術領域はどこか",
            category="技術・スキル",
            status="completed",
            created_at="2026-03-24T15:00:00",
            updated_at="2026-03-24T15:30:00",
            turn_count=5,
            average_score=0.72
        )
    ]


@router.get("/{session_id}")
async def get_session(session_id: str) -> dict:
    """特定セッションの詳細取得"""
    return {"message": f"stub: get_session {session_id}"}


@router.patch("/{session_id}")
async def update_session(session_id: str) -> dict:
    """セッションのステータス更新（途中離脱等）"""
    return {"message": f"stub: update_session {session_id}"}


@router.delete("/{session_id}")
async def delete_session(session_id: str) -> dict:
    """セッション削除"""
    return {"message": f"stub: delete_session {session_id}"}


@router.post("/{session_id}/turns")
async def create_turn(session_id: str) -> dict:
    """ユーザー入力を送信し、採点・問い生成を実行"""
    return {"message": f"stub: create_turn {session_id}"}


@router.get("/{session_id}/turns")
async def get_turns(session_id: str) -> dict:
    """セッション内の全ターン取得"""
    return {"message": f"stub: get_turns {session_id}"}


@router.get("/{session_id}/result")
async def get_result(session_id: str) -> dict:
    """セッション完了後の論理マップを取得"""
    return {
        "session_id": session_id,
        "logic_map": None,
        "status": "generating",
    }
