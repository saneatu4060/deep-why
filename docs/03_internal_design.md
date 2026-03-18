# 内部設計書：論理思考トレーニング『Deep Why』
**バージョン**: 2.0（ドキュメント種別を詳細設計書から内部設計書に変更。要件定義v3.0との整合対応は次バージョンで実施）
**最終更新**: 2026-03-17

---

## 1. 設計決定事項 一覧

| 項目 | 決定内容 |
|:--|:--|
| スコアリング実装方針 | LLMプロンプト採点（送信後に実行） |
| LLM呼び出し戦略 | 案C：採点のみLLM → Pythonルールで問いタイプ決定 → LLMで問い文生成（計2回） |
| スコアのUI表示 | 表示する（具体性・因果性・定義度をバー表示＋採点理由を1文表示） |
| スコア閾値 | 成長追従型・自動調整（初期値 0.5、セッション平均スコアに応じて引き上げ） |
| min_turns / max_turns | min=3、max=5（固定） |
| 論理マップ出力形式 | Mermaid ビジュアルグラフ |
| 使用モデル | Qwen2.5-7B（Alibaba・Apache 2.0・日本語対応） |
| Vector DB | ChromaDB（LangChain公式対応・ローカルファイル保存） |
| セッション途中離脱 | 途中保存可能。セッションIDで再開できる |
| LLM実行環境 | ローカルPC（Ollama経由・完全ローカル動作） |
| データ保存場所 | ローカルPC（SQLite・ChromaDB）。外部送信なし |
| 想定月額コスト | $0（電気代のみ） |
| 将来課題（優先度低） | パッケージリリース・SEO対策（将来フェーズで設計） |

---

## 2. 全体アーキテクチャ

> 完全ローカル構成。外部への通信は一切なし。

```mermaid
graph TB
    subgraph LOCAL["ローカルPC（ThinkBook）― 外部送信なし"]
        direction TB

        subgraph UI["UI層"]
            U1["テキスト入力"]
            U2["スコアバー表示\n具体性／因果性／定義度"]
            U3["論理マップ出力\nMermaid"]
        end

        subgraph ENGINE["制御層：Adaptive Questioning Engine（LangChain）"]
            E1["Pythonルール\n問いタイプ選択（即時）"]
            E2["終了判定\n全スコア ≥ 閾値 かつ count ≥ min_turns"]
            E3["論理マップ生成"]
        end

        subgraph LLM["LLM層"]
            L1["Ollama\nlocalhost:11434\nQwen2.5-7B（CPU推論）\n推論速度：10〜30秒"]
        end

        subgraph DATA["データ層"]
            D1["SQLite\nセッションログ\n閾値履歴"]
            D2["ChromaDB\n過去コンテキスト\nEmbedding検索"]
        end
    end

    U1 -->|ユーザー送信| ENGINE
    ENGINE -->|採点プロンプト①| L1
    ENGINE -->|問い生成プロンプト②| L1
    L1 -->|スコアJSON| ENGINE
    L1 -->|問い文| ENGINE
    ENGINE -->|スコア表示| U2
    ENGINE -->|問いを返却| U1
    E2 -->|完了| U3
    ENGINE <-->|読み書き| D1
    ENGINE <-->|検索／保存| D2
```

---

## 3. 処理フロー詳細

### 3.1 1ターンあたりのシーケンス図

```mermaid
sequenceDiagram
    actor User as ユーザー
    participant UI as UI層
    participant Engine as LangChain Engine
    participant LLM as Ollama（Qwen2.5-7B）
    participant DB as SQLite / ChromaDB

    Note over LLM: 初回のみ: ollama run qwen2.5:7b

    User->>UI: テキスト入力・送信
    UI->>Engine: 入力テキストを渡す

    Engine->>LLM: 採点プロンプト①（10〜30秒）
    LLM-->>Engine: {"concreteness":0.4, "causality":0.6,\n"definitiveness":0.3, "reason":"..."}

    Engine->>UI: スコアをバー表示（最低指標ハイライト）
    Engine->>DB: ChromaDB検索（過去発言との矛盾確認）
    DB-->>Engine: 類似発言 top-3

    Engine->>Engine: Pythonルール：問いタイプ選択（即時）

    alt 全スコア ≥ 閾値 かつ count ≥ min_turns(3)
        Engine->>LLM: 論理マップ生成プロンプト
        LLM-->>Engine: Mermaidグラフ
        Engine->>UI: 論理マップ表示（セッション完了）
        Engine->>DB: status='completed' で保存
    else count ≥ max_turns(5)
        Engine->>UI: 強制終了・現時点の最善を出力
        Engine->>DB: status='force_completed' で保存
    else 継続
        Engine->>LLM: 問い生成プロンプト②（10〜30秒）
        LLM-->>Engine: 問い文（1文・疑問文）
        Engine->>DB: ターンログ保存
        Engine->>UI: 問いを表示
        UI->>User: 問いを提示 → 再入力待ち
    end
```

