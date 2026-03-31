#!/bin/bash

# =================================================================
# Deep Why 起動スクリプト (start.sh)
# 開発ルール v1.3 / 内部設計書 v3.2 準拠
# =================================================================

# 色の定義
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}>>> Deep Why 起動プロセスを開始します...${NC}"

# 1. Ollama の接続確認
if ! curl -s http://localhost:11434/api/tags > /dev/null; then
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e " ⚠️  エラー: Ollama が起動していません。"
    echo -e " 別ターミナルで 'ollama serve' を実行してから再試行してください。"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Ollama (localhost:11434) への接続を確認しました。${NC}"

# 2. ディレクトリ・ファイル管理
mkdir -p data/config
mkdir -p data/chroma_db

FEW_SHOT_PATH="data/config/few_shots.json"
EXAMPLE_PATH="01_backend/llm/few_shots_example.json"

if [ ! -f "$FEW_SHOT_PATH" ]; then
    if [ -f "$EXAMPLE_PATH" ]; then
        cp "$EXAMPLE_PATH" "$FEW_SHOT_PATH"
        echo -e "${GREEN}✅ Few-shotサンプルを $FEW_SHOT_PATH に作成しました。${NC}"
    else
        echo "[]" > "$FEW_SHOT_PATH"
    fi
fi

# 3. バックエンド (FastAPI) の起動
# 修正：フォルダ名を 01_backend に変更 
cd 01_backend
# 仮想環境の有効化：Windowsのパス構造に対応 
source .venv/Scripts/activate 2>/dev/null || source .venv/bin/activate 2>/dev/null

echo -e "${GREEN}🚀 バックエンドを起動しています (localhost:8000)...${NC}"
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

# 4. フロントエンド (React) の起動
# 修正：フォルダ名を 02_frontend に変更 
cd 02_frontend

# Ctrl+C でバックエンドも停止させる
trap "echo -e '${RED}🛑 サーバーを停止しています...${NC}'; kill $BACKEND_PID; exit" SIGINT SIGTERM

echo -e "${GREEN}🚀 フロントエンドを起動しています (npm run dev)...${NC}"
npm run dev