import { describe, expect, it, vi, afterEach } from "vitest";
import {
  createSession,
  submitAnswer,
  advanceQuestion,
  endSession,
  getResults,
} from "../lib/game/engine";
import {
  parseRecords,
  emptyRecords,
  recordSession,
  saveRecords,
  readRecords,
  RECORDS_KEY,
} from "../lib/game/records";
import type { DifficultySelection, Mode, Question } from "../lib/game/types";
import { makeBank } from "./fixtures";

afterEach(() => vi.unstubAllGlobals());
describe("results and invalid inputs", () => {
  it("counts a manual ending without treating the unseen question as incorrect", () => {
    let game = createSession(makeBank(), "Endless", "Mix");
    game = advanceQuestion(submitAnswer(game, "Correct answer"));
    game = submitAnswer(game, "Alternative one");
    const result = endSession(game);
    expect(result.status).toBe("ended");
    expect(getResults(result)).toEqual({
      correct: 1,
      incorrect: 1,
      answered: 2,
      percentage: 50,
      bestStreak: 1,
    });
    expect(submitAnswer(result, "Correct answer")).toBe(result);
  });
  it("returns zero percent for a run ended before any answers", () => {
    const game = endSession(createSession(makeBank(), "Endless", "Easy"));
    expect(getResults(game).percentage).toBe(0);
    expect(getResults(game).incorrect).toBe(0);
  });
  it("calculates complete Classic percentage and incorrect answers", () => {
    let game = createSession(makeBank(), "Classic", "Easy");
    for (let i = 0; i < 25; i++)
      game = advanceQuestion(
        submitAnswer(game, i < 19 ? "Correct answer" : "Alternative one"),
      );
    expect(getResults(game)).toMatchObject({
      correct: 19,
      incorrect: 6,
      answered: 25,
      percentage: 76,
    });
  });
  it("rejects unsupported modes, difficulties, and malformed data", () => {
    expect(() => createSession(makeBank(), "Arcade" as Mode, "Easy")).toThrow(
      "mode",
    );
    expect(() =>
      createSession(makeBank(), "Classic", "Impossible" as DifficultySelection),
    ).toThrow("difficulty");
    expect(() => createSession([{}] as Question[], "Classic", "Easy")).toThrow(
      "data",
    );
  });
  it("requires five questions in the first three Endless Mix stages", () => {
    expect(() => createSession(makeBank(4), "Endless", "Mix")).toThrow(
      "Not enough",
    );
  });
});

describe("records", () => {
  it("ignores corrupt JSON and impossible persisted values", () => {
    for (const raw of ["oops", "null", "[]", "42", "{}"])
      expect(parseRecords(raw)).toEqual(emptyRecords());
    expect(
      parseRecords(
        JSON.stringify({
          classic: { Easy: 28, Hard: -1, Mix: "25", Medium: 15 },
          bestStreak: -4,
        }),
      ),
    ).toEqual({ classic: { Medium: 15 }, bestStreak: 0 });
  });
  it("saves a completed Classic best per difficulty without lowering records", () => {
    let game = createSession(makeBank(), "Classic", "Easy");
    for (let i = 0; i < 25; i++)
      game = advanceQuestion(submitAnswer(game, "Correct answer"));
    const records = recordSession(
      { classic: { Hard: 20 }, bestStreak: 40 },
      game,
    );
    expect(records).toEqual({
      classic: { Hard: 20, Easy: 25 },
      bestStreak: 40,
    });
    const incomplete = endSession(createSession(makeBank(), "Classic", "Mix"));
    expect(recordSession(records, incomplete)).toEqual(records);
  });
  it("stores a streak from Endless without creating a Classic score", () => {
    const game = endSession(
      submitAnswer(
        createSession(makeBank(), "Endless", "Easy"),
        "Correct answer",
      ),
    );
    expect(recordSession(emptyRecords(), game)).toEqual({
      classic: {},
      bestStreak: 1,
    });
  });
  it("survives blocked or unavailable browser storage", () => {
    vi.stubGlobal("window", {
      get localStorage() {
        throw new Error("blocked");
      },
    });
    expect(readRecords()).toEqual(emptyRecords());
    expect(saveRecords(emptyRecords())).toBe(false);
  });
  it("round-trips records and handles storage quota failures", () => {
    const values = new Map<string, string>();
    const setItem = vi.fn((key: string, value: string) => {
      values.set(key, value);
    });
    vi.stubGlobal("window", {
      localStorage: { getItem: (key: string) => values.get(key), setItem },
    });
    const records = { classic: { Mix: 21 }, bestStreak: 17 };
    expect(saveRecords(records)).toBe(true);
    expect(setItem).toHaveBeenCalledWith(RECORDS_KEY, JSON.stringify(records));
    expect(readRecords()).toEqual(records);
    setItem.mockImplementation(() => {
      throw new Error("Quota exceeded");
    });
    expect(saveRecords(records)).toBe(false);
  });
});
