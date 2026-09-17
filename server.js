const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 4173;
const PUBLIC_DIR = path.join(__dirname, 'public');

// Jev への同時fan-out質問セット。同一state(自由記述文)に対し複数視点で独立評価する。
// mode で使う質問セットを切り替える。
const QUESTION_SETS = {
  main: {
    category: {
      type: 'choice',
      instructions: '発言者の意図として最も近いカテゴリを選べ。文面の丁寧さや婉曲表現に惑わされず、実質的な意図で判断すること。',
      criteria: {
        refund: '返金・キャンセル・返品を求めている',
        bug_report: '不具合・エラー・動作不良を報告している',
        how_to: '使い方や仕様について質問している',
        praise: '純粋に肯定的な感想・称賛を伝えている',
        other: '上記いずれにも当てはまらない'
      }
    },
    urgency: {
      type: 'score',
      instructions: '対応の緊急度を判定せよ。表面上の丁寧さではなく、内容が示す深刻さ・時間的切迫度で判断すること。',
      criteria: [
        '低: 急ぎではない一般的な内容',
        '中: 数日以内の対応が望ましい',
        '高: 早急な対応が必要',
        '緊急: 即時対応が必要な重大な問題'
      ]
    },
    hidden_complaint: {
      type: 'noul',
      instructions: '文面上は肯定的・丁寧な語彙を使っているが、実際には不満や皮肉を表明しているか？',
      criteria: {
        true: '表面上ポジティブだが実質的には不満・皮肉の表明',
        false: '文面通りの肯定的内容、または明確に否定的で皮肉ではない'
      }
    }
  },
  subjectivity: {
    subjectivity: {
      type: 'noul',
      instructions: 'この文章は客観的事実の記述か、主観的な意見・感想の表明か？',
      criteria: {
        true: '主観的な意見・感想・評価が中心',
        false: '客観的な事実・データの記述が中心'
      }
    }
  }
};

function serveStatic(req, res) {
  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = path.join(PUBLIC_DIR, path.normalize(filePath));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath);
    const type = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' }[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/analyze') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', async () => {
      try {
        const { text, apiKey, mode } = JSON.parse(body || '{}');
        if (!apiKey) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'APIキー未入力' }));
          return;
        }
        if (!text || !text.trim()) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: '文章未入力' }));
          return;
        }
        const questions = QUESTION_SETS[mode] || QUESTION_SETS.main;

        const upstream = await fetch('https://api.typesafe.ai/v1/systemone', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            state: text,
            model: 'jev-latest',
            questions
          })
        });

        const data = await upstream.json();
        res.writeHead(upstream.status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: String(e && e.message ? e.message : e) }));
      }
    });
    return;
  }
  serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`Jev demo listening on http://localhost:${PORT}`);
});
