# 開発ルール：論理思考トレーニング『Deep Why』

**バージョン**: 1.3
**最終更新**: 2026-03-31

---

## 1. ブランチ戦略

### 採用方式：GitHub Flow

`main` と `feature/*` のみのシンプルな構成を採用する。本プロジェクトはプロンプト微調整・スコアリングロジックの試行錯誤が頻発する個人〜小規模チームの開発であるため、`develop` ブランチによる二重管理は同期コストに見合わない。

> **遅延導入の方針**：v1.0リリース後に必要であれば `develop` ブランチを導入する。

### ブランチ構成

```
main                    # 常にデプロイ可能な状態を保つ。直接pushは禁止
├── feature/xxx         # 機能開発
├── fix/xxx             # バグ修正
├── docs/xxx            # ドキュメント更新
├── refactor/xxx        # リファクタリング
└── test/xxx            # 動作確認・検証
```

### 運用ルール

| ブランチ | 役割 | push | マージ方法 |
|:--|:--|:--|:--|
| `main` | 常にデプロイ可能な安定版 | 禁止（PR経由のみ） | `feature/*` 等からのPR |
| `feature/*` | 機能開発 | 自由 | PRで `main` へ |
| `fix/*` | バグ修正 | 自由 | PRで `main` へ |
| `docs/*` | ドキュメント更新 | 自由 | PRで `main` へ |
| `refactor/*` | リファクタリング | 自由 | PRで `main` へ |
| `test/*` | 動作確認・検証 | 自由 | PRで `main` へ |

### ブランチ命名規則

```bash
# feature: 機能名をケバブケースで
feature/s01-home-screen
feature/scoring-api
feature/ollama-health-check

# fix: 修正内容を簡潔に
fix/json-parse-error
fix/score-bar-animation

# docs: 対象ドキュメントを明記
docs/update-api-spec
docs/add-setup-guide

# refactor: 対象モジュールを明記
refactor/langchain-agent

# test: 確認・検証内容を明記
test/cors-check
test/scoring-accuracy
```

---

## 2. コミットメッセージ規約

