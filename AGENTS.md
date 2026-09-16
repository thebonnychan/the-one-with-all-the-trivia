# Repository Guidelines

## Project & Permanent Requirements

**TV Trivia** is a fan-made multi-series trivia web application. The Friends game retains the name **The One With All the Trivia**. Preserve all requirements in this guide during future changes unless the user explicitly instructs otherwise.

## Technology & Deployment

- Use Next.js, React, TypeScript, Tailwind CSS, and the App Router.
- Build a statically deployable site hosted on GitHub Pages. Include GitHub Actions deployment for GitHub Pages on pushes to `main`. Do not use Vercel.
- Do not require a backend, database, authentication system, paid API, or paid service.
- Store trivia data locally in the repository. Use localStorage only for appropriate client-side persistence, such as high scores and Classic question history.

## Question Bank

- Maintain at least 2,000 Friends questions and 1,000 Bob's Burgers TV questions (250 per difficulty), covering seasons 1–16 at this release and excluding the movie. Never use placeholder questions.
- Questions must be factually accurate, unambiguous, and appropriately categorized by difficulty. Extra Hard may reuse a multiple-choice fact as a fill-in-the-blank question; otherwise keep facts unique.
- Avoid answer giveaways in prompts and episode titles. In Bob's Burgers prompts, use neutral wording such as “person” rather than “sister”; do not narrow character answers with unnecessary relationship clues.
- Keep Friends Extra Hard varied: emphasize objects, locations, food, dialogue, and events rather than minor-character name recall. Keep explicit first-name/full-name/surname prompts rare (at most 15 in the current 500-question tier). Use fresh IDs when replacing facts so saved history treats replacements as unseen.
- Players must not select trivia categories.

## Game Rules

- Classic Mode has exactly 25 questions and tracks displayed questions locally across sessions, exhausting each difficulty before repeating. Difficulty selection is shown only for Classic. Options are Easy, Medium, Hard, Extra Hard, and Mix.
- Show the source season and episode above Friends typed/fill-in-the-blank questions before the player answers.
- Extra Hard uses typed answers rather than multiple choice. Validation must be case-insensitive, normalize whitespace and punctuation, support aliases, conservatively allow minor spelling mistakes, and accept an ordered majority of the correct words. Use explicit aliases for short or irregular variants; preserve numbers and negations.
- Mix Classic contains exactly 6 Easy, 6 Medium, 7 Hard, and 6 Extra Hard questions, in that order. Questions 1–19 use multiple choice; questions 20–25 use typed Extra Hard answers.
- Endless has no difficulty selector. Shuffle all difficulties together across the complete bank with no repeated question IDs within a run; end explicitly when exhausted. Store its high score separately from Classic records.

## Series Selection & Navigation

Start with “TV Trivia”, “Choose your series”, and buttons for Friends and Bob's Burgers. Bob's Burgers uses “Lettuce Do Trivia.” and “You're terrible. You're all terrible.” Keep shared layouts with subtle original show-specific styling. Load the selected local bank on demand. Keep scores and history separate per show, preserving the original Friends storage keys.

Home returns to series selection. Inside a quiz, show Home / Show name navigation; the show name returns to that show's setup. Confirm before abandoning an active run.

## Show Setup Screen

Keep the home screen concise: title, subtitle, mode controls, Classic-only difficulty controls, start button, Best Classic score, and High Score · Endless Mode. Omit promotional eyebrows, challenge headings, bank counts, season counts, and the all-mode best-streak record.

## Design & Accessibility

Use an original Friends aesthetic with white surfaces, black text, and red, teal, and yellow accents and a bright yellow, bold red, and charcoal Bob's Burgers palette with warm light surfaces. Do not reproduce the official Friends logo, promotional artwork, screenshots, episode stills, or other copyrighted visual assets. The app must be responsive, accessible, keyboard-friendly, and mobile-first.

## Development & Validation

Organize source, local trivia data, tests, and assets clearly; document their locations as implemented. Follow consistent TypeScript naming and configured formatting/linting rules.

Include automated question-bank validation and game-logic tests, covering bank integrity, Classic counts and ordering, typed-answer normalization and matching, and Endless progression and repetition behavior.

Provide complete README documentation, including setup, structure, development/build/test commands, question maintenance, and GitHub Pages deployment. Do not leave TODOs, placeholders, fake functionality, or unfinished screens in the final project.

## Contributions

Use focused commits with concise, imperative subjects. Pull requests should explain motivation, changes, validation, and relevant issues; include screenshots for interface changes. Keep secrets and generated output out of version control.

## Master Specification

Follow `docs/MASTER_SPECIFICATION.md` for the complete product requirements, including mode progression, interface behavior, accessibility, persistence, and release verification.
