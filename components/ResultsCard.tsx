import { getResults } from "../lib/game/engine";
import type { Session } from "../lib/game/types";

export function performanceMessage(score: number) {
  if (score === 25) return "The one who knows everything!";
  if (score >= 20) return "You're ready to move into Monica's apartment.";
  if (score >= 14) return "Could you BE any more knowledgeable?";
  if (score >= 7) return "Not bad! You're definitely a fan.";
  return "You might need another rewatch!";
}

export function ResultsCard({
  session,
  onReplay,
  onHome,
}: {
  session: Session;
  onReplay: () => void;
  onHome: () => void;
}) {
  const results = getResults(session);
  const complete = session.status === "complete";
  return (
    <section className="results-card" aria-labelledby="results-title">
      <span className="result-star" aria-hidden="true">
        ✳
      </span>
      <p className="eyebrow">
        {session.mode} / {session.difficulty}
      </p>
      <h1 id="results-title">
        {session.status === "exhausted"
          ? "Every last question."
          : session.status === "ended"
            ? "That's a wrap."
            : "The one with your results."}
      </h1>
      <p className="result-message">
        {complete
          ? performanceMessage(session.score)
          : session.status === "exhausted"
            ? "You've completed every question in this run's pool. No repeats, just a well-earned break."
            : "Your run ended here. Another round is always waiting."}
      </p>
      <div className="result-score">
        <strong>{session.score}</strong>
        {session.mode === "Classic" && <span>/25</span>}
      </div>
      <p className="result-percentage">
        {results.percentage}% correct
        {session.status === "ended" ? " of questions answered" : ""}
      </p>
      <dl className="result-stats">
        <div>
          <dt>Answered</dt>
          <dd>{results.answered}</dd>
        </div>
        <div>
          <dt>Correct</dt>
          <dd>{results.correct}</dd>
        </div>
        <div>
          <dt>Incorrect</dt>
          <dd>{results.incorrect}</dd>
        </div>
        <div>
          <dt>Best streak</dt>
          <dd>{results.bestStreak}</dd>
        </div>
      </dl>
      {session.mode === "Classic" && !complete && (
        <p className="muted">
          Only completed 25-question rounds count toward your Classic best.
        </p>
      )}
      <div className="result-actions">
        <button className="button primary" onClick={onReplay}>
          Play Again <span aria-hidden="true">↗</span>
        </button>
        <button className="button secondary" onClick={onHome}>
          Return Home
        </button>
      </div>
      <p className="result-brand">The One With All the Trivia</p>
    </section>
  );
}
