import { SERIES, type SeriesId } from "../lib/series";
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
  series,
  mode,
  difficulty,
  records,
  onMode,
  onDifficulty,
  onStart,
}: {
  series: SeriesId;
  mode: Mode;
  difficulty: DifficultySelection;
  records: Records;
  onMode: (value: Mode) => void;
  onDifficulty: (value: DifficultySelection) => void;
  onStart: () => void;
}) {
  return (
    <div className="setup-layout">
      <section className="welcome" aria-labelledby="welcome-title">
        <h1 id="welcome-title">
          {series === "friends" ? (
            <>
              <span>The One With</span>All the
              <br />
              <em>Trivia</em>
              <span className="title-period" aria-hidden="true">
                .
              </span>
            </>
          ) : (
            <>
              Lettuce Do
              <br />
              <em>Trivia.</em>
            </>
          )}
        </h1>
        <p className="subtitle">{SERIES[series].subtitle}</p>
      </section>
      <section className="setup-card" aria-label="Game settings">
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
        {mode === "Classic" && (
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
        )}
        <p className="round-summary" id="round-summary">
          {mode === "Endless"
            ? "All difficulties, shuffled together. Keep going without repeats."
            : difficulty === "Mix"
              ? "6 Easy → 6 Medium → 7 Hard → 6 typed Extra Hard."
              : difficulty === "Extra Hard"
                ? "Type your answer. Shortened answers and small typos are welcome."
                : "Four choices per question. Take your time—there’s no timer."}
        </p>
        <button
          className="button primary start-button"
          onClick={onStart}
          aria-describedby="round-summary"
        >
          {mode === "Endless"
            ? "Play Endless"
            : difficulty === "Mix"
              ? "Play Mix"
              : "Start Game"}
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
            High Score · Endless Mode
            <strong>{records.endlessHighScore || "—"}</strong>
          </span>
        </div>
      </section>
    </div>
  );
}
