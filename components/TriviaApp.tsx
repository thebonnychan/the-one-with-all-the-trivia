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

  function apply(next: Session) {
    setSession(next);
    const stored = readRecords();
    const merged = {
      classic: { ...stored.classic },
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
    setStorageUnavailable(!saveRecords(updated));
  }
  function start() {
    try {
      setSession(createSession(bank as Question[], mode, difficulty));
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
          aria-label="The One With All the Trivia — Home"
        >
          <span className="brand-symbol" aria-hidden="true">
            ✳
          </span>
          <span>
            The One With
            <br />
            <strong>All the Trivia</strong>
          </span>
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
            questionCount={bank.length}
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
            ? "Records couldn't be saved in this browser. You can still play normally."
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
            Extra Hard. The last six answers are typed.
          </p>
        </section>
        <section>
          <h3>Endless · no repeats</h3>
          <p>
            Keep playing one difficulty until you end the run or finish its
            pool. Mix starts with 5 Easy, 5 Medium, and 5 Hard, then uses the
            Extra Hard pool. It never cycles back.
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
            punctuation are normalized. Accepted aliases and small spelling
            mistakes count; short names and numbers need greater precision.
          </p>
        </section>
        <p className="muted">
          No timer. No category selection. Reloading ends your current run;
          completed Classic records and best streaks are saved on this device
          when storage is available.
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
