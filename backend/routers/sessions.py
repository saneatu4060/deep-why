from typing import List, Optional
from fastapi import APIRouter
from pydantic import BaseModel
from fastapi import HTTPException

router = APIRouter()


class SessionResponse(BaseModel):
    session_id: str
    theme: str
    category: str
    status: str
    created_at: str
    updated_at: str
    turn_count: int
    average_score: Optional[float] = None


class SessionUpdateRequest(BaseModel):
    status: str


class TurnRequest(BaseModel):
    user_utterance: str


class TurnScores(BaseModel):
    concreteness: float
    causality: float
    definitiveness: float


class TurnResponse(BaseModel):
    turn_id: str
    scores: TurnScores
    reason: str
    ai_question: Optional[str] = None
    is_completed: bool
    claim: Optional[str] = None


@router.post("")
async def create_session() -> dict:
    return {"message": "stub: create_session"}


@router.get("", response_model=List[SessionResponse])
async def get_sessions() -> List[SessionResponse]:
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


@router.get("/{session_id}", response_model=SessionResponse)
async def get_session(session_id: str) -> SessionResponse:
    # モックデータから該当するセッションを検索
    mock_sessions = [
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

    for session in mock_sessions:
        if session.session_id == session_id:
            return session

    # 見つからない場合は 404 エラー
    raise HTTPException(status_code=404, detail="Session not found")


@router.patch("/{session_id}")
async def update_session(session_id: str, payload: SessionUpdateRequest) -> dict:
    """S02: 途中離脱時に status='abandoned' に更新するスタブ"""
    return {"message": f"Session {session_id} updated", "status": payload.status}


@router.post("/{session_id}/turns", response_model=TurnResponse)
async def create_turn(session_id: str, payload: TurnRequest) -> TurnResponse:
    """S02: ユーザーの入力（user_utterance）を受け取り、採点結果と問いを返すスタブ"""

    # モック動作: 「完了」という文字が含まれていたら終了時のレスポンスを返す
    if "完了" in payload.user_utterance:
        return TurnResponse(
            turn_id="turn_003",
            scores=TurnScores(concreteness=0.8, causality=0.9, definitiveness=0.8),
            reason="全指標が閾値を超えました。",
            ai_question=None,
            is_completed=True,
            claim="私には要件を適切に分解し構造化する強みがある。"
        )

    # 継続時のレスポンス
    return TurnResponse(
        turn_id="turn_new",
        scores=TurnScores(concreteness=0.4, causality=0.6, definitiveness=0.5),
        reason="具体的な状況が語られていません。",
        ai_question="その時、具体的に誰にどのような言葉で伝えましたか？",
        is_completed=False,
        claim=None
    )


@router.get("/{session_id}/turns", response_model=List[dict])
async def get_turns(session_id: str) -> List[dict]:
    """S02: 過去のターン一覧を取得するスタブ（再開時用）"""
    return [
        {
            "turn_id": "turn_001",
            "user_utterance": "報連相のタイミングが遅れた。",
            "ai_question": "なぜタイミングが遅れたと感じたのですか？",
            "scores": {"concreteness": 0.3, "causality": 0.4, "definitiveness": 0.5}
        }
    ]


@router.get("/{session_id}/result")
async def get_result(session_id: str) -> dict:
    return {
        "session_id": session_id,
        "logic_map": None,
        "status": "generating",
    }
