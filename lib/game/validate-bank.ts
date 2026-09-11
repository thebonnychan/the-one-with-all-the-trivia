import { normalizeAnswer } from "../../src/utils/answerValidation";
import { DIFFICULTIES } from "./types";

const isText = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

export function validateBank(input: unknown, launch = false): string[] {
  if (!Array.isArray(input)) return ["Question bank must be an array."];
  const errors: string[] = [];
  const seen = {
    id: new Set<string>(),
    factId: new Set<string>(),
    prompt: new Set<string>(),
  };
  const counts = new Map<string, number>();
  if (launch && input.length < 2000)
    errors.push(
      `Launch requires at least 2000 questions; found ${input.length}.`,
    );
  input.forEach((value: unknown, index) => {
    const label = `Question ${index + 1}`;
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      errors.push(`${label}: must be an object.`);
      return;
    }
    const q = value as Record<string, unknown>;
    for (const key of ["id", "factId", "prompt", "answer", "explanation"]) {
      if (!isText(q[key]) || !normalizeAnswer(q[key] as string))
        errors.push(`${label}: ${key} must contain text.`);
    }
    for (const key of ["id", "factId", "prompt"] as const) {
      if (!isText(q[key])) continue;
      const normalized =
        normalizeAnswer(q[key]) + (key === "factId" ? `:${q.kind}` : "");
      if (seen[key].has(normalized)) errors.push(`${label}: duplicate ${key}.`);
      seen[key].add(normalized);
    }
    if (!DIFFICULTIES.includes(q.difficulty as (typeof DIFFICULTIES)[number])) {
      errors.push(`${label}: invalid difficulty.`);
    } else {
      counts.set(
        q.difficulty as string,
        (counts.get(q.difficulty as string) || 0) + 1,
      );
    }
    const source = q.source as Record<string, unknown> | undefined;
    if (
      !source ||
      !isText(source.episode) ||
      !/^S(?:0[1-9]|10)E(?:0[1-9]|1\d|2[0-5])$/.test(source.episode) ||
      !isText(source.evidence)
    ) {
      errors.push(
        `${label}: include an episode reference and specific verification evidence.`,
      );
    }
    if (typeof q.reviewed !== "boolean" || (launch && !q.reviewed)) {
      errors.push(
        `${label}: ${launch ? "editorial review is required" : "reviewed must be a boolean"}.`,
      );
    }
    if (q.difficulty === "Extra Hard") {
      if (
        q.kind !== "typed" ||
        "options" in q ||
        !Array.isArray(q.aliases) ||
        !q.aliases.every(isText) ||
        typeof q.allowTypo !== "boolean"
      ) {
        errors.push(
          `${label}: Extra Hard requires typed answers, aliases, and an explicit typo policy, without options.`,
        );
      }
    } else if (
      q.kind !== "multiple-choice" ||
      !Array.isArray(q.options) ||
      q.options.length !== 4 ||
      !q.options.every(isText)
    ) {
      errors.push(
        `${label}: multiple-choice questions require four nonempty options.`,
      );
    } else {
      if (new Set(q.options.map(normalizeAnswer)).size !== 4)
        errors.push(`${label}: options must be distinct.`);
      if (!isText(q.answer) || !q.options.includes(q.answer))
        errors.push(`${label}: answer must exactly match one option.`);
    }
  });
  if (launch) {
    for (const difficulty of DIFFICULTIES) {
      if ((counts.get(difficulty) || 0) < 25)
        errors.push(
          `${difficulty}: at least 25 questions are required for Classic.`,
        );
    }
  }
  return errors;
}
