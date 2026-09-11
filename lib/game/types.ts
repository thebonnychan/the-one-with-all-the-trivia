export const DIFFICULTIES = ["Easy", "Medium", "Hard", "Extra Hard"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];
export type DifficultySelection = Difficulty | "Mix";
export type Mode = "Classic" | "Endless";

interface QuestionBase {
  id: string;
  /** Editorial key for detecting reworded questions about the same fact. */
  factId: string;
  prompt: string;
  answer: string;
  explanation: string;
  source: { episode: string; evidence: string; url?: string };
  reviewed: boolean;
}

export type Question = QuestionBase &
  (
    | {
        difficulty: Exclude<Difficulty, "Extra Hard">;
        kind: "multiple-choice";
        options: [string, string, string, string];
      }
    | {
        difficulty: "Extra Hard";
        kind: "typed";
        aliases: string[];
        allowTypo: boolean;
      }
  );

export interface Session {
  mode: Mode;
  difficulty: DifficultySelection;
  questions: readonly Question[];
  index: number;
  score: number;
  answered: number;
  streak: number;
  bestStreak: number;
  feedback: { correct: boolean; answer: string } | null;
  status: "playing" | "complete" | "exhausted" | "ended";
}
