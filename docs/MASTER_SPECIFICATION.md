# Build a Complete Friends Trivia Web App

Build a complete, polished, fully playable trivia web application based on the TV series _Friends_.

## Official App Name

**The One With All the Trivia**

Use this exact name throughout the application wherever the app name is displayed or referenced, including:

- Browser title
- Page metadata
- Home screen
- Results screen where appropriate
- README
- GitHub repository/project documentation
- Any app branding

Possible subtitle:

**How well do you really know Friends?**

Do not use the official _Friends_ logo or reproduce official show branding.

---

# 1. Core Goal

Create a fun, polished, nostalgic, responsive trivia game that feels like a professionally made fan project.

The app should be:

- Completely free to run
- Static
- Suitable for GitHub Pages
- Fully playable without a backend
- Mobile-first
- Responsive on desktop
- Accessible
- Fast
- Easy to maintain
- Easy to add questions to later

Do **not** stop at scaffolding or placeholders. Build the complete playable MVP.

---

# 2. Technology Stack

Use:

- Next.js
- React
- TypeScript
- Tailwind CSS
- Next.js App Router

Configure the application for **static export** so it can be hosted on **GitHub Pages**.

Do not use:

- Vercel
- A backend server
- A database
- User authentication
- Paid APIs
- Required external runtime services
- Server-side functionality that prevents static hosting

All trivia questions should be stored locally in the project.

Use browser `localStorage` for persistent client-side data such as:

- Best Classic score
- Best streak
- User preferences if useful

---

# 3. GitHub Pages Deployment

The application must be specifically configured for GitHub Pages.

Include:

- Static export configuration
- Correct handling of the repository `basePath`
- Correct asset paths
- GitHub Actions workflow
- Automatic deployment when changes are pushed to `main`

The repository should be able to:

1. Install dependencies
2. Build the project
3. Export the static site
4. Deploy it to GitHub Pages

Do not assume Vercel deployment.

Include a complete README explaining the GitHub Pages setup.

---

# 4. Visual Design

Create an original visual identity inspired by the cozy atmosphere of a 1990s New York sitcom.

Do **not** copy the official _Friends_ logo, typography, promotional graphics, screenshots, episode stills, or other copyrighted visual assets.

Use an original design featuring:

- Warm cream/off-white background
- Purple accents
- Yellow accents
- Teal accents
- Orange accents
- Rounded cards
- Soft shadows
- Playful but readable typography
- Colorful circular/abstract decorative elements
- Subtle 1990s-inspired graphic details
- Cozy coffee-shop/apartment atmosphere
- Nostalgic but modern styling

The design should feel:

- Fun
- Warm
- Nostalgic
- Playful
- Polished
- Modern
- Clean

Do not make it overly busy.

---

# 5. App Branding

The primary home-screen branding should look conceptually like:

THE ONE WITH
ALL THE TRIVIA

How well do you really know Friends?

[ PLAY ]

25 Questions
500+ Questions

The typography and layout should be original and should not imitate the official _Friends_ logo.

A prominent **Mix** option may also be highlighted:

THE ONE WITH
ALL THE TRIVIA

MIX

Start easy.
Finish like a true Friends expert.

[ PLAY MIX ]

---

# 6. Question Bank

Launch with **at least 500 unique trivia questions**.

Do not use placeholder questions.

The questions must be actual _Friends_ trivia.

Target distribution:

- Easy: approximately 125–150
- Medium: approximately 125–150
- Hard: approximately 125–150
- Extra Hard: approximately 100–125

The exact distribution can vary slightly as long as there are at least 500 total and every difficulty has a substantial question pool.

Questions should cover a broad range of the series.

Include topics such as:

- Main characters
- Recurring characters
- Minor characters
- Relationships
- Friendships
- Family members
- Episodes
- Specific episode events
- Quotes
- Jobs
- Careers
- Apartments
- Homes
- Food
- Cooking
- Pets
- Animals
- Weddings
- Birthdays
- Holidays
- Trips
- Events
- Storylines
- Locations
- Nicknames
- Props
- Objects
- Businesses
- Places
- Character histories
- Specific details from individual episodes
- Series-wide facts
- Chronology
- Running jokes
- Character quirks