### 3.2 終了判定フローチャート

```mermaid
flowchart TD
    A([ユーザー返答]) --> B[採点プロンプト実行]
    B --> C{JSONパース成功？}
    C -- No --> D[リトライ 最大2回]
    D --> C
    C -- Yes --> E[スコアをUI表示]
    E --> F[count += 1]
    F --> G{count ≥ max_turns\n5回？}
    G -- Yes --> H[強制終了\n現時点の最善を出力]
    H --> I[(force_completed\nをSQLiteに保存)]
    G -- No --> J{全スコア ≥ 閾値\nかつ count ≥ 3？}
    J -- Yes --> K[論理マップ生成\nMermaid出力]
    K --> L[(completed\nをSQLiteに保存)]
    J -- No --> M[Pythonルール\n問いタイプ選択]
    M --> N[問い生成プロンプト実行]
    N --> O[問いをユーザーに返却]
    O --> A

    style H fill:#f9e0e0
    style K fill:#d4edda
    style L fill:#d4edda
    style I fill:#f9e0e0
```

### 3.3 問いタイプ選択ロジック（Pythonルール）

```python
def select_question_type(scores: dict, session_id: str) -> str:
    # 過去ログに矛盾がある場合は優先してhistoryタイプ
    if has_contradiction_in_history(session_id):
        return "history"

    weakest = min(scores, key=scores.get)
    mapping = {
        "concreteness":   "vertical",        # 垂直深掘り
        "causality":      "counterevidence", # 反証提示
        "definitiveness": "goal",            # 目的回帰
    }
    return mapping[weakest]
```

### 3.4 待ち時間について

合計待ち時間は20〜60秒（LLM呼び出し2回分）。思考の間合いとして設計上許容する。待機中はスコアバーをアニメーション表示して処理中であることを示す。

---

## 4. Insight Analyzer 詳細

### 4.1 採点プロンプト（LLM呼び出し①）

```
[SYSTEM]
あなたは論理思考トレーニングの採点官です。
ユーザーの入力を以下の3指標で採点し、必ずJSONのみで返答してください。
前後の説明文・Markdownコードブロック等は一切出力しないこと。

■ 採点指標
- concreteness（具体性）: 0.0〜1.0
  5W1H・数値・固有名詞・時期の含有率。
  「最近」「なんとなく」等の曖昧語は減点。

- causality（因果性）: 0.0〜1.0
  主張に対し根拠が論理的に接続されているか。
  感情による断定・論理の飛躍は減点。

- definitiveness（定義度）: 0.0〜1.0
  独自の意味を持つ言葉（概念語）が客観的に説明されているか。
  未定義の抽象語の多用は減点。

■ 出力フォーマット（厳守）
{
  "concreteness": 0.00,
  "causality": 0.00,
  "definitiveness": 0.00,
  "reason": "採点理由を1文で（日本語）"
}

■ 出力例（Few-shot）
入力：「最近、なんとなくやる気が出ない」
出力：{"concreteness": 0.10, "causality": 0.10, "definitiveness": 0.20, "reason": "時期・原因・定義がすべて曖昧で具体的な情報がない"}

入力：「3ヶ月前に営業部へ異動してから、自分の得意な企画業務ができなくなりやる気を失った」
出力：{"concreteness": 0.80, "causality": 0.75, "definitiveness": 0.60, "reason": "時期と出来事は明確だが『得意な業務』の定義がやや曖昧"}

[USER]
{ユーザー入力テキスト}
```

