import os
from dotenv import load_dotenv

load_dotenv()

# Ollama
OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL: str = "qwen2.5:7b"

# SQLite
SQLITE_PATH: str = os.getenv("SQLITE_PATH", "./data/deep_why.db")

# ChromaDB
CHROMA_PATH: str = os.getenv("CHROMA_PATH", "./data/chroma_db")
CHROMA_COLLECTION: str = "user_thoughts"

# Few-shot
FEW_SHOTS_PATH: str = os.getenv("FEW_SHOTS_PATH", "./data/config/few_shots.json")

# セッション設定
INITIAL_THRESHOLD: float = 0.50
ADJUSTMENT_RATE: float = 0.05
MAX_THRESHOLD: float = 0.85
MIN_THRESHOLD: float = 0.40
DEFAULT_MIN_TURNS: int = 3
DEFAULT_MAX_TURNS: int = 5

# ChromaDB類似度閾値
CHROMA_SIMILARITY_THRESHOLD: float = 0.70