[Conventional Commits](https://www.conventionalcommits.org/) に準拠する。

### フォーマット

```
<type>(<scope>): <subject>

[body]  ← 任意。変更の背景・理由を記述

[footer]  ← 任意。Breaking changeやIssue参照
```

### typeの一覧

| type | 用途 |
|:--|:--|
| `feat` | 新機能の追加 |
| `fix` | バグ修正 |
| `docs` | ドキュメントのみの変更 |
| `style` | コードの意味に影響しない変更（フォーマット等） |
| `refactor` | バグ修正・機能追加を伴わないコード変更 |
| `test` | テストコードの追加・修正、および動作確認・検証作業 |
| `chore` | ビルドプロセスや補助ツールの変更 |
| `perf` | パフォーマンス改善 |

### scopeの一覧

物理レイヤー（実装場所）とドメイン層（意味・機能）の2種類を共存させる。どちらを使うかはコミットの性質に応じて判断する。

**物理レイヤー**

| scope | 対象 |
|:--|:--|
| `frontend` | Reactコンポーネント全般 |
| `backend` | FastAPI全般 |
| `db` | SQLite・ChromaDB |
| `config` | 設定ファイル |
| `docs` | ドキュメント |

**ドメイン層**（Deep Why固有の意味・機能に関わる変更に使用）

| scope | 対象 |
|:--|:--|
| `scoring` | 3指標の採点ロジック・採点プロンプト |
| `questioning` | 問いタイプ選択・問い生成ロジック |
| `ux` | 不便益設計に関わるUI/UX（差し戻し・待機表示等） |

### コミットメッセージ例

```bash
# 物理レイヤーのscope
feat(backend): POST /sessions エンドポイントを追加
fix(frontend): スコアバーのアニメーションが止まらない問題を修正
docs(docs): 外部設計書にAPI定義を追記
test(frontend): フロントエンド・バックエンドの疎通確認（CORS）

# ドメイン層のscope
feat(scoring): 採点プロンプトにFew-shotサンプルを追加
fix(scoring): JSONパースエラー時のリトライ処理を実装
feat(questioning): 過去ログ参照タイプの発動条件を調整
fix(ux): 差し戻し時の採点理由表示が空になる問題を修正

# 悪い例
修正した                # 何を修正したかわからない
fix                    # scopeとsubjectがない
WIP                    # 作業中のコミットをそのままpushしない
```

### 日本語・英語について

- コミットメッセージは**英語を推奨**するが日本語も可
- チーム内で統一することを優先する
- `subject` は**命令形**で書く（"Add" / "Fix" / "追加する" 等）

---

## 3. コーディング規約

### 共通

- 文字コードは **UTF-8**
- 改行コードは **LF**
- ファイル末尾には必ず改行を入れる
- マジックナンバーは定数として定義する

> インデントはバックエンド・フロントエンドで異なる（後述）。

### バックエンド（Python / FastAPI）

**インデント**：**スペース4文字**（PEP 8標準。blackのデフォルトに合わせる）

**依存管理**：現フェーズは `pip` + `requirements.txt` で運用する。将来的に `uv` + `pyproject.toml` への移行を予定している。

```bash
# 現フェーズ（pip）
pip install -r requirements.txt

# 将来（uv移行後）
uv sync
```

**スタイル**
- [PEP 8](https://peps.python.org/pep-0008/) に準拠
- フォーマッターは `black`、リンターは `ruff` を使用
- 型ヒントを必ず付ける

```python
# 良い例
def calc_avg_score(scores: dict[str, float]) -> float:
    return sum(scores.values()) / len(scores)

# 悪い例
def calc_avg_score(scores):
    return sum(scores.values()) / len(scores)
```

**命名規則**

| 対象 | 規則 | 例 |
|:--|:--|:--|
| 変数・関数 | snake_case | `session_id`, `get_session()` |
| クラス | PascalCase | `SessionManager` |
| 定数 | UPPER_SNAKE_CASE | `MAX_TURNS`, `INITIAL_THRESHOLD` |
| ファイル | snake_case | `session_router.py` |

**ディレクトリ構成（バックエンド）**

```
01_backend/
├── main.py                   # FastAPIエントリーポイント
├── routers/                  # APIルーター
│   ├── sessions.py
│   ├── stats.py
│   └── settings.py
├── services/                 # ビジネスロジック
│   ├── scoring.py            # 採点ロジック
│   ├── questioning.py        # 問い生成ロジック
│   └── threshold.py          # 閾値自動調整ロジック
├── models/                   # Pydanticモデル
├── db/                       # DB接続・クエリ
│   ├── sqlite.py
│   └── chroma.py
├── llm/                      # Ollama・LangChain
│   ├── agent.py
│   ├── prompts.py            # プロンプトテンプレート（構造のみ）
│   ├── few_shots.py          # Few-shotサンプルのローダー
│   └── interfaces.py         # LLM呼び出しのインターフェース（モック差し替え用）
└── config.py                 # 設定値（定数）
```

**プロンプトの管理**（⚠️ セキュリティ上重要）

プロンプトは「テンプレート（構造）」と「Few-shotサンプル（内容）」を分離して管理する。

| 種別 | 保存場所 | git管理 | 理由 |
|:--|:--|:--|:--|
| プロンプトのテンプレート構造 | `01_backend/llm/prompts.py` | ✅ する | 構造はコードの一部 |
| Few-shotサンプル | `data/config/few_shots.json` | ❌ しない | 個人の思考データが混入するリスクがある |
| Few-shotのサンプル例（ダミー） | `01_backend/llm/few_shots_example.json` | ✅ する | 初回セットアップ時のひな形として使用 |

```python
# prompts.py の例（テンプレート構造のみ。Few-shotは外部から読み込む）
def build_scoring_prompt(user_input: str, few_shots: list[dict]) -> str:
    few_shot_text = "\n".join([
        f"入力：「{s['input']}」\n出力：{s['output']}"
        for s in few_shots
    ])
    return f"""
[SYSTEM]
あなたは論理思考トレーニングの採点官です。
...（テンプレート）...

■ 出力例（Few-shot）
{few_shot_text}

[USER]
{user_input}
"""
```

> **ルール**：開発・テスト中に自分の思考ログを使ってFew-shotを調整した場合、`data/config/few_shots.json` に保存し、`prompts.py` や `few_shots.json` には**絶対に含めない**こと。

### フロントエンド（React / TypeScript）

**インデント**：**スペース2文字**（Reactの標準）

**スタイル**
- TypeScriptを使用する（`.tsx` / `.ts`）
- フォーマッターは `Prettier`、リンターは `ESLint` を使用
- `any` 型の使用は禁止。型が不明な場合は `unknown` を使用

**命名規則**

| 対象 | 規則 | 例 |
|:--|:--|:--|
| コンポーネント | PascalCase | `ScoreBar`, `SessionCard` |
| 関数・変数 | camelCase | `handleSubmit`, `sessionId` |
| 定数 | UPPER_SNAKE_CASE | `MAX_TURNS` |
| CSSクラス | Tailwind CSS のみ使用 | `className="flex gap-4"` |
| ファイル（コンポーネント） | PascalCase | `ScoreBar.tsx` |
| ファイル（hooks・utils） | camelCase | `useSession.ts` |

**ディレクトリ構成（フロントエンド）**

```
02_frontend/
├── src/
│   ├── pages/            # 画面単位（S01〜S05対応）
│   │   ├── Home.tsx          # S01
│   │   ├── Session.tsx       # S02
│   │   ├── Result.tsx        # S03
│   │   ├── History.tsx       # S04
│   │   └── Settings.tsx      # S05
│   ├── components/       # 再利用可能なUIコンポーネント
│   │   ├── ScoreBar.tsx
│   │   ├── SessionCard.tsx
│   │   ├── LogicMap.tsx      # Mermaidラッパー
│   │   └── ScoreChart.tsx    # Chart.jsラッパー
│   ├── hooks/            # カスタムフック
│   │   ├── useSession.ts
│   │   └── useStats.ts
│   ├── api/              # バックエンドとの通信
│   │   └── client.ts
│   ├── types/            # 型定義
│   │   └── index.ts
│   └── constants/        # 定数
│       └── index.ts
```

---

## 4. PRレビュールール

### PRの作成ルール

- 1つのPRは**1つの目的**に絞る（機能追加と無関係なリファクタリングを混在させない）
- PRのタイトルはコミットメッセージと同じ形式（`feat(scoring): 採点プロンプトにFew-shotを追加`）
- PRには以下のテンプレートに沿って記述する

```markdown
## 概要
<!-- 何をしたか1〜3文で -->

## 変更内容
<!-- 箇条書きで具体的に -->
-

## 確認方法
<!-- レビュアーがどう動作確認すればいいか -->

## 関連ドキュメント・Issue
<!-- 関連する設計書のセクションやIssue番号 -->
```

### レビュアーのルール

- レビューは**48時間以内**に行う
- 指摘は `[Must]` / `[Imo]` / `[Nit]` のプレフィックスをつける

| プレフィックス | 意味 |
|:--|:--|
| `[Must]` | 必ず修正が必要。マージ不可 |
| `[Imo]` | 自分ならこうするという提案。修正は任意 |
| `[Nit]` | 細かい指摘。対応は任意（typo・スタイル等） |

```
# 指摘コメントの例
[Must] Few-shotサンプルがprompts.pyに含まれています。data/config/に移動してください
[Imo] ここはsession_idではなくidの方が短くて読みやすいかもしれません
[Nit] コメントに誤字があります（"セクション" → "セッション"）
```

### マージの条件

- レビュアー**1名以上**のApproval
- CI（Lint・型チェック・ユニットテスト）がすべてパス
- `[Must]` の指摘がすべて解消されている
- `main` へのマージは**Squash merge**を使用（コミット履歴を綺麗に保つ）

---

## 5. ディレクトリ・ファイル管理ルール

### 秘密情報・個人データの管理

- APIキー・パスワード等は `.env` ファイルに記載し、`.gitignore` に追加する
- `.env.example` にキー名のみ（値なし）を記載してリポジトリに含める
- **Few-shotサンプルは `data/config/` に保存し、絶対にリポジトリに含めない**

```bash
# .env.example
OLLAMA_BASE_URL=http://localhost:11434
SQLITE_PATH=./data/deep_why.db
CHROMA_PATH=./data/chroma_db
FEW_SHOTS_PATH=./data/config/few_shots.json
```

### `.gitignore` に含めるもの

```
# 環境変数
.env

# データファイル（思考データ・Few-shotサンプルはローカルのみ）
data/

# Python
__pycache__/
*.pyc
.venv/

# Node.js
node_modules/
dist/
build/

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
```

### `data/` ディレクトリについて

- `data/` は `.gitignore` に追加し、**絶対にリポジトリに含めない**
- 思考データ（SQLite・ChromaDB）とFew-shotサンプルが含まれるため、誤ってpushしないよう注意する
- 初回セットアップ時に `start.sh` で自動生成し、`few_shots_example.json` からひな形をコピーする

```bash
# start.sh の初回セットアップ処理（抜粋）
mkdir -p data/config
if [ ! -f data/config/few_shots.json ]; then
  cp 01_backend/llm/few_shots_example.json data/config/few_shots.json
  echo "Few-shotサンプルを data/config/few_shots.json に生成しました"
fi
```

---

## 6. テスト方針

### 基本方針：LLM推論は必ずモック化する

Ollama（推論20〜60秒）をCIで動かすのは現実的ではない。LLMの呼び出し部分は**インターフェースで抽象化**し、テスト時はFake実装に差し替えられる構造にする。

```python
# 01_backend/llm/interfaces.py
from abc import ABC, abstractmethod

class LLMInterface(ABC):
    @abstractmethod
    def score(self, user_input: str) -> dict:
        """採点を実行してスコアJSONを返す"""
        pass

    @abstractmethod
    def generate_question(self, question_type: str, context: dict) -> str:
        """問い文を生成して返す"""
        pass

# 本番実装
class OllamaLLM(LLMInterface):
    def score(self, user_input: str) -> dict:
        # Ollama呼び出し（20〜60秒）
        ...

# テスト用Fake実装
class FakeLLM(LLMInterface):
    def score(self, user_input: str) -> dict:
        # fixtures/から読み込んで即返す
        return load_fixture("score_success.json")
```

### テスト用フィクスチャの配置

```
01_backend/
└── tests/
    ├── fixtures/
    │   ├── score_success.json       # 採点成功パターン
    │   ├── score_low_concreteness.json  # 具体性が低いパターン
    │   ├── score_parse_error.json   # JSONパース失敗パターン
    │   └── question_vertical.json  # 垂直深掘りの問い生成結果
    ├── test_scoring.py
    ├── test_sessions.py
    ├── test_questioning.py
    └── test_threshold.py
```

### テスト対象の優先度

| 優先度 | 対象 | 理由 |
|:--|:--|:--|
| 高 | 採点ロジック（scoring.py） | スコアの精度がシステム品質に直結する |
| 高 | APIエンドポイント（routers/） | フロントエンドとの接続部分 |
| 高 | LLMインターフェース（Fake実装との差し替え） | CI通過の前提条件 |
| 中 | 問いタイプ選択ロジック | ビジネスロジックのコア |
| 中 | 閾値自動調整アルゴリズム | 数値計算のバグが成長追従に影響する |
| 低 | UIコンポーネント | 初期フェーズはスナップショットテストのみ |

### テストツール

| 対象 | ツール |
|:--|:--|
| バックエンド（Python） | `pytest` |
| フロントエンド（React） | `Vitest` + `React Testing Library` |

---

## 変更管理

| バージョン | 更新日 | 項番 | 変更種別 | 変更内容 |
|:--|:--|:--|:--|:--|
| 1.0 | 2026-03-17 | 全体 | 新規作成 | 初版作成。ブランチ戦略・コミット規約・コーディング規約・PRレビュールール・ファイル管理ルール・テスト方針を策定 |
| 1.1 | 2026-03-17 | §1 | 修正 | ブランチ戦略をGit FlowからGitHub Flowに変更。`develop` ブランチを廃止しv1.0リリース後の遅延導入とした |
| 1.1 | 2026-03-17 | §2 | 修正 | コミットscopeにドメイン層（`scoring` / `questioning` / `ux`）を追加。物理レイヤーscopeと共存する形に変更 |
| 1.1 | 2026-03-17 | §3 | 修正 | バックエンドのインデントをスペース2文字から4文字（PEP 8標準・black準拠）に修正 |
| 1.1 | 2026-03-17 | §3 | 修正 | プロンプト管理をテンプレート構造（`prompts.py`・git管理）とFew-shotサンプル（`data/config/few_shots.json`・git管理外）に分離 |
| 1.1 | 2026-03-17 | §5 | 修正 | `data/` の自動生成処理に `few_shots_example.json` のコピー処理を追加 |
| 1.1 | 2026-03-17 | §6 | 修正 | LLMモック化を必須条件として明記。`LLMInterface` による抽象化・`FakeLLM` によるテスト差し替え設計を追加 |
| 1.2 | 2026-03-23 | §1 | 追記 | ブランチ構成・運用ルール・命名規則に `test/*`（動作確認・検証）を追加 |
| 1.2 | 2026-03-23 | §2 | 修正 | `test` typeの用途に「動作確認・検証作業」を追記。コミットメッセージ例に `test` の例を追加 |
| 1.2 | 2026-03-23 | §3 | 追記 | バックエンドの依存管理に現状（pip + requirements.txt）と将来（uv移行予定）を明記 |
| 1.3 | 2026-03-31 | §3・§6 | 修正 | フォルダ名`backend/`を`01_backend/`に変更 |
| 1.3 | 2026-03-31 | §3| 修正 | フォルダ名`frontend/`を`02_frontend/`に変更 |