> **7Bモデル向けの注意点**：Few-shotサンプルを必ず含めることでJSON出力の安定性が大幅に向上する。出力がJSON以外の形式になった場合はPython側でリトライ処理（最大2回）を実装すること。

### 4.2 スコアUI表示仕様

```
┌────────────────────────────────────┐
│ 具体性    ████░░░░░░  0.40         │
│ 因果性    ██████░░░░  0.60         │
│ 定義度    ███░░░░░░░  0.30  ◀ 最低 │
│                                    │
│ 「使っている言葉の意味をもう少し   │
│   具体的に説明してみてください」   │
└────────────────────────────────────┘
```

- 0〜1をプログレスバーで可視化
- 最低指標をハイライト表示
- `reason` を1文で表示（差し戻し理由の透明化）

---

## 5. スコア閾値 自動調整設計

### 5.1 方針：成長追従型

ユーザーの思考力の成長に合わせて閾値を引き上げ、**常に「少し背伸びが必要なライン」を維持する**。

### 5.2 調整アルゴリズム

```python
INITIAL_THRESHOLD = 0.50   # 初回セッションの閾値
ADJUSTMENT_RATE   = 0.05   # 1セッションあたりの最大引き上げ幅
MAX_THRESHOLD     = 0.85   # 上限（これ以上は上げない）
MIN_THRESHOLD     = 0.40   # 下限（成長が止まっても下げすぎない）

def calc_next_threshold(history: list[dict]) -> float:
    """
    直近Nセッションの完了時平均スコアを元に次回閾値を算出。
    平均スコアが現在閾値を上回っていれば閾値を引き上げる。
    """
    if len(history) < 3:
        return INITIAL_THRESHOLD  # セッション数が少ない間は初期値を維持

    recent = history[-5:]  # 直近5セッションを参照
    avg_score = mean([s["avg_final_score"] for s in recent])
    current_threshold = history[-1]["threshold"]

    if avg_score > current_threshold:
        delta = min((avg_score - current_threshold) * 0.5, ADJUSTMENT_RATE)
        new_threshold = min(current_threshold + delta, MAX_THRESHOLD)
    else:
        new_threshold = max(current_threshold - ADJUSTMENT_RATE, MIN_THRESHOLD)

    return round(new_threshold, 2)
```

### 5.3 閾値の推移イメージ

| セッション数 | 想定平均スコア | 閾値 |
|:--:|:--:|:--:|
| 1〜3回 | 0.40〜0.55 | 0.50（固定） |
| 5回 | 0.60 | 0.55 |
| 10回 | 0.70 | 0.63 |
| 20回 | 0.78 | 0.72 |
| 30回以上 | 0.82 | 0.80（上限付近） |

---

## 6. Adaptive Questioning Engine 詳細

### 6.1 問いタイプと生成プロンプト（LLM呼び出し②）

| タイプ | 発動条件 | 問いの方向性 |
|:--|:--|:--|
| 垂直深掘り（vertical） | concreteness が最低 | いつ・どこで・誰が・どのくらい |
| 目的回帰（goal） | definitiveness が最低 | その言葉・概念の自分なりの定義 |
| 反証提示（counterevidence） | causality が最低 | 逆の場合・例外・反例の検討 |
| 過去ログ参照（history） | ChromaDB検索で矛盾発見時 | 過去の発言との整合性 |

```
[SYSTEM]
あなたは論理思考トレーニングのコーチです。
以下の情報を元に、ユーザーの思考を深めるための「問い」を1つだけ生成してください。
問いは短く・鋭く・答えやすい形（疑問文）にすること。説明や前置きは不要。

問いタイプ: {question_type}
ユーザーの直近の発言: {user_input}
最低スコアの指標: {weakest}
採点理由: {reason}

[出力]
問い文のみ（1文・疑問文）
```

### 6.2 往復回数管理

```python
session_state = {
    "session_id":  str,       # UUID
    "count":       int,       # 現在の往復回数（0始まり）
    "min_turns":   3,         # 最低往復回数（固定）
    "max_turns":   5,         # 上限往復回数（固定）
    "threshold":   float,     # 今セッションの閾値（セッション開始時に確定）
    "scores_history": list,   # 全ターンのスコア履歴
    "status":      str,       # 'active' | 'completed' | 'force_completed' | 'abandoned'
}
```

---

## 7. データ層設計

