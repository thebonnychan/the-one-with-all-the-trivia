import type { Question } from "./types";

export const HISTORY_KEY = "the-one-with-all-the-trivia.classic-history.v1";
export type ClassicHistory = string[];

export function readHistory(fallback: ClassicHistory = []): ClassicHistory {
  try {
    const value: unknown = JSON.parse(
      window.localStorage.getItem(HISTORY_KEY) || "null",
    );
    return Array.isArray(value) && value.every((id) => typeof id === "string")
      ? [...new Set(value)]
      : fallback;
  } catch {
    return fallback;
  }
}

export function saveHistory(history: ClassicHistory): boolean {
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    return true;
  } catch {
    return false;
  }
}

/** Mark only the question actually displayed; reset a tier after its full cycle. */
export function markQuestionSeen(
  history: ClassicHistory,
  question: Question,
  bank: readonly Question[],
): ClassicHistory {
  const valid = new Set(bank.map((q) => q.id));
  let seen = new Set(history.filter((id) => valid.has(id)));
  const tier = bank.filter((q) => q.difficulty === question.difficulty);
  if (tier.every((q) => seen.has(q.id))) {
    const tierIds = new Set(tier.map((q) => q.id));
    seen = new Set([...seen].filter((id) => !tierIds.has(id)));
  }
  seen.add(question.id);
  return [...seen];
}
