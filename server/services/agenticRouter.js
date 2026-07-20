import { askOpenAI } from './openaiService.js';
import { askGemini } from './geminiService.js';

const THRESHOLD = parseFloat(process.env.CONFIDENCE_THRESHOLD || '0.6');

export async function routePrediction(prompt) {
  let result;

  try {
    result = await askOpenAI(prompt);
  } catch (err) {
    console.error('OpenAI failed, falling back to Gemini:', err.message);
    const fallback = await askGemini(prompt);
    return { ...fallback, switched: true, switchReason: 'openai_error' };
  }

  if (result.confidence == null || result.confidence < THRESHOLD) {
    console.log(`Low confidence (${result.confidence}) from OpenAI — routing to Gemini`);
    const fallback = await askGemini(prompt);
    return { ...fallback, switched: true, switchReason: 'low_confidence', primaryModelConfidence: result.confidence };
  }

  return { ...result, switched: false };
}