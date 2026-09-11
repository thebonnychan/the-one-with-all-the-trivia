# The One With All the Trivia

A free, fan-made **Friends** trivia game with an original cozy, 1990s New York-inspired design. Built with Next.js, React, TypeScript, Tailwind CSS, and the App Router; exported as a static site for GitHub Pages.

## Features

- **2,000 locally bundled questions:** 500 each of Easy, Medium, Hard, and Extra Hard, spanning all ten seasons. Every question includes an explanation and episode reference.
- **Classic:** 25 random, unique questions at your chosen difficulty.
- **Classic Mix:** 6 Easy → 6 Medium → 7 Hard → 6 Extra Hard. Questions 20–25 require typed answers.
- **Endless:** complete the chosen difficulty's 500-question pool or end the run yourself. Endless Mix starts with 5 Easy → 5 Medium → 5 Hard, then all 500 Extra Hard questions: 515 total. Pools never silently repeat or cycle.
- Four shuffled choices for Easy, Medium, and Hard; typed answers for Extra Hard, with aliases and conservative typo tolerance.
- Scores, streaks, explanations, results, and deliberate replay. One correct answer earns one point; a miss resets the current streak. No timer or automatic advancement.
- Device-local best Classic scores by difficulty and an overall best streak. No account, database, backend, analytics, paid API, or runtime external service.
- Responsive layouts, native keyboard controls, visible focus, text-based feedback, accessible dialogs, and reduced-motion support.

## Get started

Use Node.js **22.14 or later** and npm. `.nvmrc` selects Node 22; the project was also verified locally with Node 24.

```sh
nvm use
npm ci
npm run dev
```

Open the URL printed by Next.js, usually `http://localhost:3000`. Choose Classic or Endless, select a difficulty, and start playing. No credentials or environment file are needed.

| Command                                   | Purpose                                                           |
| ----------------------------------------- | ----------------------------------------------------------------- |
| `npm run dev`                             | Start the development server.                                     |
| `npm run build`                           | Build and export static files into `out/`.                        |
| `npm run check`                           | Run ESLint, TypeScript, Vitest, and bank validation.              |
| `npm test` / `npm run test:watch`         | Run tests once / watch for changes.                               |
| `npm run validate:bank`                   | Check question schema, answers, sources, and duplicates.          |
| `npm run validate:launch`                 | Also enforce 2,000+ reviewed questions and sufficient tier sizes. |
| `npm run lint` / `npm run typecheck`      | Run individual code checks.                                       |
| `npm run format` / `npm run format:check` | Apply / check Prettier formatting.                                |

The production build uses Next.js's Webpack option. No Node server is deployed; do not use `next start` for the static export.

## Project structure

```text
app/                  App Router page, metadata, and global Tailwind/CSS styles
components/           Setup, game, results, and application orchestration
lib/game/             Session engine, types, records, and bank validation
src/utils/            Answer normalization/matching and Fisher–Yates shuffle
data/questions.json   Production question bank
scripts/              Command-line bank validator
tests/                Vitest tests and isolated synthetic test fixtures
public/               Static assets and .nojekyll
docs/                 Master specification, architecture, and editorial guide
.github/workflows/    CI validation and GitHub Pages deployment
```

React state holds the active session. Pure engine functions select questions, score answers, and advance or end a run; components render that state. An answer locks until Next Question. Returning home during a game requires confirmation. Reloading ends the current run, with the browser's navigation warning where supported.

## Question maintenance

Edit `data/questions.json` and follow [the editorial guide](docs/QUESTION_BANK.md). Keep IDs stable, assign a distinct fact key, verify the episode detail, and check semantic duplicates before setting `reviewed: true`. Do not copy quiz collections or add filler to meet a count.

A multiple-choice entry contains `id`, `factId`, `difficulty`, `kind: "multiple-choice"`, `prompt`, `answer`, exactly four `options`, `explanation`, `source` (`episode`, `evidence`, optional `url`), and `reviewed`. `answer` must exactly match one option. An Extra Hard entry instead uses `kind: "typed"`, `aliases`, and `allowTypo`; it has no `options`. See [the TypeScript schema](lib/game/types.ts) and existing entries for complete examples.

Easy covers recognizable characters and major stories; Medium expects regular-viewer familiarity; Hard asks specific episode details; Extra Hard requires precise recall without choices. Episode metadata is for editorial reference—players never select categories.

