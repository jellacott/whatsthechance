import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('API key missing');
      return NextResponse.json({ error: 'API key is missing' }, { status: 500 });
    }

    const systemInstruction = `You are a precise statistical probability estimation engine. Given a query starting with "What's the chance...", return a JSON object with a single field "denominator" representing "1 in N". Only return valid JSON like {"denominator": 1514123}. No markdown formatting, no explanations, no emojis.`;

    const userPrompt = `What's the chance ${prompt.trim()}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: `${systemInstruction}\n\nQuery: ${userPrompt}` }],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API Error:', errText);
      return NextResponse.json({ error: 'AI generation failed' }, { status: 500 });
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Clean up any potential markdown formatting from AI output
    const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanJson);

    return NextResponse.json({ denominator: parsedData.denominator });
  } catch (err) {
    console.error('Server side error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
