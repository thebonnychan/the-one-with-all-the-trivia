import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import bobs from "../data/bobs-burgers.json";
import { loadBank, storageKey } from "../lib/series";
import { validateBank } from "../lib/game/validate-bank";
import {
  createSession,
  submitAnswer,
  advanceQuestion,
} from "../lib/game/engine";
import { DIFFICULTIES, type Question } from "../lib/game/types";
import {
  emptyRecords,
  readRecords,
  saveRecords,
  RECORDS_KEY,
} from "../lib/game/records";
import { readHistory, saveHistory, HISTORY_KEY } from "../lib/game/history";
import { matchesTypedAnswer } from "../src/utils/answerValidation";
import { GameSetup } from "../components/GameSetup";
import { ResultsCard } from "../components/ResultsCard";

const bank = bobs as Question[];
afterEach(() => vi.unstubAllGlobals());
describe("series-specific content", () => {
  it("launches with 1000 sourced Bob's Burgers questions across all 16 TV seasons", () => {
    expect(validateBank(bank, true, 1000)).toEqual([]);
    expect(bank).toHaveLength(1000);
    for (const tier of DIFFICULTIES)
      expect(bank.filter((q) => q.difficulty === tier)).toHaveLength(250);
    expect(
      new Set(bank.map((q) => Number(q.source.episode.slice(1, 3)))).size,
    ).toBe(16);
    expect(
      bank.every(
        (q) =>
          q.source.url?.startsWith("https://www.tvmaze.com/episodes/") ||
          q.source.url?.startsWith("https://en.wikipedia.org/wiki/"),
      ),
    ).toBe(true);
    expect(validateBank(bank.slice(1), true, 1000)).toContain(
      "Launch requires at least 1000 questions; found 999.",
    );
    for (const q of bank.filter((q) => q.kind === "typed")) {
      expect(q.prompt).toContain("____");
      expect(bank.filter((other) => other.factId === q.factId)).toHaveLength(2);
    }
  });
  it("loads only the requested series bank", async () => {
    const friends = await loadBank("friends");
    const burgers = await loadBank("bobs-burgers");
    expect(friends).toHaveLength(2000);
    expect(burgers).toHaveLength(1000);
    expect(friends.every((q) => q.id.startsWith("friends-"))).toBe(true);
    expect(burgers.every((q) => q.id.startsWith("bobs-"))).toBe(true);
  });
  it.each([...DIFFICULTIES, "Mix"] as const)(
    "completes Bob's Burgers Classic %s correctly",
    (difficulty) => {
      let game = createSession(bank, "Classic", difficulty);
      expect(game.questions).toHaveLength(25);
      if (difficulty === "Mix")
        expect(game.questions.map((q) => q.difficulty)).toEqual([
          ...Array(6).fill("Easy"),
          ...Array(6).fill("Medium"),
          ...Array(7).fill("Hard"),
          ...Array(6).fill("Extra Hard"),
        ]);
      while (game.status === "playing")
        game = advanceQuestion(
          submitAnswer(game, game.questions[game.index].answer),
        );
      expect(game.status).toBe("complete");
      expect(game.score).toBe(25);
    },
  );
  it("exhausts all 1000 Bob's Burgers questions in Endless without repeating IDs", () => {
    let game = createSession(bank, "Endless", "Mix");
    const seen = new Set();
    while (game.status === "playing") {
      const q = game.questions[game.index];
      expect(seen.has(q.id)).toBe(false);
      seen.add(q.id);
      game = advanceQuestion(submitAnswer(game, q.answer));
    }
    expect(game.status).toBe("exhausted");
    expect(game.score).toBe(1000);
  });
  it("accepts all typed aliases without accepting unrelated answers", () => {
    for (const q of bank) {
      if (q.kind !== "typed") continue;
      for (const value of [q.answer, ...q.aliases])
        expect(
          matchesTypedAnswer(
            ` ${value.toUpperCase()}! `,
            q.answer,
            q.aliases,
            q.allowTypo,
          ),
          q.id,
        ).toBe(true);
      expect(
        matchesTypedAnswer("I don't know", q.answer, q.aliases, q.allowTypo),
        q.id,
      ).toBe(false);
    }
  });
  it("renders Bob's Burgers wording in setup and results", () => {
    const html = renderToStaticMarkup(
      createElement(GameSetup, {
        series: "bobs-burgers",
        mode: "Classic",
        difficulty: "Mix",
        records: emptyRecords(),
        onMode: () => {},
        onDifficulty: () => {},
        onStart: () => {},
      }),
    );
    expect(html).toContain("Lettuce Do");
    expect(html).toContain("terrible");
    expect(html).not.toContain("How well do you really know Friends");
    const session = {
      ...createSession(bank, "Classic", "Mix"),
      status: "complete" as const,
      score: 25,
    };
    const results = renderToStaticMarkup(
      createElement(ResultsCard, {
        series: "bobs-burgers",
        session,
        onReplay: () => {},
        onHome: () => {},
      }),
    );
    expect(results).toContain("Lettuce Do Trivia.");
    expect(results).not.toContain("Monica");
  });
});