Avoid relying exclusively on famous/basic facts.

The Hard and Extra Hard pools should contain genuinely challenging details that reward someone who has watched the series carefully.

---

# 7. Question Quality Requirements

Every question must be:

- Factually accurate
- Unambiguous
- Unique
- Clearly worded
- Appropriate for its assigned difficulty
- Relevant to the actual television series
- Free from accidental duplicates

Do not create questions that are essentially the same question with slightly different wording.

Avoid questions where multiple answers could reasonably be considered correct.

Each question should include a short explanation explaining the correct answer.

Example structure:

```ts
{
  id: string,
  question: string,
  answerType: "multiple-choice" | "text",
  answers?: string[],
  correctAnswer: string,
  acceptedAnswers?: string[],
  difficulty: "easy" | "medium" | "hard" | "extra-hard",
  category?: string,
  explanation: string
}
```

Use unique stable IDs.

---

# 8. Question Categories

Categories may be included internally to help organize the question database.

For example:

- Characters
- Episodes
- Relationships
- Quotes
- Jobs
- Food
- Locations
- Objects
- Pets
- Storylines
- Miscellaneous

However:

**Players should NOT select categories.**

The player only chooses the game mode/difficulty.

---

# 9. Difficulty Levels

There are four difficulty levels:

### Easy

Recognizable facts that casual _Friends_ fans may know.

### Medium

Requires more familiarity with the series.

### Hard

Requires strong knowledge of episodes and character details.

### Extra Hard

Very specific details intended for serious _Friends_ fans.

Extra Hard questions should generally require recall of details that would not be obvious from general knowledge of the show.

---

# 10. Classic Mode

Classic Mode is exactly:

**25 questions**

The player chooses:

- Easy
- Medium
- Hard
- Extra Hard
- Mix

For Easy, Medium, and Hard:

- Select 25 random unique questions from the chosen difficulty
- Use multiple choice
- Display four answer choices

For Extra Hard:

- Select 25 random unique Extra Hard questions
- Do NOT use multiple choice
- Require the player to type the answer

No question may appear more than once in the same game.

Randomize multiple-choice answer order.

---

# 11. Mix Mode

Mix Mode must contain exactly 25 questions with this distribution:

### Questions 1–6

**6 Easy**

### Questions 7–12

**6 Medium**

### Questions 13–19

**7 Hard**

### Questions 20–25

**6 Extra Hard**

Total:

**25 questions**

The difficulty progression must remain in this exact order.

Randomize questions within each difficulty group, but do not shuffle the groups.

Therefore:

- Q1–Q6 = Easy
- Q7–Q12 = Medium
- Q13–Q19 = Hard
- Q20–Q25 = Extra Hard

Questions 1–19 use multiple choice.

Questions 20–25 use text input.

At Question 20, provide a subtle visual transition indicating that the player has entered the Extra Hard round.

For example:

**EXTRA HARD ROUND**

No multiple choice.
Type your answer.

This should feel exciting rather than disruptive.

---

# 12. Endless Mode

Also implement an Endless Mode.

The player chooses:

- Easy
- Medium
- Hard
- Extra Hard
- Mix

For a specific difficulty:

- Continue presenting unique questions
- Never silently repeat questions
- Continue until the player manually ends the game or the question pool is exhausted
- Track:

  - Questions answered
  - Correct
  - Incorrect
  - Score
  - Current streak
  - Best streak

When the selected question pool is exhausted, gracefully end the game and explain that the available questions have been completed.

Do not repeat questions just to keep the game running.

---

# 13. Endless Mix

Endless Mix should progressively increase difficulty:

### Questions 1–5

Easy

### Questions 6–10

Medium

### Questions 11–15

Hard

### Question 16 onward

Extra Hard

Once Extra Hard begins, remain at Extra Hard until:

- The player ends the game, or
- The Extra Hard pool is exhausted.

Do not cycle back to Easy.

---

