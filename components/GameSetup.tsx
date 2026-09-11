import type { DifficultySelection, Mode } from "../lib/game/types";
import type { Records } from "../lib/game/records";

const options: { name: DifficultySelection; detail: string; mark: string }[] = [
  { name: "Mix", detail: "A little of everything", mark: "✳" },
  { name: "Easy", detail: "Make yourself at home", mark: "01" },
  { name: "Medium", detail: "You know the neighbors", mark: "02" },
  { name: "Hard", detail: "For the rewatch regulars", mark: "03" },
  { name: "Extra Hard", detail: "No hints. All memory.", mark: "04" },
];

export function GameSetup({
  mode,
  difficulty,
  records,
  questionCount,
  onMode,
  onDifficulty,
  onStart,
}: {
  mode: Mode;
  difficulty: DifficultySelection;
  records: Records;
  questionCount: number;
  onMode: (value: Mode) => void;
  onDifficulty: (value: DifficultySelection) => void;
  onStart: () => void;
}) {
  return (
    <div className="setup-layout">
      <section className="welcome" aria-labelledby="welcome-title">
        <span className="eyebrow">
          <span className="little-star" aria-hidden="true">
            ✳
          </span>{" "}
          Your usual table is ready
        </span>
        <h1 id="welcome-title">
          <span>The One With</span>All the
          <br />
          <em>Trivia</em>
          <span className="title-period" aria-hidden="true">
            .
          </span>
        </h1>
        <p className="subtitle">How well do you really know Friends?</p>
        <p className="intro">
          From first dates to final goodbyes. Settle in, pick your challenge,
          and put those rewatches to work.
        </p>
        <div className="fact-strip">
          <span>
            <strong>25</strong> questions in Classic
          </span>
          <span>
            <strong>{questionCount.toLocaleString("en-US")}</strong> original
            questions
          </span>
          <span>
            <strong>10</strong> seasons of memories
          </span>
        </div>
        <div className="signature-note">
          <span className="note-mark" aria-hidden="true">
            ↗
          </span>
          <p>
            <strong>Meet your next favorite: Mix.</strong>
            <br />
            Start easy. Finish like a true Friends expert.
          </p>
        </div>
      </section>
      <section className="setup-card" aria-labelledby="setup-title">
        <div className="card-topline">
          <span className="eyebrow">Let’s make a night of it</span>
          <span aria-hidden="true">✦</span>
        </div>
        <h2 id="setup-title">Pick your challenge.</h2>
        <fieldset className="mode-fieldset">
          <legend>Game mode</legend>
          <div className="mode-options">
            {(["Classic", "Endless"] as const).map((value) => (
              <label
                key={value}
                className={`mode-option ${mode === value ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="mode"
                  value={value}
                  checked={mode === value}
                  onChange={() => onMode(value)}
                />
                <span>
                  <strong>{value}</strong>
                  <small>
                    {value === "Classic"
                      ? "25 questions · one round"
                      : "Keep going · no repeats"}
                  </small>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>Difficulty</legend>
          <div className="difficulty-options">
            {options.map(({ name, detail, mark }) => (
              <label
                key={name}
                className={`difficulty-option ${name === "Mix" ? "mix-option" : ""} ${difficulty === name ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="difficulty"
                  value={name}
                  checked={difficulty === name}
                  onChange={() => onDifficulty(name)}
                />
                <span className="difficulty-mark" aria-hidden="true">
                  {mark}
                </span>
                <span>
                  <strong>{name}</strong>
                  <small>{detail}</small>
                </span>
                {name === "Mix" && (
                  <span className="signature-tag">Signature</span>
                )}
                <span className="radio-dot" aria-hidden="true" />
              </label>
            ))}
          </div>
        </fieldset>
        <p className="round-summary" id="round-summary">
          {difficulty === "Mix"
            ? mode === "Classic"
              ? "6 Easy → 6 Medium → 7 Hard → 6 typed Extra Hard."
              : "5 Easy → 5 Medium → 5 Hard → typed Extra Hard until the pool ends."
            : difficulty === "Extra Hard"
              ? "Type your answers. Reasonable aliases and small typos are welcome."
              : "Four choices per question. Take your time—there’s no timer."}
        </p>
        <button
          className="button primary start-button"
          onClick={onStart}
          aria-describedby="round-summary"
        >
          {difficulty === "Mix" ? "Play Mix" : "Start Game"}
          <span aria-hidden="true">↗</span>
        </button>
        <div className="saved-records">
          <span>
            Best Classic · {difficulty}
            <strong>
              {records.classic[difficulty] === undefined
                ? "—"
                : `${records.classic[difficulty]}/25`}
            </strong>
          </span>
          <span>
            Best streak · all modes<strong>{records.bestStreak || "—"}</strong>
          </span>
        </div>
      </section>
    </div>
  );
}
