import { storageKey, type SeriesId } from "../series";
import type { DifficultySelection, Session } from "./types";

export const RECORDS_KEY = "the-one-with-all-the-trivia.records.v1";
export interface Records {
  classic: Partial<Record<DifficultySelection, number>>;
  bestStreak: number;
  endlessHighScore: number;
}
export const emptyRecords = (): Records => ({
  classic: {},
  bestStreak: 0,
  endlessHighScore: 0,
});
export function parseRecords(raw: string | null): Records {
  try {
    const input = JSON.parse(raw || "null");
    if (!input || typeof input !== "object") return emptyRecords();
    const result = emptyRecords();
    for (const difficulty of [
      "Easy",
      "Medium",
      "Hard",
      "Extra Hard",
      "Mix",
    ] as const) {
      const value = input.classic?.[difficulty];
      if (Number.isInteger(value) && value >= 0 && value <= 25)
        result.classic[difficulty] = value;
    }
    if (
      Number.isInteger(input.bestStreak) &&
      input.bestStreak >= 0 &&
      input.bestStreak <= 100000
    )
      result.bestStreak = input.bestStreak;
    if (
      Number.isInteger(input.endlessHighScore) &&
      input.endlessHighScore >= 0 &&
      input.endlessHighScore <= 100000
    )
      result.endlessHighScore = input.endlessHighScore;
    return result;
  } catch {
    return emptyRecords();
  }
}
export function readRecords(series: SeriesId = "friends"): Records {
  try {
    return parseRecords(
      window.localStorage.getItem(storageKey(RECORDS_KEY, series)),
    );
  } catch {
    return emptyRecords();
  }
}
export function recordSession(records: Records, session: Session): Records {
  const classic = { ...records.classic };
  if (session.mode === "Classic" && session.status === "complete") {
    classic[session.difficulty] = Math.max(
      classic[session.difficulty] ?? 0,
      session.score,
    );
  }
  return {
    classic,
    endlessHighScore: Math.max(
      records.endlessHighScore,
      session.mode === "Endless" ? session.score : 0,
    ),
    bestStreak: Math.max(records.bestStreak, session.bestStreak),
  };
}
export function saveRecords(
  records: Records,
  series: SeriesId = "friends",
): boolean {
  try {
    window.localStorage.setItem(
      storageKey(RECORDS_KEY, series),
      JSON.stringify(records),
    );
    return true;
  } catch {
    return false;
  }
}
