import { matchesTypedAnswer } from "../../src/utils/answerValidation";
import { shuffled } from "../../src/utils/shuffle";
import { validateBank } from "./validate-bank";
import {
  DIFFICULTIES,
  type DifficultySelection,
  type Mode,
  type Question,
  type Session,
} from "./types";

export const CLASSIC_LENGTH = 25;
export const MIX_COUNTS = [6, 6, 7, 6] as const;

export function createSession(
  bank: readonly Question[],
  mode: Mode,
  difficulty: DifficultySelection,
  random: () => number = Math.random,
  seenIds: readonly string[] = [],
): Session {
  if (mode !== "Classic" && mode !== "Endless")
    throw new Error("Choose a valid game mode.");
  if (difficulty !== "Mix" && !DIFFICULTIES.includes(difficulty))
    throw new Error("Choose a valid difficulty.");
  if (!Array.isArray(bank)) throw new Error("Question bank must be an array.");
  if (new Set(bank.map((q) => q.id)).size !== bank.length) {
    throw new Error("Question IDs must be unique.");
  }
  const errors = validateBank(bank);
  if (errors.length)
    throw new Error(`Question data needs attention: ${errors[0]}`);
  const seen = new Set(seenIds);
  const tiers = difficulty === "Mix" ? DIFFICULTIES : [difficulty];
  const selected =
    mode === "Endless"
      ? shuffled(bank, random)
      : tiers.flatMap((tier, i) => {
          const pool = bank.filter((q) => q.difficulty === tier);
          const count = difficulty === "Mix" ? MIX_COUNTS[i] : CLASSIC_LENGTH;
          if (pool.length < count)
            throw new Error(
              `Not enough ${tier} questions for Classic ${difficulty}.`,
            );
          // Consume the unseen remainder before rolling into the next cycle. Each
          // round remains unique, including rounds that straddle a cycle boundary.
          return [
            ...shuffled(
              pool.filter((q) => !seen.has(q.id)),
              random,
            ),
            ...shuffled(
              pool.filter((q) => seen.has(q.id)),
              random,
            ),
          ].slice(0, count);
        });
  if (!selected.length) throw new Error("Not enough questions for Endless.");
  const questions = selected.map((q): Question =>
    q.kind === "multiple-choice"
      ? {
          ...q,
          options: shuffled(q.options, random) as [
            string,
            string,
            string,
            string,
          ],
        }
      : { ...q, aliases: [...q.aliases] },
  );
  return {
    mode,
    difficulty: mode === "Endless" ? "Mix" : difficulty,
    questions,
    index: 0,
    score: 0,
    answered: 0,
    streak: 0,
    bestStreak: 0,
    feedback: null,
    status: "playing",
  };
}

export function submitAnswer(session: Session, answer: string): Session {
  if (session.status !== "playing" || session.feedback) return session;
  const question = session.questions[session.index];
  if (!question || !answer.trim()) return session;
  if (question.kind === "multiple-choice" && !question.options.includes(answer))
    return session;
  const correct =
    question.kind === "typed"
      ? matchesTypedAnswer(
          answer,
          question.answer,
          question.aliases,
          question.allowTypo,
        )
      : answer === question.answer;
  const streak = correct ? session.streak + 1 : 0;
  return {
    ...session,
    score: session.score + (correct ? 1 : 0),
    answered: session.answered + 1,
    streak,
    bestStreak: Math.max(streak, session.bestStreak),
    feedback: { correct, answer: question.answer },
  };
}

export function endSession(session: Session): Session {
  return session.status === "playing"
    ? { ...session, status: "ended" }
    : session;
}

export function getResults(session: Session) {
  return {
    correct: session.score,
    incorrect: session.answered - session.score,
    answered: session.answered,
    percentage:
      session.answered === 0
        ? 0
        : Math.round((session.score / session.answered) * 100),
    bestStreak: session.bestStreak,
  };
}

export function advanceQuestion(session: Session): Session {
  if (session.status !== "playing" || !session.feedback) return session;
  const exhausted = session.index + 1 === session.questions.length;
  return {
    ...session,
    index: exhausted ? session.index : session.index + 1,
    feedback: null,
    status: exhausted
      ? session.mode === "Classic"
        ? "complete"
        : "exhausted"
      : "playing",
  };
}
