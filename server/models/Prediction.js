import mongoose from 'mongoose';

const predictionSchema = new mongoose.Schema({
  studentData: Object,
  modelUsed: String,
  switched: Boolean,
  switchReason: String,
  confidence: Number,
  prediction: Object,
  responseTimeMs: Number,
  actualFinalGrade: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Prediction', predictionSchema);