import questions from "../data/questions.json";
import { validateBank } from "../lib/game/validate-bank";

const launch = process.argv.includes("--launch");
const errors = validateBank(questions, launch);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `${questions.length} questions passed ${launch ? "launch" : "structural"} validation.`,
  );
  if (!launch)
    console.log(
      "This does not certify factual accuracy or launch readiness. Run validate:launch before publication.",
    );
}
