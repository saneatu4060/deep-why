from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_get_summary():
    """S01: 成長ステータス取得APIのテスト"""
    response = client.get("/stats/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["average_score"] == 0.65
    assert data["most_improved_metric"] == "具体性"
    assert data["consecutive_days"] == 3


def test_get_sessions():
    """S01: 過去セッション一覧取得APIのテスト"""
    response = client.get("/sessions")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 2
    assert data[0]["session_id"] == "sess_001"
