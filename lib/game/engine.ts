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
  const tiers = difficulty === "Mix" ? DIFFICULTIES : [difficulty];
  const questions = tiers.flatMap((tier, i) => {
    const pool = bank.filter((q) => q.difficulty === tier);
    const count =
      mode === "Classic"
        ? difficulty === "Mix"
          ? MIX_COUNTS[i]
          : CLASSIC_LENGTH
        : difficulty === "Mix" && tier !== "Extra Hard"
          ? 5
          : pool.length;
    if (pool.length < count || pool.length === 0) {
      throw new Error(
        `Not enough ${tier} questions for ${mode} ${difficulty}.`,
      );
    }
    return shuffled(pool, random)
      .slice(0, count)
      .map((q): Question =>
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
  });
  return {
    mode,
    difficulty,
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
