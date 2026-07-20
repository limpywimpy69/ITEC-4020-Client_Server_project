import { routePrediction } from '../services/agenticRouter.js';
import { buildPrompt } from '../services/promptBuilder.js';
import Prediction from '../models/Prediction.js';

export function handleConnection(ws) {
  ws.on('message', async (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }));
    }

    if (msg.type !== 'predict') return;

    try {
      const prompt = buildPrompt(msg.studentData);
      const result = await routePrediction(prompt);

      const saved = await Prediction.create({
        studentData: msg.studentData,
        modelUsed: result.modelUsed,
        switched: result.switched,
        switchReason: result.switchReason,
        confidence: result.confidence,
        prediction: {
          predictedFinalGrade: result.predictedFinalGrade,
          risk: result.risk,
          recommendation: result.recommendation,
        },
        responseTimeMs: result.responseTimeMs,
      });

      ws.send(JSON.stringify({
        type: 'predictionResult',
        modelUsed: result.modelUsed,
        confidence: result.confidence,
        prediction: saved.prediction,
        responseTimeMs: result.responseTimeMs,
        switched: result.switched,
      }));
    } catch (err) {
      console.error(err);
      ws.send(JSON.stringify({ type: 'error', message: 'Prediction failed' }));
    }
  });
}