from fastapi import APIRouter

router = APIRouter()


@router.post("")
async def create_session():
    return {"message": "stub: create_session"}


@router.get("")
async def get_sessions():
    return {"message": "stub: get_sessions"}


@router.get("/{session_id}")
async def get_session(session_id: str):
    return {"message": f"stub: get_session {session_id}"}


@router.patch("/{session_id}")
async def update_session(session_id: str):
    return {"message": f"stub: update_session {session_id}"}


@router.delete("/{session_id}")
async def delete_session(session_id: str):
    return {"message": f"stub: delete_session {session_id}"}


@router.post("/{session_id}/turns")
async def create_turn(session_id: str):
    return {"message": f"stub: create_turn {session_id}"}


@router.get("/{session_id}/turns")
async def get_turns(session_id: str):
    return {"message": f"stub: get_turns {session_id}"}


@router.get("/{session_id}/result")
async def get_result(session_id: str):
    return {
        "session_id": session_id,
        "logic_map": None,
        "status": "generating",
    }
