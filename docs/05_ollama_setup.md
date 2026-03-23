# Ollamaセットアップ手順書

**バージョン**: 1.1
**最終更新**: 2026-03-23
**検証環境**: Windows（ThinkBook）※ Mac手順は未検証

---

## 概要

Deep WhyはローカルLLM（Qwen2.5-7B）をOllama経由で動作させます。
本書ではOllamaのインストールからDeep Whyで使用するモデルの準備までを説明します。

---

## 1. Ollamaのインストール

### Windows

1. https://ollama.com/download にアクセス
2. 「Download for Windows」をクリックしてインストーラーをダウンロード
3. ダウンロードした `OllamaSetup.exe` を実行
4. 画面の指示に従ってインストールを完了する

### Mac（未検証）

1. https://ollama.com/download にアクセス
2. 「Download for macOS」をクリックしてダウンロード
3. ダウンロードした `Ollama-darwin.zip` を展開
4. `Ollama.app` をアプリケーションフォルダに移動して起動する

---

## 2. インストールの確認

ターミナル（PowerShell / ターミナル.app）を開いて以下を実行します。

```bash
ollama --version
```

以下のように表示されれば正常にインストールされています。

```
ollama version 0.x.x
```

---

## 3. モデルのダウンロード

Deep Whyで使用するQwen2.5-7B-Instructをダウンロードします。

```bash
ollama pull qwen2.5:7b-instruct
```

> **注意（ディスク容量）**：モデルのサイズは約4.7GBです。ダウンロードに数分〜十数分かかります。ディスクの空き容量を事前に確認してください。

> **注意（メモリ）**：7Bモデルの実行には最低8GB、推奨16GB以上のRAMが必要です。実行時にRAMの空き容量が不足すると起動に失敗します。他のアプリケーションを閉じてからDeep Whyを起動することを推奨します。

> **ダウンロードが中断された場合**：再度同じコマンドを実行するとレジューム（再開）されます。最初からやり直す必要はありません。

```bash
ollama pull qwen2.5:7b-instruct  # 中断しても再実行すれば再開される
```

ダウンロード完了後、以下で確認します。

```bash
ollama list
```

以下のように表示されれば成功です。

```
NAME                    ID              SIZE    MODIFIED
qwen2.5:7b-instruct     xxxxxxxx        4.7 GB  数秒前
```

---

## 4. Ollamaサーバーの起動

Deep Whyを使用する前に必ずOllamaサーバーを起動してください。

> **Windowsユーザーへ**：Ollamaをインストールすると、通常はシステムトレイ（画面右下のタスクバー）にOllamaのアイコンが表示され、自動的にサーバーが起動しています。タスクバーにOllamaアイコンがある場合はこの手順はスキップして問題ありません。

手動で起動する場合は以下を実行します。

```bash
ollama serve
```

以下のように表示されれば起動成功です。

```
Listening on 127.0.0.1:11434 (version 0.x.x)
```

> **プライバシーについて**：OllamaはデフォルトでLAN内の他のPCからアクセスできない `127.0.0.1`（localhost）のみで待ち受けます。外部ネットワークから思考データにアクセスされる心配はありません。

> **注意**：`ollama serve` を実行したターミナルは起動中は閉じないでください。Deep Whyの `start.sh` は別ターミナルで実行します。

> **将来の拡張について（内部メモ）**：将来DockerやLAN内の別PCからOllamaにアクセスする場合は `OLLAMA_ORIGINS` 環境変数の設定が必要になる可能性があります。現状のlocalhost同士の構成では不要です。

---

## 5. 動作確認

Ollamaサーバーが起動した状態で、別ターミナルから以下を実行します。

```bash
curl http://localhost:11434/api/tags
```

以下のようなJSONが返ってくれば正常に動作しています。

```json
{"models":[{"name":"qwen2.5:7b-instruct", ...}]}
```

---

## 6. Deep WhyのS05設定画面での確認

`start.sh` でDeep Whyを起動後、`http://localhost:3000/settings` を開いてください。

```
● 接続中  localhost:11434
  Qwen2.5-7B  応答時間 約18秒
```

緑のインジケーターと「接続中」が表示されれば設定完了です。

---

## 7. よくあるエラーと対処法

### `ollama: command not found`

Ollamaが正しくインストールされていないか、PATHが通っていません。

```bash
# Windowsの場合：PowerShellを管理者で再起動して再試行
# Macの場合：ターミナルを再起動して再試行
ollama --version
```

それでも解決しない場合はOllamaを再インストールしてください。

---

### `Error: listen tcp 127.0.0.1:11434: bind: address already in use`

すでにOllamaサーバーが起動しています。そのまま使用して問題ありません。

---

### `Error: model "qwen2.5:7b-instruct" not found`

モデルがダウンロードされていません。以下を実行してください。

```bash
ollama pull qwen2.5:7b-instruct
```

---

### S05設定画面で「未接続」と表示される

Ollamaサーバーが起動していません。以下を実行してください。

```bash
ollama serve
```

起動後、S05設定画面の「再確認」ボタンをクリックしてください。

---

### 推論速度が非常に遅い（1トークンあたり数秒以上）

ThinkBookはCPUモードで動作するため、1ターンあたり20〜60秒の推論時間は仕様です。ただし以下の点を確認してください。

- 電源に接続されているか（バッテリー駆動は推論速度が低下する場合があります）
- 他の重いアプリケーションが起動していないか

---

### RAMが不足して起動に失敗する・動作が極端に重い

7Bモデルの実行には最低8GB・推奨16GB以上のRAMが必要です。RAMが不足している場合は軽量なモデルをお試しください。

```bash
# 3Bモデル（約2GB・軽量）
ollama pull qwen2.5:3b-instruct

# 1.5Bモデル（約1GB・さらに軽量）
ollama pull qwen2.5:1.5b-instruct
```

> **注意**：軽量モデルは採点精度・問い生成の品質が低下する可能性があります。`config.py` の `OLLAMA_MODEL` を変更することで切り替えられます。

---

## 変更管理

| バージョン | 更新日 | 変更内容 |
|:--|:--|:--|
| 1.0 | 2026-03-23 | 初版作成。Windows・Mac対応（Mac未検証） |
| 1.1 | 2026-03-23 | モデル名を `qwen2.5:7b-instruct` に変更。メモリ要件・ダウンロード再開・Windowsトレイ常駐の注記を追加。軽量モデルの代替案を追加。OLLAMA_ORIGINSの将来メモを追加 |