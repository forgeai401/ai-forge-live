export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { system, messages } = req.body;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.GROQ_API_KEY
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        max_tokens: 500,
        messages: [{ role: 'system', content: system }, ...messages]
      })
    });

    const data = await response.json();
    console.log('Groq response:', JSON.stringify(data));
    
    // Extract the reply and return it simply
    const reply = data?.choices?.[0]?.message?.content;
    return res.status(200).json({ reply: reply || 'No reply' });
    
  } catch (err) {
    console.log('Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