it("preserves legacy Friends keys and isolates both shows' scores and histories", () => {
  const legacy = {
    ...emptyRecords(),
    classic: { Mix: 23 },
    endlessHighScore: 22,
  };
  const values = new Map([
    [RECORDS_KEY, JSON.stringify(legacy)],
    [HISTORY_KEY, JSON.stringify(["friends-0001"])],
  ]);
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    },
  });
  expect(storageKey(RECORDS_KEY, "friends")).toBe(RECORDS_KEY);
  expect(readRecords("friends")).toEqual(legacy);
  expect(readRecords("bobs-burgers")).toEqual(emptyRecords());
  expect(
    saveRecords({ ...emptyRecords(), endlessHighScore: 7 }, "bobs-burgers"),
  ).toBe(true);
  expect(saveHistory(["bobs-0001"], "bobs-burgers")).toBe(true);
  expect(readRecords("friends")).toEqual(legacy);
  expect(readHistory([], "friends")).toEqual(["friends-0001"]);
  expect(readRecords("bobs-burgers").endlessHighScore).toBe(7);
  expect(readHistory([], "bobs-burgers")).toEqual(["bobs-0001"]);
});

it("keeps the Bob's Burgers Easy answers out of their question wording", () => {
  const words = (value: string) =>
    value
      .toLowerCase()
      .replace(/['’]s\b/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .trim()
      .replace(/\s+/g, " ");
  for (const question of bank.filter((q) => q.difficulty === "Easy")) {
    const answer = words(question.answer).replace(
      /^(a|an|the|her|his|their) /,
      "",
    );
    expect(` ${words(question.prompt)} `, question.id).not.toContain(
      ` ${answer} `,
    );
  }
  // Synonyms and title puns can leak answers even without an exact word match.
  for (const id of [
    "bobs-0012",
    "bobs-0139",
    "bobs-0151",
    "bobs-0214",
    "bobs-0246",
    "bobs-0314",
    "bobs-0348",
    "bobs-0351",
    "bobs-0366",
    "bobs-0374",
  ]) {
    expect(bank.find((q) => q.id === id)?.prompt, id).not.toMatch(/[“”]/);
  }
});

it("avoids sister clues in Bob's Burgers question prompts", () => {
  for (const question of bank)
    expect(question.prompt, question.id).not.toMatch(/\bsisters?\b/i);
});

it.each(DIFFICULTIES)(
  "offers newly added %s questions before repeating the old bank",
  (difficulty) => {
    const seen = bank
      .filter((q) => Number(q.id.slice(5)) <= 500)
      .map((q) => q.id);
    const game = createSession(bank, "Classic", difficulty, Math.random, seen);
    expect(game.questions).toHaveLength(25);
    expect(game.questions.every((q) => !seen.includes(q.id))).toBe(true);
  },
);

it("accepts alternate numeric formats for expanded typed answers without changing values", () => {
  const question = bank.find(
    (q) => q.kind === "typed" && q.answer === "14000 dollars",
  );
  if (!question || question.kind !== "typed")
    throw new Error("Missing numeric typed question");
  expect(
    matchesTypedAnswer(
      "$14,000",
      question.answer,
      question.aliases,
      question.allowTypo,
    ),
  ).toBe(true);
  expect(
    matchesTypedAnswer(
      "fourteen thousand dollars",
      question.answer,
      question.aliases,
      question.allowTypo,
    ),
  ).toBe(true);
  expect(
    matchesTypedAnswer(
      "1400",
      question.answer,
      question.aliases,
      question.allowTypo,
    ),
  ).toBe(false);
});
