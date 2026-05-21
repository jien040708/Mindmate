export interface CnipScores {
  td: number;   // Therapist Directiveness: -15 to 15 (positive = AI-led)
  ei: number;   // Emotional Intensity: -15 to 15 (positive = emotion-focused)
  pao: number;  // Past Orientation: -9 to 9 (positive = past-focused)
  ws: number;   // Warm Support: -15 to 15 (positive = warm/supportive)
}

export interface Persona {
  id: string;
  name: string;
  mbti: string;
  description: string;
  color: string;
  icon?: string;
  cnipScores?: CnipScores;
  cnipValues?: number[]; // Q1–Q18, each -3 to 3
}
