# Question-bank editorial guide

## Launch standard

Maintain at least 2,000 real questions in `data/questions.json`. Aim for 500 per difficulty to provide balanced replay value; the enforced minimum is 2,000 total and 25 in each difficulty. Never generate filler, mechanically reword the same fact, or copy entire third-party quiz collections.

Every entry requires a stable `id`, a stable `factId` identifying the fact being tested, a clear `prompt`, an `answer`, an original `explanation`, a `difficulty`, an answer `kind`, a `source`, and a `reviewed` flag. Use question IDs such as `friends-0001` and specific fact keys such as `character-event-detail`. Fact keys identify semantic duplicates even when wording differs.

## Source and review process

1. Verify the fact against the relevant episode or its transcript. Record the episode as `S01E01` and a precise scene description or timestamp in `source.evidence`; timestamps may vary across edits. Note the edition when necessary. Do not copy scripts into the repository.
2. Write an original question with one defensible answer. Include episode or scene context when multiple answers could otherwise apply.
3. Check the rest of the bank for repeated facts and answers that reveal another question. Assign the same fact key to attempted rewordings so validation catches them.
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
