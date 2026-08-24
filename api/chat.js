export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server is missing OPENROUTER_API_KEY. Add it in Vercel Project Settings → Environment Variables.' });
  }
  try {
    const { system, userContent } = req.body || {};
    const messages = [
      { role: 'system', content: system },
      { role: 'user', content: userContent }
    ];
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://norvixai.vercel.app',
        'X-Title': 'Norvix AI Coach'
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages,
        max_tokens: 4000
      })
    });
    const data = await response.json();
    if (data.error) {
      return res.status(response.status || 500).json({ error: data.error.message || data.error });
    }
    const text = data.choices?.[0]?.message?.content || '';
    res.status(200).json({ content: [{ type: 'text', text }] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