### 7.1 ER図

```mermaid
erDiagram
    sessions {
        TEXT id PK "UUID"
        DATETIME started_at
        DATETIME ended_at
        TEXT status "active|completed|force_completed|abandoned"
        TEXT topic "最初の入力要約"
        REAL threshold "使用した閾値"
        REAL avg_final_score "完了時の平均スコア"
    }

    turns {
        INTEGER id PK
        TEXT session_id FK
        INTEGER turn_number
        TEXT user_input
        REAL score_concreteness
        REAL score_causality
        REAL score_definitiveness
        TEXT score_reason "採点理由"
        TEXT question_type "vertical|goal|counterevidence|history"
        TEXT ai_question "生成された問い文"
        DATETIME created_at
    }

    thought_patterns {
        INTEGER id PK
        TEXT pattern_type "dead_end|logical_leap|hot_keyword"
        TEXT keyword
        INTEGER frequency
        DATETIME last_seen
    }

    threshold_history {
        INTEGER id PK
        TEXT session_id FK
        REAL threshold_used
        REAL avg_score
        REAL next_threshold
        DATETIME created_at
    }

    sessions ||--o{ turns : "1セッションに複数ターン"
    sessions ||--o{ threshold_history : "1セッションに1閾値履歴"
```

### 7.2 SQLiteスキーマ（DDL）

```sql
-- セッション管理
CREATE TABLE sessions (
    id                TEXT PRIMARY KEY,         -- UUID
    started_at        DATETIME,
    ended_at          DATETIME,
    status            TEXT,                     -- 'active'|'completed'|'force_completed'|'abandoned'
    topic             TEXT,                     -- 最初のユーザー入力（要約）
    threshold         REAL,                     -- このセッションで使用した閾値
    avg_final_score   REAL                      -- セッション終了時の平均スコア（閾値調整に使用）
);

-- ターンごとのログ
CREATE TABLE turns (
    id                      INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id              TEXT REFERENCES sessions(id),
    turn_number             INTEGER,
    user_input              TEXT,
    score_concreteness      REAL,
    score_causality         REAL,
    score_definitiveness    REAL,
    score_reason            TEXT,               -- LLMの採点理由
    question_type           TEXT,               -- 選択された問いタイプ
    ai_question             TEXT,               -- 生成された問い文
    created_at              DATETIME
);

-- 思考パターン蓄積（パーソナライズ用）
CREATE TABLE thought_patterns (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    pattern_type  TEXT,    -- 'dead_end'|'logical_leap'|'hot_keyword'
    keyword       TEXT,
    frequency     INTEGER DEFAULT 1,
    last_seen     DATETIME
);

-- 閾値履歴（成長追従型の調整ログ）
CREATE TABLE threshold_history (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id     TEXT REFERENCES sessions(id),
    threshold_used REAL,
    avg_score      REAL,
    next_threshold REAL,
    created_at     DATETIME
);
```

### 7.2 ChromaDB 設計

```
コレクション名: user_thoughts

保存単位:  1発言（1ターンのユーザー入力）
メタデータ: {
    session_id:   str,
    turn_number:  int,
    score_avg:    float,
    created_at:   str
}

検索タイミング: 毎ターン、採点後に実行
取得件数（k）:  上位3件
類似度閾値:     0.85以上のみ「矛盾あり」と判定
```

```python
# ChromaDB 利用例（LangChain経由）
from langchain.vectorstores import Chroma
from langchain.embeddings import HuggingFaceEmbeddings

embeddings = HuggingFaceEmbeddings(model_name="intfloat/multilingual-e5-small")
vectorstore = Chroma(
    collection_name="user_thoughts",
    embedding_function=embeddings,
    persist_directory="./chroma_db"
)

# 保存
vectorstore.add_texts(
    texts=[user_input],
    metadatas=[{"session_id": sid, "turn_number": n, "score_avg": avg}]
)

# 検索（過去ログ参照）
results = vectorstore.similarity_search_with_score(user_input, k=3)
contradictions = [r for r, score in results if score >= 0.85]
```

**Embeddingモデル**：`intfloat/multilingual-e5-small` を推奨（日本語対応・軽量・ローカル動作可）

---

## 8. 最終出力：論理マップ（Mermaid）