# 14. Extra Hard Answer Input

Extra Hard questions must use typed answers rather than multiple choice.

The answer system should be forgiving enough to accept reasonable minor mistakes.

Answers should be:

- Case-insensitive
- Trimmed
- Normalized for whitespace
- Normalized for common punctuation
- Able to handle apostrophe variations

For example, these should generally be treated as equivalent:

`Chandler`

`chandler`

`Chandler`

If appropriate, support aliases through:

```ts
acceptedAnswers?: string[]
```

Examples of acceptable aliases may include:

- First name vs. full name
- Full name vs. commonly used character name
- Alternate punctuation
- Reasonable variations of the same answer

---

# 15. Fuzzy Answer Matching

Implement reusable answer-validation logic in:

```text
src/utils/answerValidation.ts
```

Validation order should be approximately:

1. Normalize the user's answer
2. Check exact normalized match
3. Check accepted aliases
4. Perform conservative fuzzy matching

Fuzzy matching should accept minor spelling mistakes while rejecting clearly incorrect answers.

Use a conservative similarity/edit-distance threshold.

Short answers should have stricter matching requirements.

Longer answers can tolerate slightly more variation.

Do not make fuzzy matching so aggressive that obviously wrong answers are accepted.

Examples:

Correct:

`Chandler`

User:

`chandeler`

This may reasonably be accepted.

But an unrelated answer should not be accepted simply because it shares a few letters.

---

# 16. Home Screen

Create a polished home screen containing:

- App title
- Subtitle
- Game mode selection
- Difficulty selection
- Start Game button
- Best Classic score
- Best streak

Do not include category selection.

Make Mix visually prominent because it is the signature progression-based mode.

The interface should immediately communicate:

- What the game is
- How to start
- What modes exist

---

# 17. Game Screen

Display:

- Question number
- Total number of questions when applicable
- Progress bar
- Score
- Current streak
- Best streak
- Question
- Answer controls

For multiple-choice questions:

- Four large answer buttons

For Extra Hard:

- Text input
- Submit button
- Enter key submits

Do not allow empty submissions.

After the player answers:

- Disable further answer input
- Clearly indicate correct/incorrect
- Show the correct answer when the player is wrong
- Show the explanation
- Display a Next Question button

Do **not** automatically advance to the next question.

The player should control when they continue.

---

# 18. Scoring

Implement clear score and streak tracking.

Track:

- Current score
- Correct answers
- Incorrect answers
- Current streak
- Best streak

For Classic, display the final score out of 25.

Use a straightforward scoring system unless there is a compelling reason to make it more sophisticated.

Prioritize clarity over unnecessary complexity.

---

# 19. Results Screen

For Classic Mode show:

- Score /25
- Percentage
- Correct
- Incorrect
- Best streak
- Selected difficulty/mode
- Fun performance message
- Play Again
- Return Home

Suggested performance messages:

### 0–6

"You might need another rewatch!"

### 7–13

"Not bad! You're definitely a fan."

### 14–19

"Could you BE any more knowledgeable?"

### 20–24

"You're ready to move into Monica's apartment."

### 25

"THE ONE WHO KNOWS EVERYTHING!"

For Endless Mode show:

- Total answered
- Correct
- Incorrect
- Score
- Best streak
- Selected difficulty
- Play Again
- Return Home

---

# 20. Suggested Component Structure

Organize the UI into reusable components such as:

```text
Header
GameSetup
DifficultySelector
GameCard
MultipleChoiceAnswers
TextAnswerInput
ProgressBar
ScoreDisplay
ResultsCard
```

Use additional components when appropriate.

Keep the architecture clean and maintainable.

---

# 21. Suggested Project Structure

Use a structure similar to:

```text
src/
  app/
  components/
  data/
  hooks/
  types/
  utils/
```

Suggested files:

```text
src/data/questions.ts
src/types/trivia.ts
src/utils/answerValidation.ts
src/utils/gameLogic.ts
src/utils/shuffle.ts
```

Organize the actual implementation however you determine is cleanest, but keep trivia data, game logic, types, and UI reasonably separated.