The bank's source links point to the [Friends transcript archive](https://www.livesinabox.com/friends/scripts.shtml). Wording and explanations are original; full scripts and official visual assets are not bundled. Transcript references support editorial review but can contain transcription errors. Automated validation cannot prove factual accuracy, appropriate difficulty, or semantic uniqueness; review those when editing.

## Typed-answer policy

`src/utils/answerValidation.ts` normalizes Unicode, case, whitespace, apostrophes, and punctuation, then checks the canonical answer and explicit aliases. It allows one insertion, deletion, substitution, or adjacent transposition in one word only when both word versions are at least five characters. Numeric answers, short words, extra words, and multiple mistakes do not receive fuzzy matching. Editors can disable typo tolerance for ambiguous names. Add reasonable answer variants explicitly rather than broadening fuzzy acceptance.

## Testing

Vitest covers every Classic difficulty, exact Mix ordering, production-pool exhaustion, no repeats, option shuffling, scoring, streak resets, duplicate submissions, results, typed answers, malformed data, and unavailable/corrupt/full localStorage. Production-bank tests enforce the launch gate and substantial pools across all ten seasons. There is no numeric coverage threshold; add behavioral regression tests for changes.

Before submitting changes, run:

```sh
npm run check
npm run validate:launch
npm run format:check
NEXT_PUBLIC_BASE_PATH=/the-one-with-all-the-trivia npm run build
```

For UI changes, check mobile and desktop layouts, keyboard-only play, empty input, feedback focus, replay, and saved records. See [verification and architecture notes](docs/IMPLEMENTATION_PLAN.md).

## GitHub Pages deployment

The app uses Next.js [`output: "export"`](https://nextjs.org/docs/app/guides/static-exports), trailing slashes, and unoptimized images. GitHub Pages is the hosting target; Vercel is not used.

1. Push the project and lockfile to your GitHub repository's `main` branch. Use a public repository for GitHub Pages on GitHub Free.
2. In **Settings → Pages → Build and deployment**, select **GitHub Actions** as the source.
3. The **Deploy to GitHub Pages** workflow runs on every push to `main`; it can also be run manually from **Actions**. If the first push preceded Pages setup, run it manually after enabling Pages.
4. The workflow installs dependencies, runs checks and launch validation, obtains the Pages configuration, builds, uploads `out/`, and deploys with the built-in `GITHUB_TOKEN`. No custom secret is required.
5. Open the URL shown by the deployment job and check the published game.

The workflow follows GitHub's [custom Pages workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages). `actions/configure-pages` supplies `base_path`, supporting both repository paths and domain roots. This repository's default published address is `https://thebonnychan.github.io/the-one-with-all-the-trivia/` once deployed. Pull requests are checked but not published.

`NEXT_PUBLIC_BASE_PATH` is optional public **build-time** configuration. Set it to `/the-one-with-all-the-trivia` for a local build that mirrors this repository's Pages path; leave it empty for a root deployment. After a root build, preview with `python3 -m http.server 4173 --directory out` and open `http://localhost:4173`. Always rebuild after changing the base path.

If deployment fails, inspect the Actions logs, confirm Pages uses GitHub Actions, and check that Actions are permitted for the repository. If assets return 404, check the configured base path and rebuild; do not edit exported files manually.

## Persistence and privacy

Only records are saved under `the-one-with-all-the-trivia.records.v1` in localStorage. Completed Classic rounds update that difficulty's best; unfinished rounds do not. Best streaks include all modes. Records belong to that browser and origin and do not sync between devices. Clearing site data resets them. Storage failures do not prevent play.

All gameplay data and assets load from the static site. Once loaded, a current game needs no network requests; offline reload is not guaranteed because no service worker is installed. The design uses system fonts and original CSS decoration, with no official logo, stills, or promotional images.

## Contributing

Read [AGENTS.md](AGENTS.md) and preserve [the master specification](docs/MASTER_SPECIFICATION.md). Use two-space indentation, camelCase functions, PascalCase components/types, and `*.test.ts` tests; ESLint and Prettier define the code conventions. Use concise imperative commit subjects. Pull requests should explain motivation, behavior, linked issues, and validation; include screenshots for visual changes. Do not commit secrets, dependencies, or generated builds.

This independent fan project is not affiliated with or endorsed by the Friends creators or rights holders.
