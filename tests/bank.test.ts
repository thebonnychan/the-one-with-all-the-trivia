import { describe, expect, it } from "vitest";
import questions from "../data/questions.json";
import { validateBank } from "../lib/game/validate-bank";
import { makeBank } from "./fixtures";

describe("question bank validation", () => {
  it("requires the full production bank to pass launch validation", () => {
    expect(validateBank(questions, true)).toEqual([]);
    for (const difficulty of ["Easy", "Medium", "Hard", "Extra Hard"]) {
      expect(
        questions.filter((q) => q.difficulty === difficulty).length,
      ).toBeGreaterThanOrEqual(500);
    }
    expect(
      new Set(questions.map((q) => q.source.episode.slice(1, 3))).size,
    ).toBe(10);
    expect(
      questions.every((q) =>
        q.source.url.startsWith("https://www.livesinabox.com/friends/"),
      ),
    ).toBe(true);
  });
  it("requires 2000 questions and enough questions for every Classic tier at launch", () => {
    expect(validateBank(makeBank(500), true)).toEqual([]);
    expect(validateBank(makeBank(499), true)).toContain(
      "Launch requires at least 2000 questions; found 1996.",
    );
    const uneven = makeBank(170).filter((q) => q.difficulty !== "Hard");
    expect(validateBank(uneven, true)).toContain(
      "Hard: at least 25 questions are required for Classic.",
    );
  });
  it("rejects duplicate IDs, reworded facts, and normalized prompts", () => {
    const bank = makeBank(1);
    bank[1] = {
      ...bank[1],
      id: bank[0].id,
      factId: bank[0].factId,
      prompt: bank[0].prompt.toUpperCase(),
    };
    expect(validateBank(bank)).toEqual(
      expect.arrayContaining([
        "Question 2: duplicate id.",
        "Question 2: duplicate factId.",
        "Question 2: duplicate prompt.",
      ]),
    );
  });
  it("rejects invalid answer choices and incorrect answer types", () => {
    const bank = makeBank(1);
    expect(
      validateBank([{ ...bank[0], options: ["A", "a!", "B", "C"] }]).length,
    ).toBeGreaterThan(0);
    expect(
      validateBank([{ ...bank[3], kind: "multiple-choice" }]).length,
    ).toBeGreaterThan(0);
    expect(
      validateBank([{ ...bank[0], answer: "absent" }]).length,
    ).toBeGreaterThan(0);
  });
  it("requires sources and explicit editorial review for launch", () => {
    const bank = makeBank(500);
    bank[0].reviewed = false;
    bank[0].source.evidence = "";
    expect(validateBank(bank, true)).toEqual(
      expect.arrayContaining([
        "Question 1: editorial review is required.",
        "Question 1: include an episode reference and specific verification evidence.",
      ]),
    );
  });
  it("returns errors for malformed input rather than crashing", () => {
    for (const input of [null, {}, [null], [1], [{}], [{ source: 1 }]]) {
      expect(validateBank(input).length).toBeGreaterThan(0);
    }
  });
});

it("allows one typed variant of a multiple-choice fact but rejects duplicate variants", () => {
  const bank = makeBank(1);
  bank[3] = { ...bank[3], factId: bank[0].factId };
  expect(validateBank(bank)).toEqual([]);
  const duplicate = {
    ...bank[3],
    id: "another-id",
    prompt: "Another typed prompt?",
  };
  expect(validateBank([...bank, duplicate])).toContain(
    "Question 5: duplicate factId.",
  );
});

it("keeps explicit first-name and surname recall rare in Friends Extra Hard", () => {
  const typed = questions.filter((q) => q.difficulty === "Extra Hard");
  expect(typed).toHaveLength(500);
  const nameRecall = typed.filter((q) =>
    /first name|full name|surname/i.test(q.prompt),
  );
  // Editorial guardrail for the user's request; broader name questions still
  // need human review because wording alone cannot classify every answer.
  expect(nameRecall.length).toBeLessThanOrEqual(15);
});

it("gives replacement Friends questions new IDs and pairs each with one reviewed Hard fact", () => {
  const replacements = questions.filter((q) => Number(q.id.slice(8)) > 2000);
  expect(replacements).toHaveLength(125);
  for (const question of replacements) {
    expect(question.kind).toBe("typed");
    expect(question.difficulty).toBe("Extra Hard");
    expect(question.prompt).toContain("____");
    const partners = questions.filter(
      (other) => other.factId === question.factId && other.id !== question.id,
    );
    expect(partners).toHaveLength(1);
    expect(partners[0].difficulty).toBe("Hard");
    expect(question.source).toEqual(partners[0].source);
  }
});
