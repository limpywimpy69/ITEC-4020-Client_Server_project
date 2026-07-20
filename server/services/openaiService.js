export async function askOpenAI(prompt) {
  const start = Date.now();
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an academic performance assistant. Always reply with ONLY valid JSON: {"predictedFinalGrade": string, "risk": "low"|"medium"|"high", "recommendation": string, "confidence": number between 0 and 1}.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`OpenAI HTTP ${res.status}: ${errorBody}`);
  }

  const data = await res.json();
  const raw = data.choices[0].message.content;
  const parsed = safeJsonParse(raw);

  return {
    modelUsed: 'openai',
    responseTimeMs: Date.now() - start,
    ...parsed,
  };
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return { predictedFinalGrade: null, risk: null, recommendation: text, confidence: 0.1 };
  }
}