# Architecture and verification

The permanent contract is [AGENTS.md](../AGENTS.md); the full product specification is [MASTER_SPECIFICATION.md](MASTER_SPECIFICATION.md).

## Completed stages

1. Verified Node/npm, the repository's `main` branch, and the GitHub Pages static-export approach. Established Next.js, React, TypeScript, Tailwind, App Router, and a successful foundation build.
2. Added discriminated question types, local JSON data, bank validation, reusable answer matching, and pure game transitions with automated tests.
3. Authored 500 questions across ten seasons, with 125 in each difficulty. Reviewed episode transcript references, corrected misleading premises and chronology, and replaced duplicate facts. See [the editorial process](QUESTION_BANK.md).
4. Built setup, Classic, Mix, Endless, typed answers, feedback, results, replay, and resilient device-local records. Added responsive original styling, native keyboard controls, focus management, dialogs, and reduced-motion styles.
5. Added CI, automatic GitHub Pages deployment, production-pool tests, and complete setup/deployment documentation.

## State and boundaries

`TriviaApp` owns the active session and records in React state. `GameSetup`, `GameCard`, and `ResultsCard` render the current view. The engine in `lib/game/engine.ts` owns selection, scoring, and transitions; it does not access browser APIs. `records.ts` and `history.ts` access localStorage, and every storage operation handles failure.

Classic Mix uses 6/6/7/6 questions. Endless shuffles the complete bank across all difficulties. Classic selects unseen questions first, recording displayed question IDs across sessions and resetting each difficulty only after exhaustion. Fisher–Yates shuffles questions and answer options without changing the source bank. Endless exhaustion is explicit. There are no external gameplay requests, server routes, authentication, or runtime environment variables.

## Verification approach

Automated checks cover all mode/difficulty combinations, actual production-bank playthroughs, exact Mix transitions, no duplicate questions, answer locking, score and streak calculations, aliases, conservative typo matching, and invalid or unavailable storage. Structural bank checks complement editorial review; they cannot establish factual truth.

Browser verification covers a complete 25-question Classic Mix, the switch to typed answers at question 20, Enter submission, whitespace rejection, correct/incorrect feedback, results, replay, leave confirmation, Escape focus return, saved records after reload, and Endless Mix progression into question 16 and beyond. Mobile and desktop checks include horizontal overflow and keyboard access.

Release checks use `npm run check`, `npm run validate:launch`, `npm run format:check`, and a production build with the repository base path. Inspect the exported site and its assets through a static HTTP server before release. Publishing occurs through the included GitHub Actions workflow when source is pushed to `main` in a Pages-enabled repository.

## Expansion to 2,000 questions (before gameplay updates)

Expanded the local bank to exactly 2,000 questions, with 500 in each difficulty. Added 1,500 individually written entries with episode references and original evidence summaries, checked candidate overlaps, tightened a broad full-name alias, and corrected discovered errors in the original bank. Examples include Monica hiring Chandler's supposed stripper, Monica's braids catching in the shower curtain, and Dr. Biely—not Ross—proposing the South Dakota fieldwork.

The setup screen derives its question count from the bank. Launch validation now requires at least 2,000 entries, and production tests require at least 500 per difficulty. Full simulated playthroughs cover every mode and difficulty: Classic remains 25 questions, single-difficulty Endless exhausts 500 unique questions, and Endless Mix exhausts 515 questions (5/5/5/500).

Verification completed on September 11, 2026:

- All 60 Vitest tests, ESLint, TypeScript, structural and launch bank validation, and Prettier checks passed.
- The production build with `/the-one-with-all-the-trivia` as its base path exported successfully.
- The refreshed static preview displayed 2,000 questions. Browser smoke tests verified multiple-choice correction/explanation, typed-answer case/whitespace/punctuation normalization with Enter, the Endless remaining count, end-run confirmation, results, and preserved existing records. No browser console errors were reported.
- The complete static export measured 2,161,978 bytes. Compact question JSON measured 1,142,747 bytes, or 226,487 bytes with gzip. The page JavaScript containing the bank measured 1,167,114 bytes, or 233,785 bytes with gzip. These are local artifact measurements; actual transfer sizes depend on hosting compression and caching.

