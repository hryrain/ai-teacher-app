// Vercel Serverless Function - 代理 OpenAI API 调用
// API Key 存在 Vercel 环境变量里，前端永远看不到

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: '只支持 POST' }));
    return;
  }

  const API_KEY = process.env.OPENAI_API_KEY;
  const API_URL = process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';
  const MODEL = process.env.MODEL || 'gpt-4o';

  if (!API_KEY) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'API Key 未配置，请在 Vercel 设置环境变量 OPENAI_API_KEY' }));
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: body.model || MODEL,
        messages: body.messages,
        temperature: body.temperature || 0.7,
        max_tokens: body.max_tokens || 1500
      })
    });

    const data = await response.json();

    res.statusCode = response.ok ? 200 : response.status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  } catch (err) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: err.message }));
  }
}
