import { describe, expect, it } from "vitest";
import {
  advanceQuestion,
  createSession,
  submitAnswer,
} from "../lib/game/engine";
import { DIFFICULTIES, type Session } from "../lib/game/types";
import { makeBank } from "./fixtures";

const bank = makeBank(30);
const random = () => 0.37;
function finish(session: Session) {
  let current = session;
  while (current.status === "playing") {
    current = advanceQuestion(
      submitAnswer(current, current.questions[current.index].answer),
    );
  }
  return current;
}

describe("Classic", () => {
  it.each([...DIFFICULTIES, "Mix"] as const)(
    "selects exactly 25 unique questions for %s",
    (difficulty) => {
      const game = createSession(bank, "Classic", difficulty, random);
      expect(game.questions).toHaveLength(25);
      expect(new Set(game.questions.map((q) => q.id)).size).toBe(25);
      if (difficulty !== "Mix")
        expect(game.questions.every((q) => q.difficulty === difficulty)).toBe(
          true,
        );
    },
  );
  it("preserves the exact Mix tier and answer-type order", () => {
    const questions = createSession(bank, "Classic", "Mix", random).questions;
    expect(questions.map((q) => q.difficulty)).toEqual([
      ...Array(6).fill("Easy"),
      ...Array(6).fill("Medium"),
      ...Array(7).fill("Hard"),
      ...Array(6).fill("Extra Hard"),
    ]);
    expect(
      questions.slice(0, 19).every((q) => q.kind === "multiple-choice"),
    ).toBe(true);
    expect(questions.slice(19).every((q) => q.kind === "typed")).toBe(true);
  });
  it("fails instead of shortening an undersized round", () => {
    expect(() => createSession(makeBank(24), "Classic", "Easy")).toThrow(
      "Not enough",
    );
    expect(() => createSession(makeBank(6), "Classic", "Mix")).toThrow(
      "Not enough Hard",
    );
  });
  it("completes after exactly 25 answers", () => {
    const result = finish(createSession(bank, "Classic", "Mix", random));
    expect(result.status).toBe("complete");
    expect(result.score).toBe(25);
    expect(result.index).toBe(24);
    expect(submitAnswer(result, "Correct answer")).toBe(result);
  });
});

describe("Endless", () => {
  it("uses each question once and explicitly reports exhaustion", () => {
    const session = createSession(bank, "Endless", "Mix", random);
    expect(session.questions).toHaveLength(45);
    expect(new Set(session.questions.map((q) => q.id)).size).toBe(45);
    expect(
      session.questions.map((q) => DIFFICULTIES.indexOf(q.difficulty)),
    ).toEqual([
      ...Array(5).fill(0),
      ...Array(5).fill(1),
      ...Array(5).fill(2),
      ...Array(30).fill(3),
    ]);
    const result = finish(session);
    expect(result.status).toBe("exhausted");
    expect(result.score).toBe(45);
    expect(advanceQuestion(result)).toBe(result);
  });
  it("never draws outside the selected tier", () => {
    const session = createSession(bank, "Endless", "Hard", random);
    expect(session.questions).toHaveLength(30);
    expect(session.questions.every((q) => q.difficulty === "Hard")).toBe(true);
  });
  it("rejects an empty pool and duplicate IDs", () => {
    expect(() => createSession([], "Endless", "Mix")).toThrow();
    expect(() => createSession([...bank, bank[0]], "Endless", "Easy")).toThrow(
      "unique",
    );
  });
});

describe("answer transitions", () => {
  it("requires an answer before advancing and prevents double scoring", () => {
    const start = createSession(bank, "Classic", "Easy", random);
    expect(advanceQuestion(start)).toBe(start);
    expect(submitAnswer(start, " ")).toBe(start);
    expect(submitAnswer(start, "not an option")).toBe(start);
    const answered = submitAnswer(start, "Correct answer");
    expect(answered.score).toBe(1);
    expect(submitAnswer(answered, "Correct answer")).toBe(answered);
  });
  it("resets the current streak on a miss while preserving the best", () => {
    let session = createSession(bank, "Classic", "Easy", random);
    session = advanceQuestion(submitAnswer(session, "Correct answer"));
    session = advanceQuestion(submitAnswer(session, "Correct answer"));
    session = submitAnswer(session, "Alternative one");
    expect(session).toMatchObject({
      score: 2,
      streak: 0,
      bestStreak: 2,
      feedback: { correct: false },
    });
  });
  it("uses the typed-answer policy for Extra Hard", () => {
    const session = createSession(bank, "Classic", "Extra Hard", random);
    expect(submitAnswer(session, " CORRECT   ANSWER! ").feedback?.correct).toBe(
      true,
    );
  });
  it("shuffles deterministically with an injected random source without changing the bank", () => {
    const before = JSON.stringify(bank);
    const first = createSession(bank, "Classic", "Easy", random);
    expect(first).toEqual(createSession(bank, "Classic", "Easy", random));
    expect(first.questions.map((q) => q.id)).not.toEqual(
      bank.slice(0, 25).map((q) => q.id),
    );
    expect(JSON.stringify(bank)).toBe(before);
    expect(() => createSession(bank, "Classic", "Easy", () => 1)).toThrow(
      "Random source",
    );
  });
});