セッション完了時に、全ターンのユーザー発言とスコア推移から論理マップを生成する。

```mermaid
graph TD
    A["最初の問い<br/>仕事のやる気が出ない"] --> B["turn1：いつから？<br/>具体性 0.4"]
    B --> C["turn2：3ヶ月前、異動してから<br/>具体性 0.7"]
    C --> D["turn3：なぜ異動がつらい？<br/>因果性 0.4"]
    D --> E["turn4：得意なことを活かせていない<br/>因果性 0.7"]
    E --> F["turn5：結論<br/>自分の強みが見えていない状態が根本原因"]

    style A fill:#e8e8e8
    style F fill:#d4edda
```

---

## 9. 技術スタック（確定版）

| コンポーネント | 採用技術 |
|:--|:--|
| エージェント制御 | Python + LangChain |
| LLM | Qwen2.5-7B（Alibaba・Apache 2.0・日本語対応） |
| LLM実行環境 | Ollama（ローカル常駐・localhost:11434） |
| Embeddingモデル | intfloat/multilingual-e5-small（ローカル動作） |
| セッションログ | SQLite（ローカルPC） |
| 過去コンテキスト参照 | ChromaDB（ローカルPC） |
| 論理マップ出力 | Mermaid |
| 想定月額コスト | $0（電気代のみ） |
| 将来課題 | パッケージリリース・SEO対策（優先度低・将来フェーズで設計） |

---

## 10. 残課題（実装フェーズで対応）

| 課題 | 内容 |
|:--|:--|
| 推論待ち時間のUX | 1ターンあたり20〜60秒の待機が発生する。スコアバーのアニメーション表示や「考え中...」の文言など、待機中の体験設計が必要 |
| JSON出力の安定性検証 | 7Bモデルでは稀にJSON形式が崩れる。リトライ処理（最大2回）の実装と、それでも失敗した場合のフォールバック処理が必要 |
| ThinkBookの発熱・バッテリー管理 | 長時間のCPU推論は発熱とバッテリー消費を伴う。電源接続時のみ使用を推奨する旨をUIに表示することを検討 |
| Mermaid生成プロンプト設計 | 全ターンの発言から論理マップを生成するプロンプトが未設計 |
| 採点精度の検証 | Qwen2.5-7BとFew-shotの組み合わせで十分な採点精度が得られるかテストが必要 |
| UXテスト | 差し戻し体験のフラストレーション許容度の検証。特にmax_turns=5と待ち時間の組み合わせが適切かどうか |
| セッション再開UI | 途中保存されたセッションをどの画面から再開するかのUI設計が未着手 |
| 将来：パッケージリリース | インストーラー・配布形式・ライセンス設計（優先度低） |
| 将来：SEO対策 | ランディングページ設計・コンテンツ戦略（優先度低） |

---

---

## 変更管理

| バージョン | 更新日 | 項番 | 変更種別 | 変更内容 |
|:--|:--|:--|:--|:--|
| 1.0 | 2026-03-16 | 全体 | 新規作成 | 初版作成。全体アーキテクチャ・処理フロー・採点プロンプト・SQLiteスキーマ・ChromaDB設計を記述 |
| 1.1 | 2026-03-16 | §1・§2・§3・§9・§10 | 修正 | インフラ構成をEC2スポットインスタンス構成に変更。アーキテクチャ図・処理シーケンス・技術スタック・残課題を更新 |
| 1.2 | 2026-03-16 | §1・§2・§3・§4.1・§9・§10 | 修正 | 完全ローカル構成（Ollama + Qwen2.5-7B）に変更。EC2・boto3関連の設計を削除。採点プロンプトにFew-shotを追加。待ち時間を20〜60秒に更新 |
| 1.3 | 2026-03-17 | §2・§3・§7 | 新規追加 | アーキテクチャ図（Mermaid）・シーケンス図・終了判定フローチャート・ER図を追加。テキストベースの図を置き換え |
| 1.4 | 2026-03-17 | §9 | 削除 | Claude Code（開発補助）を技術スタックから削除 |
| 2.0 | 2026-03-17 | 全体 | ドキュメント種別変更 | ドキュメント名を「詳細設計書」から「内部設計書」に変更。要件定義v3.0（エンジニア特化）との整合対応は次バージョンで実施予定 |