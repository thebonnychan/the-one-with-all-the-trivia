import friends from "../data/questions.json";
import bobs from "../data/bobs-burgers.json";
import { validateBank } from "../lib/game/validate-bank";

const launch = process.argv.includes("--launch");
for (const [name, questions, minimum] of [
  ["Friends", friends, 2000],
  ["Bob's Burgers", bobs, 1000],
] as const) {
  const errors = validateBank(questions, launch, minimum);
  if (errors.length) {
    console.error(`${name}:\n${errors.join("\n")}`);
    process.exitCode = 1;
  } else
    console.log(
      `${name}: ${questions.length} questions passed ${launch ? "launch" : "structural"} validation.`,
    );
}
if (!launch)
  console.log(
    "Structural checks do not certify factual accuracy. Run validate:launch before publication.",
  );
