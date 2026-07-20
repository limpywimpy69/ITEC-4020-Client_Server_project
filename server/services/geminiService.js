export async function askGemini(prompt, retries = 2) {
  const start = Date.now();

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
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
        const isRetryable = res.status === 503 || res.status === 429;
        if (isRetryable && attempt < retries) {
          console.log(`Gemini ${res.status}, retrying (attempt ${attempt + 1}/${retries})...`);
          await new Promise(r => setTimeout(r, 1500 * (attempt + 1)));
          continue;
        }
        throw new Error(`Gemini HTTP ${res.status}: ${errorBody}`);
      }

      const data = await res.json();
      const raw = data.candidates[0].content.parts[0].text;
      const parsed = safeJsonParse(raw);

      return { modelUsed: 'gemini', responseTimeMs: Date.now() - start, ...parsed };
    } catch (err) {
      if (attempt === retries) throw err;
    }
  }
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return { predictedFinalGrade: null, risk: null, recommendation: text, confidence: 0.1 };
  }
}