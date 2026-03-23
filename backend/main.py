from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import sessions, stats, settings
from db.sqlite import init_db

app = FastAPI(
    title="Deep Why API",
    description="エンジニア向け論理思考トレーニングシステム Deep Why のバックエンドAPI",
    version="0.1.0",
)

# CORSの設定（フロントエンドのlocalhost:3000からのアクセスを許可）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーターの登録
app.include_router(sessions.router, prefix="/sessions", tags=["sessions"])
app.include_router(stats.router, prefix="/stats", tags=["stats"])
app.include_router(settings.router, tags=["settings"])


@app.on_event("startup")
async def startup_event():
    """アプリ起動時にDBを初期化する"""
    await init_db()


@app.get("/")
async def root():
    return {"message": "Deep Why API is running"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
