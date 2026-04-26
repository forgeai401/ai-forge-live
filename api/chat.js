export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
 
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
 
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
 
  const apiKey = process.env.ANTHROPIC_API_KEY;
 
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }
 
  let body = req.body;
 
  // Handle case where body is a string
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch(e) {
      return res.status(400).json({ error: 'Invalid JSON' });
    }
  }
 
  const { system, messages } = body;
 
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages format' });
  }
 
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        system: system || '',
        messages: messages
      })
    });
 
    if (!response.ok) {
      const errData = await response.json();
      return res.status(response.status).json({ error: errData });
    }
 
    const data = await response.json();
    return res.status(200).json(data);
 
  } catch (err) {
    console.error('Chat error:', err);
    return res.status(500).json({ error: err.message || 'API error' });
  }
}
