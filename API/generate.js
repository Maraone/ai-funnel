// api/generate.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { systemPrompt, userQuery } = req.body || {};
  if (!userQuery) {
    return res.status(400).json({ message: 'userQuery required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ message: 'Missing API key' });
  }

  const url =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' +
    apiKey;

  const payload = {
    systemInstruction: { parts: [{ text: systemPrompt || '' }] },
    contents: [{ parts: [{ text: userQuery }] }],
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return res.status(500).json({ message: 'Gemini error' });
    }

    const data = await response.json();
    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      'No prompt generated.';

    return res.status(200).json({ text });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}
