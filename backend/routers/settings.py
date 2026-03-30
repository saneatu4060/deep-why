from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class SettingsResponse(BaseModel):
    min_turns: int
    max_turns: int


class SettingsUpdateRequest(BaseModel):
    min_turns: int
    max_turns: int


@router.get("/settings", response_model=SettingsResponse)
async def get_settings() -> SettingsResponse:
    """S05: 現在の設定値を取得するスタブ"""
    return SettingsResponse(min_turns=3, max_turns=5)


@router.patch("/settings")
async def update_settings(payload: SettingsUpdateRequest) -> dict:
    """S05: 設定値を更新するスタブ"""
    return {"message": "Settings updated successfully"}


@router.get("/health/ollama")
async def check_ollama_health() -> dict:
    """S05: Ollamaの接続状態を確認するスタブ"""
    # フロントエンドでの接続成功テスト用に status: "ok" を返します
    return {"status": "ok"}


@router.delete("/data")
async def delete_all_data() -> dict:
    """S05: 全データを削除するスタブ"""
    return {"message": "All data deleted"}
