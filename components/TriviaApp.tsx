"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import bank from "../data/questions.json";
import {
  advanceQuestion,
  createSession,
  endSession,
  submitAnswer,
} from "../lib/game/engine";
import {
  emptyRecords,
  readRecords,
  recordSession,
  saveRecords,
} from "../lib/game/records";
import type {
  DifficultySelection,
  Mode,
  Question,
  Session,
} from "../lib/game/types";
import {
  readHistory,
  saveHistory,
  markQuestionSeen,
  type ClassicHistory,
} from "../lib/game/history";
import { GameSetup } from "./GameSetup";
import { GameCard } from "./GameCard";
import { ResultsCard } from "./ResultsCard";

export default function TriviaApp() {
  const [mode, setMode] = useState<Mode>("Classic");
  const [difficulty, setDifficulty] = useState<DifficultySelection>("Mix");
  const [session, setSession] = useState<Session | null>(null);
  const [records, setRecords] = useState(emptyRecords);
  const [error, setError] = useState("");
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  const history = useRef<ClassicHistory>([]);
  const historyStorageFailed = useRef(false);
  const main = useRef<HTMLElement>(null);
  const confirm = useRef<HTMLDialogElement>(null);
  const rules = useRef<HTMLDialogElement>(null);
  const view = !session
    ? "home"
    : session.status === "playing"
      ? "game"
      : "results";
  useEffect(() => {
    startTransition(() => setRecords(readRecords()));
  }, []);
  useEffect(() => {
    if (view !== "game") main.current?.focus();
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [view]);
  useEffect(() => {
    if (view !== "game") return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [view]);

  function remember(next: Session) {
    if (next.mode !== "Classic" || next.status !== "playing") return;
    history.current = markQuestionSeen(
      historyStorageFailed.current
        ? history.current
        : readHistory(history.current),
      next.questions[next.index],
      bank as Question[],
    );
    if (!saveHistory(history.current)) {
      historyStorageFailed.current = true;
      setStorageUnavailable(true);
    }
  }
  function apply(next: Session) {
    if (session && next.index !== session.index) remember(next);
    setSession(next);
    const stored = readRecords();
    const merged = {
      classic: { ...stored.classic },
      endlessHighScore: Math.max(
        stored.endlessHighScore,
        records.endlessHighScore,
      ),
      bestStreak: Math.max(stored.bestStreak, records.bestStreak),
    };
    for (const key of [
      "Easy",
      "Medium",
      "Hard",
      "Extra Hard",
      "Mix",
    ] as const) {
      if (records.classic[key] !== undefined)
        merged.classic[key] = Math.max(
          merged.classic[key] ?? 0,
          records.classic[key]!,
        );
    }
    const updated = recordSession(merged, next);
    setRecords(updated);
    if (!saveRecords(updated)) setStorageUnavailable(true);
  }
  function start() {
    try {
      if (!historyStorageFailed.current)
        history.current = readHistory(history.current);
      const next = createSession(
        bank as Question[],
        mode,
        difficulty,
        Math.random,
        history.current,
      );
      remember(next);
      setSession(next);
      setError("");
    } catch (cause) {
      setSession(null);
      setError(
        cause instanceof Error
          ? cause.message
          : "We couldn't start this round. Please try again.",
      );
    }
  }
  function home() {
    setSession(null);
    setError("");
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <button
          className="wordmark"
          onClick={() =>
            session?.status === "playing"
              ? confirm.current?.showModal()
              : home()
          }
          aria-label="Home"
        >
          <span className="brand-symbol" aria-hidden="true">
            ✳
          </span>
          <span>Home</span>
        </button>
        <button
          className="rules-button"
          onClick={() => rules.current?.showModal()}
        >
          <span aria-hidden="true">?</span> How to play
        </button>
      </header>
      <main id="main" ref={main} tabIndex={-1}>
        {error && (
          <div className="error-banner" role="alert">
            {error}{" "}
            <button className="text-button" onClick={() => setError("")}>
              Dismiss
            </button>
          </div>
        )}
        {!session ? (
          <GameSetup
            mode={mode}
            difficulty={difficulty}
            records={records}
            onMode={setMode}
            onDifficulty={setDifficulty}
            onStart={start}
          />
        ) : session.status === "playing" ? (
          <GameCard
            key={`${session.index}-${session.questions[session.index].id}`}
            session={session}
            onAnswer={(answer) => apply(submitAnswer(session, answer))}
            onNext={() => apply(advanceQuestion(session))}
            onEnd={() => confirm.current?.showModal()}
          />
        ) : (
          <ResultsCard session={session} onReplay={start} onHome={home} />
        )}
      </main>
      <footer className="site-footer">
        <span>Made for the rewatch crowd.</span>
        <p>
          Independent fan project. Not affiliated with the Friends creators or
          rights holders.
        </p>
        <p>
          {storageUnavailable
            ? "Scores or question history couldn't be saved in this browser. You can still play normally."
            : "Best scores stay on this device. No account needed."}
        </p>
      </footer>
      <dialog
        ref={rules}
        className="dialog rules-dialog"
        aria-labelledby="rules-title"
      >
        <div className="dialog-top">
          <p className="eyebrow">Pull up a chair</p>
          <button
            className="close-button"
            onClick={() => rules.current?.close()}
            aria-label="Close rules"
          >
            ×
          </button>
        </div>
        <h2 id="rules-title">How to play</h2>
        <section>
          <h3>Classic · 25 questions</h3>
          <p>
            Choose a difficulty, or play Mix: 6 Easy, 6 Medium, 7 Hard, then 6
            Extra Hard. The last six answers are typed. Each difficulty cycles
            through unseen questions across rounds before repeating.
          </p>
        </section>
        <section>
          <h3>Endless · no repeats</h3>
          <p>
            All difficulties are shuffled together. Keep playing until you end
            the run or finish the bank. Questions never repeat within a run.
          </p>
        </section>
        <section>
          <h3>One answer. One point.</h3>
          <p>
            Every correct answer earns a point and extends your streak. A miss
            resets the current streak. Read the explanation, then choose Next
            Question when you’re ready.
          </p>
        </section>
        <section>
          <h3>Extra Hard · from memory</h3>
          <p>
            Type your answer and press Enter or Submit. Case, whitespace, and
            punctuation are normalized. Accepted aliases, a majority of answer
            words in order, and small spelling mistakes count. Numbers and
            negations are preserved.
          </p>
        </section>
        <p className="muted">
          No timer. No category selection. Reloading ends your current run;
          Classic question history, completed Classic records, and Endless high
          scores are saved on this device when storage is available.
        </p>
        <button
          className="button primary"
          onClick={() => rules.current?.close()}
        >
          Got it
        </button>
      </dialog>
      <dialog ref={confirm} className="dialog" aria-labelledby="end-title">
        <h2 id="end-title">Call it a night?</h2>
        <p>
          You can view your results now. A new game starts a fresh set of
          questions.
        </p>
        {session?.mode === "Classic" && (
          <p className="muted">
            An unfinished round won’t count toward your best Classic score.
          </p>
        )}
        <div className="dialog-actions">
          <button
            className="button secondary"
            autoFocus
            onClick={() => confirm.current?.close()}
          >
            Keep playing
          </button>
          <button
            className="button primary"
            onClick={() => {
              confirm.current?.close();
              if (session) apply(endSession(session));
            }}
          >
            End run
          </button>
        </div>
      </dialog>
    </div>
  );
}
