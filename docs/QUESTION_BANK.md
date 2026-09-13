# Question-bank editorial guide

## Launch standard

Maintain at least 2,000 real Friends questions in `data/questions.json` and 1,000 Bob's Burgers questions in `data/bobs-burgers.json` (250 per difficulty). Friends has 500 per difficulty. Launch validation enforces each series' total minimum and at least 25 per difficulty; production tests enforce the balanced distribution. Never generate filler, mechanically reword the same fact, or copy entire third-party quiz collections.

Every entry requires a stable `id`, a stable `factId` identifying the fact being tested, a clear `prompt`, an `answer`, an original `explanation`, a `difficulty`, an answer `kind`, a `source`, and a `reviewed` flag. Use question IDs such as `friends-0001` and specific fact keys such as `character-event-detail`. Fact keys identify semantic duplicates even when wording differs. A fact may have one multiple-choice entry and one distinct Extra Hard fill-in-the-blank entry, as explicitly permitted by the user.

## Source and review process

1. Verify the fact against the relevant episode, transcript, or a reliable episode guide whose summary explicitly supports it. Record the episode as `S01E01` and a precise scene description or timestamp in `source.evidence`; timestamps may vary across edits. Note the edition when necessary. Do not copy scripts into the repository.
2. Write an original question with one defensible answer. Include episode or scene context when multiple answers could otherwise apply.
3. Check the rest of the bank for repeated facts and answers that reveal another question. Use the same fact key for a permitted typed variant. Other repeated facts within the same answer kind are rejected.
4. For multiple choice, provide exactly four distinct, plausible options and make `answer` exactly match one option. Avoid overlapping choices, joke distractors, and answers that become obvious from grammar or length.
5. For Extra Hard, use `kind: "typed"`, an `aliases` array, and a boolean `allowTypo`. Include legitimate alternate spellings or names explicitly; do not accept vague fragments. Disable fuzzy matching when similar names could refer to different people.
6. Review factual accuracy, source evidence, wording, options, aliases, and difficulty. Set `reviewed: true` only after the review is actually complete. A boolean flag is a record of review, not proof of accuracy.
7. Run `npm run validate:bank`. Before release, run `npm run validate:launch` and manually audit the complete bank for semantic duplicates and difficulty balance.

## Difficulty rubric

| Difficulty | Editorial expectation                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------- |
| Easy       | Recognizable main characters, recurring locations, major relationships, or central storylines.    |
| Medium     | Distinctive events and recurring details familiar to regular viewers.                             |
| Hard       | Specific supporting characters, objects, or events requiring close recall; still multiple choice. |
| Extra Hard | Precise, obscure but verifiable details that can be answered concisely without choices.           |

Difficulty must reflect recall difficulty rather than confusing wording. Do not create player-selectable categories. Episode references are editorial metadata, not player filters.

## Current bank provenance

The expanded bank contains 2,000 originally worded questions, balanced at 500 per difficulty and spanning all ten seasons. Its episode links reference the Lives in a Box transcript archive. Review used these text references; it does not claim a fresh viewing of every episode. `source.evidence` summarizes the relevant scene in original words. Full transcripts, official artwork, and copied quiz collections are not included. Resolve discrepancies against the episode itself and preserve accepted name variants where transcript spellings differ.

## Review limitations

The validator checks structure, unique IDs/fact keys/normalized prompts, source fields, choice validity, difficulty, review status, and launch counts. It cannot establish factual truth or catch every paraphrase. The synthetic fixtures under `tests/` exist only to exercise those checks and must never be copied into the production bank.

## Bob's Burgers provenance — September 12, 2026

The launch bank contains 1,000 originally worded entries: 750 multiple-choice questions and 250 typed fill-in-the-blank variants of Hard facts. Each difficulty contains exactly 250 entries. Sources span TV seasons 1–16, through the May 17, 2026 season finale; movie material is excluded. This does not mean every episode has a question.

Research used TVmaze's individual episode guides and, for the expansion, Wikipedia's individual episode plot articles, with season coverage cross-checked against current season listings. Each entry links its episode page and includes an original supporting fact summary. Review covered question wording, source support, answer choices, within-kind fact duplication, typed blanks, aliases, and difficulty. This was a text-source review, not a claim to have watched every episode. Full source summaries are not distributed. If a guide and the episode conflict, the episode takes priority.

Existing IDs `bobs-0001` through `bobs-0500` and their fact keys remain stable. The expansion appends `bobs-0501` through `bobs-1000`, including 375 new multiple-choice facts and 125 typed variants. Existing Classic history therefore remains valid and prioritizes unseen additions. New questions draw on additional episode details, especially seasons 1–7; the combined bank still spans seasons 1–16. Prompts avoid “sister” hints and answer-revealing titles; neutral context identifies the scene. Typed variants share their multiple-choice counterpart's fact key, as permitted. Neither bank is generated during gameplay; the checked-in JSON is loaded from the static site's own assets.

## Friends Extra Hard balance — September 13, 2026

Replaced 125 first-name, full-name, and surname prompts with manually written fill-in-the-blank variants of existing reviewed Hard facts. Explicit name prompts decreased from 137 to 12; other occasional character, nickname, and fictional-name questions remain. The replacements cover objects, food, locations, entertainment, and scene details across all ten seasons. They use the existing episode evidence and share their Hard counterpart's fact key, as permitted by the user. This edit reviewed the existing local evidence and context, not a fresh viewing of the episodes.

The bank remains at 2,000 questions, 500 per difficulty. New entries have IDs `friends-2001` through `friends-2125`; 125 old name-question IDs are retired. IDs are identities, not a contiguous count. All unchanged questions keep their IDs and content, and stored Classic history automatically prioritizes unseen replacements. No character photographs are required. Review overall variety as well as the automated guardrail limiting explicit first/full-name/surname prompts to 15.
