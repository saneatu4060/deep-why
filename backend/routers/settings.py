from fastapi import APIRouter

router = APIRouter()


@router.get("/settings")
async def get_settings():
    return {"message": "stub: get_settings"}


@router.patch("/settings")
async def update_settings():
    return {"message": "stub: update_settings"}


@router.get("/health/ollama")
async def check_ollama():
    return {"message": "stub: check_ollama"}


@router.delete("/data")
async def delete_all_data():
    return {"message": "stub: delete_all_data"}
