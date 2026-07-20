export function buildPrompt(studentData) {
  return `Given this student profile: ${JSON.stringify(studentData)}, predict their final grade category (A/B/C/D/F), assess their academic risk level, and give one concrete study recommendation.`;
}