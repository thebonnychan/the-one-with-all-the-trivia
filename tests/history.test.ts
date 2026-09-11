import { afterEach, describe, expect, it, vi } from "vitest";
import { createSession } from "../lib/game/engine";
import {
  markQuestionSeen,
  readHistory,
  saveHistory,
  HISTORY_KEY,
} from "../lib/game/history";
import { makeBank } from "./fixtures";

const random = () => 0.37;
afterEach(() => vi.unstubAllGlobals());
describe("Classic question cycles", () => {
  it("exhausts a pool across rounds, including a mid-round rollover", () => {
    const bank = makeBank(30);
    let history: string[] = [];
    const shown: string[] = [];
    for (let round = 0; round < 3; round++) {
      const game = createSession(bank, "Classic", "Easy", random, history);
      expect(new Set(game.questions.map((q) => q.id)).size).toBe(25);
      for (const q of game.questions) {
        shown.push(q.id);
        history = markQuestionSeen(history, q, bank);
      }
    }
    expect(new Set(shown.slice(0, 30)).size).toBe(30);
    expect(new Set(shown.slice(30, 60)).size).toBe(30);
  });
  it("shares history between Classic Mix and single difficulties without marking unseen questions", () => {
    const bank = makeBank(30);
    const mix = createSession(bank, "Classic", "Mix", random);
    const first = mix.questions[0];
    const history = markQuestionSeen([], first, bank);
    expect(history).toEqual([first.id]);
    const easy = createSession(bank, "Classic", "Easy", random, history);
    expect(easy.questions.some((q) => q.id === first.id)).toBe(false);
    const mixAgain = createSession(bank, "Classic", "Mix", random, history);
    expect(mixAgain.questions.some((q) => q.id === first.id)).toBe(false);
  });
  it("makes newly added questions eligible and drops removed IDs", () => {
    const bank = makeBank(31);
    const q = bank.find((q) => q.difficulty === "Easy")!;
    expect(markQuestionSeen(["removed"], q, bank)).toEqual([q.id]);
    const old = bank
      .filter((q) => q.difficulty === "Easy")
      .slice(0, 30)
      .map((q) => q.id);
    const game = createSession(bank, "Classic", "Easy", random, old);
    expect(old).not.toContain(game.questions[0].id);
  });
  it("persists across reloads and survives corrupt, blocked, or full storage", () => {
    const values = new Map<string, string>();
    const setItem = vi.fn((key: string, value: string) =>
      values.set(key, value),
    );
    vi.stubGlobal("window", {
      localStorage: { getItem: (key: string) => values.get(key), setItem },
    });
    expect(saveHistory(["a", "b"])).toBe(true);
    expect(readHistory()).toEqual(["a", "b"]);
    values.set(HISTORY_KEY, '{"invalid":true}');
    expect(readHistory(["fallback"])).toEqual(["fallback"]);
    setItem.mockImplementation(() => {
      throw new Error("full");
    });
    expect(saveHistory(["a"])).toBe(false);
    vi.stubGlobal("window", {
      get localStorage() {
        throw new Error("blocked");
      },
    });
    expect(readHistory(["memory"])).toEqual(["memory"]);
  });
});
