from typing import List, Optional
from fastapi import APIRouter
from pydantic import BaseModel

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
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="Session not found")


@router.patch("/{session_id}")
async def update_session(session_id: str) -> dict:
    return {"message": f"stub: update_session {session_id}"}


@router.delete("/{session_id}")
async def delete_session(session_id: str) -> dict:
    return {"message": f"stub: delete_session {session_id}"}


@router.post("/{session_id}/turns")
async def create_turn(session_id: str) -> dict:
    return {"message": f"stub: create_turn {session_id}"}


@router.get("/{session_id}/turns")
async def get_turns(session_id: str) -> dict:
    return {"message": f"stub: get_turns {session_id}"}


@router.get("/{session_id}/result")
async def get_result(session_id: str) -> dict:
    return {
        "session_id": session_id,
        "logic_map": None,
        "status": "generating",
    }
