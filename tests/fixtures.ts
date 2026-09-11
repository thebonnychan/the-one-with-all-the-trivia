import { DIFFICULTIES, type Question } from "../lib/game/types";

// Synthetic test inputs only. Never import these into application content.
export function makeBank(perTier = 25): Question[] {
  return DIFFICULTIES.flatMap((difficulty, tier) =>
    Array.from({ length: perTier }, (_, index): Question => {
      const base = {
        id: `test-${tier}-${index}`,
        factId: `test-fact-${tier}-${index}`,
        prompt: `Synthetic test prompt ${tier} ${index}?`,
        answer: "Correct answer",
        explanation: "Synthetic evidence for validator tests only.",
        source: { episode: "S01E01", evidence: "Synthetic test evidence." },
        reviewed: true,
      };
      return difficulty === "Extra Hard"
        ? { ...base, difficulty, kind: "typed", aliases: [], allowTypo: true }
        : {
            ...base,
            difficulty,
            kind: "multiple-choice",
            options: [
              "Correct answer",
              "Alternative one",
              "Alternative two",
              "Alternative three",
            ],
          };
    }),
  );
}
