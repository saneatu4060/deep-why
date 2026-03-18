# Deep Why

> エンジニアが業務でぶつかったモヤモヤを、「なぜ？」の問いで言語化し、思考の解像度を上げるトレーニングツール。

---

## なぜ Deep Why を作ったか

もともと自分自身の課題から生まれたツールです。

頭の中にはアイデアや感覚があるのに、いざ言葉にしようとすると思考が発散してまとまらない。論理的に話そうとしても構成が作れない。タスクを分解しようとしても何から手をつければいいかわからない——そんな状態が続いていました。

エンジニアとして「自分の強みが何か」「どこへ向かいたいのか」を言葉にしたくても、考えが散らばってしまって1つの結論にたどり着けない。その経験が出発点です。

「なぜ？」という問いを繰り返すことで、発散した思考を1本の線に絞り込める仕組みが作れないか——それが Deep Why の発想です。

---

## 特徴

- **完全ローカル動作**：思考データを外部に送信しません
- **3指標でスコアリング**：具体性・因果性・定義度をリアルタイムで可視化
- **不便益の設計**：あえて差し戻しや回数制限を課すことで思考体力を養成
- **成長の可視化**：セッションを重ねるごとにスコア推移とカテゴリ分布で成長を確認
- **エンジニア特化のテーマ**：技術・タスク・コミュニケーション・キャリア・価値観の5カテゴリ

---

## スクリーンショット

> 準備中

---

## 技術スタック

| コンポーネント | 採用技術 |
|:--|:--|
| フロントエンド | React + Tailwind CSS |
| バックエンド | FastAPI（Python） |
| LLM | Qwen2.5-7B（Ollama経由） |
| エージェント制御 | LangChain |
| DB | SQLite / ChromaDB |
| 論理マップ出力 | Mermaid |

---

## セットアップ

### 必要な環境

- Python 3.11 以上
- Node.js 20 以上
- [Ollama](https://ollama.com) インストール済み

### 手順

```bash
# 1. リポジトリをクローン
git clone https://github.com/YOUR_USERNAME/deep-why.git
cd deep-why

# 2. Ollamaでモデルを取得
ollama pull qwen2.5:7b

# 3. バックエンドの依存関係をインストール
cd backend
python -m venv .venv
source .venv/bin/activate  # Windowsは .venv\Scripts\activate
pip install -r requirements.txt
cd ..

# 4. フロントエンドの依存関係をインストール
cd frontend
npm install
cd ..

# 5. 起動
./start.sh
```

### 起動後のアクセス先

| サービス | URL |
|:--|:--|
| アプリ（フロントエンド） | http://localhost:3000 |
| API（バックエンド） | http://localhost:8000 |
| APIドキュメント（Swagger） | http://localhost:8000/docs |

---

## ドキュメント

| ドキュメント | 内容 |
|:--|:--|
| [要件定義書](docs/01_requirements.md) | システムの目的・機能要件・技術スタック |
| [外部設計書](docs/02_external_design.md) | 画面設計・画面遷移・API定義 |
| [内部設計書](docs/03_internal_design.md) | アーキテクチャ・処理フロー・DB設計 |

---

## 開発者向け

```bash
# バックエンドのテスト実行
cd backend
pytest

# フロントエンドのテスト実行
cd frontend
npm run test

# Lint
cd backend && ruff check .
cd frontend && npm run lint
```

開発ルール・ブランチ戦略・コミット規約については [開発ルール](docs/04_dev_rules.md) を参照してください。

---

## ライセンス

Apache 2.0（使用モデル Qwen2.5-7B のライセンスに準拠）

---

## 注意事項

- `data/` ディレクトリには思考データが保存されます。**絶対にGitにコミットしないでください**（`.gitignore` で除外済み）
- 推論速度はCPUモードで1ターンあたり20〜60秒かかります。これは仕様です