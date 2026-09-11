"use client";

import { useEffect, useRef, useState } from "react";
import type { Session } from "../lib/game/types";

export function GameCard({
  session,
  onAnswer,
  onNext,
  onEnd,
}: {
  session: Session;
  onAnswer: (answer: string) => void;
  onNext: () => void;
  onEnd: () => void;
}) {
  const question = session.questions[session.index];
  const [answer, setAnswer] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const feedback = useRef<HTMLDivElement>(null);
  const answered = Boolean(session.feedback);
  useEffect(() => {
    heading.current?.focus();
  }, []);
  useEffect(() => {
    if (answered) feedback.current?.focus();
  }, [answered]);
  const extraTransition =
    question.difficulty === "Extra Hard" &&
    session.difficulty === "Mix" &&
    session.index === (session.mode === "Classic" ? 19 : 15);
  return (
    <section
      className="game-layout"
      aria-label={`${session.mode} ${session.difficulty} game`}
    >
      <div className="game-topline">
        <span className="eyebrow">
          {session.mode} <span aria-hidden="true">/</span> {session.difficulty}
        </span>
        <button className="text-button" onClick={onEnd}>
          {session.mode === "Endless" ? "End run" : "Leave round"}
        </button>
      </div>
      <div className="progress-label">
        <span>
          Question <strong>{session.index + 1}</strong>
          {session.mode === "Classic" ? " of 25" : ""}
        </span>
        <span>
          {session.mode === "Endless"
            ? `${session.questions.length - session.answered} questions remaining`
            : `${session.answered} answered`}
        </span>
      </div>
      <progress
        className="progress-bar"
        max={session.questions.length}
        value={session.answered}
        aria-label="Questions answered"
      />
      <div className="score-strip">
        <span>
          Score <strong>{session.score}</strong>
        </span>
        <span>
          Streak <strong>{session.streak}</strong>
        </span>
        <span>
          Best streak <strong>{session.bestStreak}</strong>
        </span>
        {session.mode === "Endless" && (
          <>
            <span>
              Correct <strong>{session.score}</strong>
            </span>
            <span>
              Incorrect <strong>{session.answered - session.score}</strong>
            </span>
          </>
        )}
      </div>
      <div
        className={`question-card ${question.kind === "typed" ? "typed-card" : ""}`}
      >
        <div className="question-eyebrow">
          <span
            className={`difficulty-badge badge-${question.difficulty.toLowerCase().replace(" ", "-")}`}
          >
            {question.difficulty}
          </span>
          <span className="muted">
            {question.kind === "typed" ? "From memory" : "Choose one answer"}
          </span>
        </div>
        {extraTransition && (
          <div className="extra-transition" role="status">
            <strong>Extra Hard round</strong>
            <span>No multiple choice. Time to trust your memory.</span>
          </div>
        )}
        <h2 ref={heading} tabIndex={-1} className="question-title">
          {question.prompt}
        </h2>
        {question.kind === "multiple-choice" ? (
          <div
            className="answer-options"
            role="group"

            aria-label="Answer choices"
          >
            {question.options.map((option, index) => {
              const correct = answered && option === question.answer;
              const wrong =
                answered && !session.feedback?.correct && answer === option;
              return (
                <button
                  key={option}
                  className={`answer-button ${correct ? "correct" : ""} ${wrong ? "incorrect" : ""}`}
                  disabled={answered}
                  onClick={() => {
                    setAnswer(option);
                    onAnswer(option);
                  }}
                >
                  <span className="answer-letter" aria-hidden="true">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span>{option}</span>
                  {correct && (
                    <span className="answer-status">
                      ✓ <span className="sr-only">Correct answer</span>
                    </span>
                  )}
                  {wrong && (
                    <span className="answer-status">
                      × <span className="sr-only">Incorrect answer</span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <form
            className="typed-form"
            onSubmit={(event) => {
              event.preventDefault();
              if (answer.trim() && !answered) onAnswer(answer);
            }}
          >
            <label htmlFor="typed-answer">Your answer</label>
            <input
              id="typed-answer"
              type="text"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              disabled={answered}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              maxLength={200}
              aria-describedby="typed-help"
            />
            <p id="typed-help" className="muted">
              Case and punctuation don’t count. A small typo is okay.
            </p>
            <button
              type="submit"
              className="button primary"
              disabled={!answer.trim() || answered}
            >
              Submit answer <span aria-hidden="true">↗</span>
            </button>
          </form>
        )}
        {session.feedback && (
          <div
            ref={feedback}
            tabIndex={-1}
            className={`feedback ${session.feedback.correct ? "feedback-correct" : "feedback-incorrect"}`}
            role="status"
          >
            <strong>
              {session.feedback.correct ? "✓ That's right!" : "Not this time."}
            </strong>
            {!session.feedback.correct && (
              <p>
                The answer is <b>{question.answer}</b>.
              </p>
            )}
            <p>{question.explanation}</p>
            <span className="source-note">
              Episode reference: {question.source.episode}
            </span>
          </div>
        )}
        {answered && (
          <button className="button primary next-button" onClick={onNext}>
            {session.index + 1 === session.questions.length
              ? "See results"
              : "Next Question"}
            <span aria-hidden="true">→</span>
          </button>
        )}
      </div>
      <p className="game-footnote">No rush. The next question can wait.</p>
    </section>
  );
}
