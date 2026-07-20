import express from 'express';
import Prediction from '../models/Prediction.js';

const router = express.Router();

router.get('/summary', async (req, res) => {
  const total = await Prediction.countDocuments();
  const withActual = await Prediction.find({ actualFinalGrade: { $ne: null } });
  const correct = withActual.filter(p => p.prediction.predictedFinalGrade === p.actualFinalGrade).length;
  const avgResponseTime = withActual.reduce((sum, p) => sum + p.responseTimeMs, 0) / (withActual.length || 1);
  const switchRate = withActual.filter(p => p.switched).length / (withActual.length || 1);

  res.json({
    totalPredictions: total,
    evaluatedCount: withActual.length,
    accuracy: withActual.length ? correct / withActual.length : null,
    avgResponseTimeMs: avgResponseTime,
    modelSwitchRate: switchRate,
  });
});

export default router;