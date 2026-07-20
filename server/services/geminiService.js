export async function askGemini(prompt) {
  const start = Date.now();
  const res = await fetch(
`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an academic performance assistant. Reply with ONLY valid JSON: {"predictedFinalGrade": string, "risk": "low"|"medium"|"high", "recommendation": string, "confidence": number between 0 and 1}.\n\n${prompt}`,
          }],
        }],
      }),
    }
  );

  if (!res.ok) {
  const errorBody = await res.text();
  throw new Error(`Gemini HTTP ${res.status}: ${errorBody}`);
}

  const data = await res.json();
  const raw = data.candidates[0].content.parts[0].text;
  const parsed = safeJsonParse(raw);

  return { modelUsed: 'gemini', responseTimeMs: Date.now() - start, ...parsed };
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return { predictedFinalGrade: null, risk: null, recommendation: text, confidence: 0.1 };
  }
}