---

# 22. State Management

Do not introduce unnecessary state-management libraries.

React state/hooks should be sufficient.

Track game state such as:

- Current question
- Current question index
- Selected answer
- Whether the question has been answered
- Correct/incorrect status
- Score
- Streak
- Best streak
- Game mode
- Difficulty
- Question pool

Keep game logic deterministic and testable where practical.

---

# 23. Randomization

Implement reliable randomization utilities.

When starting a game:

- Randomly select the appropriate questions
- Ensure no duplicate question IDs
- Shuffle multiple-choice answers
- Preserve Mix difficulty ordering

Do not mutate the original question database.

---

# 24. Accessibility

Use accessible semantic HTML.

Requirements include:

- Keyboard navigation
- Visible focus states
- Proper labels
- Accessible form controls
- Sufficient contrast
- Buttons that are clearly identifiable
- Do not communicate correctness solely through color
- Appropriate ARIA attributes where necessary

The game should be usable without a mouse.

---

# 25. Responsive Design

Design mobile-first.

The application must work well on:

- iPhone-sized screens
- Android phones
- Tablets
- Desktop
- Large desktop screens

Question and answer controls should remain comfortable to tap on mobile.

Avoid layouts that require horizontal scrolling.

---

# 26. Animations

Use subtle animations to make the experience feel polished.

Possible animations:

- Card entrance
- Button hover
- Button press
- Correct/incorrect feedback
- Progress bar movement
- Results entrance
- Extra Hard transition

Keep animations restrained.

Do not make the interface distracting.

Respect `prefers-reduced-motion`.

---

# 27. Local Storage

Use browser localStorage to preserve appropriate data.

At minimum:

- Best Classic score
- Best streak

Do not store unnecessary personal information.

The application should still function normally if localStorage is unavailable.

---

# 28. Question Validation Tests

Create automated tests or validation utilities that verify the question database.

At minimum verify:

- At least 500 questions
- Every question has a unique ID
- No exact duplicate question text
- No obvious duplicate/near-duplicate questions where practical
- Every question has a valid difficulty
- Easy/Medium/Hard questions are multiple choice
- Extra Hard questions are text input
- Multiple-choice questions have exactly four answers
- The correct answer exists in the answer list
- Every question has an explanation
- Extra Hard questions have appropriate accepted answers where needed

---

# 29. Game Logic Tests

Test:

- Classic always produces exactly 25 questions
- No duplicates within a Classic game
- Easy Classic contains only Easy questions
- Medium Classic contains only Medium questions
- Hard Classic contains only Hard questions
- Extra Hard Classic contains only Extra Hard questions
- Mix contains exactly:

  - 6 Easy
  - 6 Medium
  - 7 Hard
  - 6 Extra Hard

- Mix maintains the correct difficulty ordering
- Endless does not repeat questions
- Endless Mix follows the correct progression
- Score updates correctly
- Correct answers increase streak
- Incorrect answers reset current streak
- Best streak is preserved correctly
- Results calculate percentage correctly

---

# 30. Answer Validation Tests

Test:

- Exact answers
- Case differences
- Leading/trailing whitespace
- Multiple spaces
- Apostrophe variations
- Punctuation
- Accepted aliases
- Minor spelling mistakes
- Clearly incorrect answers
- Short-answer strictness
- Longer-answer tolerance

Make sure fuzzy matching does not create obvious false positives.

---

# 31. Data Quality

Before considering the project complete, review the full question bank for:

- Factual accuracy
- Ambiguous wording
- Duplicate concepts
- Incorrect answers
- Incorrect episode details
- Incorrect character names
- Incorrect chronology
- Inappropriate difficulty classifications
- Repeated questions
- Multiple valid answers

Do not prioritize reaching 500 questions at the expense of quality.

If a question is questionable, replace it with a better one.

---

# 32. README

Create a complete README containing:

## The One With All the Trivia

Explain:

