import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key is missing' }, { status: 500 });
    }

    const fullQuery = `What's the chance ${prompt.trim()}`;

    const systemPrompt = `
      You are a precise statistical probability estimation engine for whatsthechance.com.
      Given a user query starting with "What's the chance...", calculate or estimate realistic, scientifically grounded, or contextually logical odds for the event happening.
      
      Respond STRICTLY with a valid JSON object in this format:
      {"denominator": 1514123}
      
      Rules:
      - The denominator integer represents "1 in N".
      - Return ONLY the JSON object. Do not include markdown code blocks (\`\`\`json), explanations, or emojis.
      - If an event is standard or daily (e.g. raining in Seattle), denominator should be small (e.g. 2, 5, 10).
      - If an event is extremely rare (e.g. hit by a meteorite), denominator should be large (e.g. 250000000).
    `;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: `${systemPrompt}\n\nUser Query: ${fullQuery}` }],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API Error:', errText);
      return NextResponse.json({ error: 'AI generation failed' }, { status: 500 });
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsedData = JSON.parse(rawText);

    return NextResponse.json({ denominator: parsedData.denominator });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
