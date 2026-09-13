import type { Question } from "./game/types";

export const SERIES = {
  friends: {
    name: "Friends",
    title: "The One With All the Trivia",
    subtitle: "How well do you really know Friends?",
  },
  "bobs-burgers": {
    name: "Bob's Burgers",
    title: "Lettuce Do Trivia.",
    subtitle: "You're terrible. You're all terrible.",
  },
} as const;
export type SeriesId = keyof typeof SERIES;

/** Keep the original Friends keys so existing records need no migration. */
export function storageKey(key: string, series: SeriesId): string {
  return series === "friends" ? key : `${key}.${series}`;
}
export async function loadBank(series: SeriesId): Promise<Question[]> {
  const data =
    series === "friends"
      ? await import("../data/questions.json")
      : await import("../data/bobs-burgers.json");
  return data.default as Question[];
}