All questions remain repository data bundled at build time; none are generated during gameplay. These checks do not replace editorial judgment or certify that a transcript itself is error-free. No deployment was performed for this expansion.

## Gameplay and home updates — September 11, 2026

Simplified the home screen, limited difficulty selection to Classic, shuffled all 2,000 questions in Endless, and separated its high score from Classic records. Classic now persists displayed question history per difficulty across rounds, including Mix, and keeps an in-memory fallback when writes fail. Extra Hard may reuse a multiple-choice fact as a distinct typed question. Answer matching accepts ordered-majority phrases and explicit short aliases; numeric answers remain strict (1/70 is accepted for one seventieth, 1/17 is rejected).

All 72 automated tests cover these changes, including production-bank alias regression checks, full Endless exhaustion, history cycles, and independent score persistence.

The final lint, TypeScript, formatting, structural/launch validation, and GitHub Pages static build passed. Browser smoke checks confirmed Classic-only difficulty controls, Hard-to-Easy Endless shuffling, an independently saved Endless score after reload, preserved Classic records, and fresh Classic questions across a reload. The narrow mobile preview had no horizontal overflow, and the browser reported no console errors.

## Multi-series release — September 12, 2026

Added the TV Trivia series picker and preserved the Friends experience inside it. `lib/series.ts` defines metadata and dynamically imports the selected local bank; the picker does not need either bank to render. Each mounted show owns its game state. Home and show breadcrumbs use the existing native confirmation dialog before abandoning a run, with destination-specific wording. Results return to the current show's setup.

Friends keeps its original storage keys. Bob's Burgers uses separate suffixed keys for scores and Classic history. Its 500 source-reviewed TV questions contain 125 entries per difficulty across seasons 1–16, excluding the movie; 125 are permitted typed variants of Hard facts. See the editorial guide for the source-review method and limits.

The expanded 84-test suite passes, including all Bob's Burgers Classic modes, exact Mix ordering, all 500 Endless answers, every typed alias, both bank minima, all 16 seasons, preserved legacy records, and storage isolation. Lint, TypeScript, structural and launch bank checks, and the GitHub Pages build also passed. Browser checks confirmed the chosen title/subtitle, series switching, correct feedback, typed Enter submission (including the short numeric alias “100”), cancellation preserving an answered question, and existing Friends records (23/25 Mix and 22 Endless) remaining intact.

Final browser checks also verified the new destination-specific leave prompt, an independent Bob's Burgers Endless score persisting after reload, no horizontal overflow at 319px or 1280px, and no browser console errors. Both banks are separate lazy-loaded JavaScript chunks and are absent from the initial HTML script list. No deployment was performed.

## Bob's Burgers expansion to 1,000 questions

Added 375 new source-reviewed multiple-choice facts and 125 typed Hard variants, bringing the bank to 1,000 entries with 250 per difficulty. New references use individual Wikipedia episode plot articles; the editorial guide describes coverage and review limitations. Existing question IDs and fact keys remain stable. Revised prompts remove “sister” clues, and the earlier Easy-question giveaway fixes remain intact.

Validation: all 91 tests, lint, TypeScript, structural and launch checks, and the GitHub Pages static export passed. Regression tests cover neutral prompt wording, numeric aliases, and existing Classic history selecting unseen additions before repeats. Endless simulation exhausts all 1,000 IDs. The rebuilt browser preview loads the bank and displays 1,000 remaining at the start of Endless; navigation back to show setup works. The bank's separate lazy-loaded asset is approximately 503 KB raw / 100 KB gzipped. Friends data is unchanged.

## Friends Extra Hard variety

Replaced 125 explicit name-recall questions with original fill-in-the-blank prompts derived from existing reviewed Hard facts. First-name/full-name/surname prompts fall from 137 to 12; the bank retains 2,000 questions and 500 per tier. Replacements have new IDs so existing Classic history does not mark them as seen. Unchanged entries, all multiple-choice tiers, and Bob's Burgers data remain untouched by this update.

All 93 tests, lint, TypeScript, structural and launch bank validation, and the GitHub Pages static build passed. Added regression coverage for the name-question limit and correctly paired Hard/Extra Hard facts. Existing production tests verify typed aliases and full mode playthroughs. No photographic assets were added.
