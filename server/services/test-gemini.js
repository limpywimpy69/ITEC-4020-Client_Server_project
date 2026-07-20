import 'dotenv/config';
import { askGemini } from './geminiService.js';

askGemini('Given this student profile: {"StudyHours": 5, "Attendance": 78}, predict their final grade category, risk level, and give one study recommendation.')
  .then(console.log)
  .catch(console.error);