- What the project is
- Features
- Technology stack
- Project structure
- Installation
- Development commands
- Production build
- How to add questions
- Question schema
- Difficulty levels
- Classic Mode
- Mix Mode
- Endless Mode
- Extra Hard answer validation
- Testing
- GitHub Pages deployment

Include instructions for configuring the GitHub repository and enabling GitHub Pages through GitHub Actions.

---

# 33. GitHub Actions

Create a GitHub Actions workflow that:

- Runs on pushes to `main`
- Installs dependencies
- Builds the static site
- Uploads the generated site
- Deploys to GitHub Pages

Make sure the workflow is compatible with the chosen Next.js static export configuration.

---

# 34. No Paid Services

The final project should require:

**$0 to run**

Do not introduce:

- Paid APIs
- Paid databases
- Paid hosting
- Subscription services
- Required third-party accounts

The only required hosting should be GitHub Pages.

---

# 35. Performance

Optimize for a lightweight static site.

Avoid unnecessary dependencies.

The question bank should be bundled locally.

Do not make external network requests during gameplay.

The game should continue functioning without an internet connection after the site has loaded, as far as practical for a static web application.

---

# 36. Error Handling

Handle gracefully:

- Missing localStorage
- Invalid game state
- Empty answer submission
- Exhausted question pools
- Unexpected question data
- Invalid difficulty
- Invalid game mode

Do not let the application crash because of malformed local state.

---

# 37. Implementation Order

Build the project in logical stages:

### Stage 1

Project structure, Next.js, TypeScript, Tailwind, App Router.

### Stage 2

Types and question data structure.

### Stage 3

Create the complete 500+ question bank.

### Stage 4

Add question validation.

### Stage 5

Implement answer normalization and fuzzy validation.

### Stage 6

Implement reusable shuffle and game-logic utilities.

### Stage 7

Build Classic Mode.

### Stage 8

Build Mix Mode.

### Stage 9

Build Endless Mode.

### Stage 10

Build the polished UI.

### Stage 11

Add responsive behavior and accessibility.

### Stage 12

Add animations and visual polish.

### Stage 13

Add tests and question validation.

### Stage 14

Configure static export and GitHub Pages.

### Stage 15

Create GitHub Actions deployment workflow.

### Stage 16

Complete README.

### Stage 17

Run a final production build and fix all issues.

---

# 38. Final Verification

Before declaring the project finished, verify:

- `npm install` works
- Development server works
- Production build works
- Static export works
- TypeScript has no errors
- No obvious runtime errors
- Home screen works
- Classic works
- Mix works
- Endless works
- Extra Hard text input works
- Enter submits answers
- Empty answers are prevented
- Correct/incorrect feedback works
- Explanations appear
- Next Question works
- Results work
- Play Again works
- Return Home works
- Scores persist
- Streaks work
- Question pools do not duplicate questions within a game
- 500+ questions exist
- Mix has exactly 6/6/7/6 questions
- Mix difficulty progression is correct
- Endless Mix progression is correct
- Mobile layout works
- Desktop layout works
- Keyboard navigation works
- Reduced-motion preference works
- GitHub Pages configuration works
- GitHub Actions workflow is valid

Fix any errors you discover rather than simply documenting them.

---

# 39. Important Final Instruction

Do not stop after creating the project structure.

Do not leave:

- TODOs
- Placeholder questions
- Fake question data
- Unimplemented buttons
- Empty screens
- Mock functionality
- Missing game modes

The final result should be a **complete, playable Friends trivia game** named:

# The One With All the Trivia

with:

- 500+ real trivia questions
- Easy
- Medium
- Hard
- Extra Hard
- Classic Mode
- Mix Mode
- Endless Mode
- Typed Extra Hard answers
- Fuzzy answer validation
- Score tracking
- Streak tracking
- Local persistence
- Responsive design
- Accessibility
- Tests
- Static export
- GitHub Pages deployment
- GitHub Actions
- Complete documentation

Build the application end-to-end and verify it before considering the task complete.

## Subsequent question-bank requirement

The user increased the required local bank from 500 to 2,000 questions. Preserve the original quality and verification requirements; the expanded bank contains 500 questions per difficulty.
