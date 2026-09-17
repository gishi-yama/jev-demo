# Jev Demo

[日本語](#日本語) | [English](#english)

TypeSafe System One (Jev) を使った、リアルタイム判定デモ。
Live demos of TypeSafe System One (Jev) doing structured judgment on free-text Japanese input.

---

## 日本語

同じ自由記述文を、複数の視点で同時に構造化判定するデモを3種類収録。

- **意図判定デモ** (`/`, `public/index.html`)
  1つの文章に対し、`category`(Choice)・`urgency`(Score)・`hidden_complaint`(Noul) の3質問を並列実行。
  丁寧な文面の裏にある不満・皮肉を検出する「本音検出」が見どころ。
- **主観・客観判定デモ** (`/subjectivity.html`)
  文章が客観的事実の記述か、主観的な意見・感想の表明かを Noul で判定。
- **話し言葉・書き言葉 語句判定デモ** (`/register.html`)
  `Intl.Segmenter` で文章を語句単位に分割し、語句ごとに独立した Noul 質問を fan-out。話し言葉度に応じて3段階(書き言葉/中間/話し言葉)の色で文章をハイライト表示する。

サーバー(`server.js`)が TypeSafe API へのプロキシを担い、APIキーはブラウザからリクエストごとに渡すだけでディスクには保存しない。

### 必要環境

- Node.js 18 以降(標準の `fetch` を使用、追加パッケージ不要)
- TypeSafe API キー([docs.typesafe.ai](https://docs.typesafe.ai) 参照)

### 起動方法

```bash
node server.js
```

ブラウザで以下を開く:

- 意図判定デモ: http://localhost:4173/
- 主観・客観判定デモ: http://localhost:4173/subjectivity.html
- 話し言葉・書き言葉 語句判定デモ: http://localhost:4173/register.html

画面上部の「TypeSafe API キー」欄に自分のキーを直接入力してから「判定する」を押す。
ポート番号は環境変数 `PORT` で変更可能(既定値: `4173`)。

### 構成

```
server.js                 APIキー中継サーバ(静的配信 + /api/analyze, /api/analyze-register プロキシ)
public/index.html         意図判定デモ画面
public/subjectivity.html  主観・客観判定デモ画面
public/register.html      話し言葉・書き言葉 語句判定デモ画面
.claude/launch.json       Claude Code プレビュー起動設定
```

---

## English

Three demos that fire multiple structured questions over the same free-text input in parallel.

- **Intent triage demo** (`/`, `public/index.html`)
  Runs three questions on one piece of text at once: `category` (Choice), `urgency` (Score), and `hidden_complaint` (Noul).
  The highlight is "hidden complaint" detection — catching politely-worded dissatisfaction or sarcasm.
- **Subjectivity demo** (`/subjectivity.html`)
  Judges whether a passage reads as objective fact or subjective opinion, via a Noul question.
- **Spoken/written register demo** (`/register.html`)
  Splits text into words with `Intl.Segmenter`, fans out one independent Noul question per word, and highlights the sentence in three sharp bands (written / neutral / spoken) based on each word's register.

`server.js` proxies requests to the TypeSafe API. The API key is sent from the browser per request and is never written to disk.

### Requirements

- Node.js 18+ (uses the built-in `fetch`, no dependencies to install)
- A TypeSafe API key (see [docs.typesafe.ai](https://docs.typesafe.ai))

### Running it

```bash
node server.js
```

Then open in your browser:

- Intent triage demo: http://localhost:4173/
- Subjectivity demo: http://localhost:4173/subjectivity.html
- Spoken/written register demo: http://localhost:4173/register.html

Paste your API key directly into the "TypeSafe API キー" field at the top of the page, then click "判定する" (Analyze).
The port can be overridden with the `PORT` environment variable (default: `4173`).

### Layout

```
server.js                 Proxy server (static file serving + /api/analyze, /api/analyze-register)
public/index.html         Intent triage demo page
public/subjectivity.html  Subjectivity demo page
public/register.html      Spoken/written register demo page
.claude/launch.json       Claude Code preview launch config
```
