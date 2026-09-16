"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import { SERIES, loadBank, type SeriesId } from "../lib/series";
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
  const [selected, setSelected] = useState<{
    series: SeriesId;
    bank: Question[];
  } | null>(null);
  const [loading, setLoading] = useState<SeriesId | null>(null);
  const [loadError, setLoadError] = useState("");
  const selectionHeading = useRef<HTMLHeadingElement>(null);
  async function choose(series: SeriesId) {
    setLoading(series);
    setLoadError("");
    try {
      const bank = await loadBank(series);
      setSelected({ series, bank });
    } catch {
      setLoadError("Couldn't load this show's questions. Please try again.");
    } finally {
      setLoading(null);
    }
  }
  function selection() {
    setSelected(null);
    requestAnimationFrame(() => selectionHeading.current?.focus());
  }
  if (selected)
    return (
      <ShowApp key={selected.series} {...selected} onSeriesHome={selection} />
    );
  return (
    <div className="app-shell">
      <main id="main" className="series-selection">
        <h1
          ref={selectionHeading}
          tabIndex={-1}
          className="tv-title"
          aria-label="TV Trivia"
        >
          {["TV", "TRIVIA"].map((word, wordIndex) => (
            <span className="tv-title-word" aria-hidden="true" key={word}>
              {[...word].map((letter, index) => (
                <span className="tv-title-letter" key={index}>
                  {index > 0 && (
                    <i
                      className={`tv-title-dot dot-${(index + wordIndex) % 3}`}
                    />
                  )}
                  <span>{letter}</span>
                </span>
              ))}
            </span>
          ))}
        </h1>
        <p>Choose your series</p>
        <div className="series-options" role="group" aria-label="TV shows">
          {(Object.keys(SERIES) as SeriesId[]).map((series) => (
            <button
              key={series}
              className={`series-choice theme-${series}`}
              disabled={loading !== null}
              onClick={() => choose(series)}
            >
              <span aria-hidden="true">{series === "friends" ? "✳" : "✦"}</span>
              <strong>{SERIES[series].name}</strong>
            </button>
          ))}
        </div>
        {loading && <p role="status">Loading {SERIES[loading].name}…</p>}
        {loadError && <p role="alert">{loadError}</p>}
      </main>
      <footer className="site-footer">
        <p>Independent fan project. No account needed.</p>
      </footer>
    </div>
  );
}

function ShowApp({
  series,
  bank,
  onSeriesHome,
}: {
  series: SeriesId;
  bank: Question[];
  onSeriesHome: () => void;
}) {
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
  const [destination, setDestination] = useState<"home" | "setup" | "results">(
    "results",
  );
  const rules = useRef<HTMLDialogElement>(null);
  const view = !session
    ? "home"
    : session.status === "playing"
      ? "game"
      : "results";
  useEffect(() => {
    startTransition(() => setRecords(readRecords(series)));
  }, [series]);
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
        : readHistory(history.current, series),
      next.questions[next.index],
      bank as Question[],
    );
    if (!saveHistory(history.current, series)) {
      historyStorageFailed.current = true;
      setStorageUnavailable(true);
    }
  }
  function apply(next: Session) {
    if (session && next.index !== session.index) remember(next);
    setSession(next);
    const stored = readRecords(series);
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
    if (!saveRecords(updated, series)) setStorageUnavailable(true);
  }
  function start() {
    try {
      if (!historyStorageFailed.current)
        history.current = readHistory(history.current, series);
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
  function navigate(target: "home" | "setup" | "results") {
    setDestination(target);
    if (session?.status === "playing") confirm.current?.showModal();
    else if (target === "home") onSeriesHome();
    else home();
  }
  function home() {
    setSession(null);
    setError("");
  }

  return (
    <div className={`app-shell theme-${series}`}>
      <header className="site-header">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <button
            className="wordmark"
            onClick={() => navigate("home")}
            aria-label="Home"
          >
            <span className="brand-symbol" aria-hidden="true">
              ✳
            </span>
            <span>Home</span>
          </button>
          {session && (
            <>
              <span aria-hidden="true">/</span>
              <button className="text-button" onClick={() => navigate("setup")}>
                {SERIES[series].name}
              </button>
            </>
          )}
        </nav>
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
            series={series}
            mode={mode}
            difficulty={difficulty}
            records={records}
            onMode={setMode}
            onDifficulty={setDifficulty}
            onStart={start}
          />
        ) : session.status === "playing" ? (
          <GameCard
            series={series}
            key={`${session.index}-${session.questions[session.index].id}`}
            session={session}
            onAnswer={(answer) => apply(submitAnswer(session, answer))}
            onNext={() => apply(advanceQuestion(session))}
            onEnd={() => navigate("results")}
          />
        ) : (
          <ResultsCard
            series={series}
            session={session}
            onReplay={start}
            onHome={home}
          />
        )}
      </main>
      <footer className="site-footer">
        <span>Made for the rewatch crowd.</span>
        <p>
          Independent fan project. Not affiliated with the {SERIES[series].name}{" "}
          creators or rights holders.
        </p>
        {storageUnavailable && (
          <p>
            Scores or question history couldn't be saved in this browser. You
            can still play normally.
          </p>
        )}
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
          {destination === "home"
            ? "Leave this game and return to series selection?"
            : destination === "setup"
              ? `Leave this game and return to ${SERIES[series].name} setup?`
              : "You can view your results now. A new game starts a fresh set of questions."}
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
              if (destination === "home") onSeriesHome();
              else if (destination === "setup") home();
            }}
          >
            {destination === "results" ? "End run" : "Leave game"}
          </button>
        </div>
      </dialog>
    </div>
  );
}
