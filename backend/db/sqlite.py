import os
import aiosqlite
from config import SQLITE_PATH


async def get_db() -> aiosqlite.Connection:
    """DB接続を返す"""
    os.makedirs(os.path.dirname(SQLITE_PATH), exist_ok=True)
    return await aiosqlite.connect(SQLITE_PATH)


async def init_db() -> None:
    """テーブルを初期化する（存在しない場合のみ作成）"""
    os.makedirs(os.path.dirname(SQLITE_PATH), exist_ok=True)
    async with aiosqlite.connect(SQLITE_PATH) as db:
        await db.executescript("""
            CREATE TABLE IF NOT EXISTS sessions (
                id                TEXT PRIMARY KEY,
                started_at        DATETIME,
                ended_at          DATETIME,
                status            TEXT,
                topic             TEXT,
                category          TEXT,
                threshold         REAL,
                avg_final_score   REAL
            );

            CREATE TABLE IF NOT EXISTS turns (
                id                      INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id              TEXT REFERENCES sessions(id),
                turn_number             INTEGER,
                user_input              TEXT,
                score_concreteness      REAL,
                score_causality         REAL,
                score_definitiveness    REAL,
                score_reason            TEXT,
                question_type           TEXT,
                ai_question             TEXT,
                created_at              DATETIME
            );

            CREATE TABLE IF NOT EXISTS thought_patterns (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                pattern_type  TEXT,
                keyword       TEXT,
                category      TEXT,
                frequency     INTEGER DEFAULT 1,
                last_seen     DATETIME
            );

            CREATE TABLE IF NOT EXISTS threshold_history (
                id             INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id     TEXT REFERENCES sessions(id),
                threshold_used REAL,
                avg_score      REAL,
                next_threshold REAL,
                created_at     DATETIME
            );
        """)
        await db.commit()
