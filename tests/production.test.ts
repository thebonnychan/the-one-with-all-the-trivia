import { describe, expect, it } from "vitest";
import questions from "../data/questions.json";
import {
  advanceQuestion,
  createSession,
  getResults,
  submitAnswer,
} from "../lib/game/engine";
import { DIFFICULTIES, type Question } from "../lib/game/types";
import { matchesTypedAnswer } from "../src/utils/answerValidation";

const bank = questions as Question[];

describe("production-bank playthroughs", () => {
  for (const mode of ["Classic", "Endless"] as const) {
    it.each([...DIFFICULTIES, "Mix"] as const)(
      `${mode} %s finishes without repeats or lost points`,
      (difficulty) => {
        const original = JSON.stringify(bank);
        let session = createSession(bank, mode, difficulty);
        const ids = new Set<string>();
        while (session.status === "playing") {
          const question = session.questions[session.index];
          expect(ids.has(question.id)).toBe(false);
          ids.add(question.id);
          session = submitAnswer(session, question.answer);
          expect(session.feedback?.correct).toBe(true);
          session = advanceQuestion(session);
        }
        const count =
          mode === "Classic"
            ? 25
            : difficulty === "Mix"
              ? 15 + bank.filter((q) => q.difficulty === "Extra Hard").length
              : bank.filter((q) => q.difficulty === difficulty).length;
        expect(ids.size).toBe(count);
        expect(session.status).toBe(
          mode === "Classic" ? "complete" : "exhausted",
        );
        expect(getResults(session)).toEqual({
          correct: count,
          incorrect: 0,
          answered: count,
          percentage: 100,
          bestStreak: count,
        });
        expect(JSON.stringify(bank)).toBe(original);
      },
    );
  }
  it("accepts every editorial typed alias and rejects unrelated text", () => {
    for (const question of bank) {
      if (question.kind !== "typed") continue;
      for (const alias of [question.answer, ...question.aliases]) {
        expect(
          matchesTypedAnswer(
            `  ${alias.toUpperCase()}!  `,
            question.answer,
            question.aliases,
            question.allowTypo,
          ),
          question.id,
        ).toBe(true);
      }
      expect(
        matchesTypedAnswer(
          "an unrelated answer",
          question.answer,
          question.aliases,
          question.allowTypo,
        ),
        question.id,
      ).toBe(false);
    }
  });
});
