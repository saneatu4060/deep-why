import chromadb
from chromadb.config import Settings
from config import CHROMA_PATH, CHROMA_COLLECTION


def get_chroma_client() -> chromadb.ClientAPI:
    """ChromaDBクライアントを返す"""
    return chromadb.PersistentClient(
        path=CHROMA_PATH,
        settings=Settings(anonymized_telemetry=False),
    )


def get_collection() -> chromadb.Collection:
    """user_thoughtsコレクションを返す（存在しない場合は作成）"""
    client = get_chroma_client()
    return client.get_or_create_collection(
        name=CHROMA_COLLECTION,
        metadata={"hnsw:space": "cosine"},
    )
