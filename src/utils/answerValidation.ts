export function normalizeAnswer(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[’'`]/gu, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .trim()
    .replace(/\s+/gu, " ");
}

function oneEditApart(left: string, right: string): boolean {
  if (Math.abs(left.length - right.length) > 1) return false;
  if (left.length === right.length) {
    const mismatches = [...left].flatMap((char, i) =>
      char !== right[i] ? [i] : [],
    );
    if (mismatches.length === 1) return true;
    if (mismatches.length !== 2) return false;
    const [a, b] = mismatches;
    return b === a + 1 && left[a] === right[b] && left[b] === right[a];
  }
  const [short, long] =
    left.length < right.length ? [left, right] : [right, left];
  let i = 0;
  while (i < short.length && short[i] === long[i]) i++;
  return short.slice(i) === long.slice(i + 1);
}

export function matchesTypedAnswer(
  input: string,
  answer: string,
  aliases: readonly string[] = [],
  allowTypo = true,
): boolean {
  const normalized = normalizeAnswer(input);
  if (!normalized || normalized.length > 200) return false;
  return [answer, ...aliases].some((candidate) => {
    const expected = normalizeAnswer(candidate);
    if (normalized === expected) return true;
    if (!allowTypo || /\d/.test(normalized + expected)) return false;
    const enteredWords = normalized.split(" ");
    const expectedWords = expected.split(" ");
    if (enteredWords.length !== expectedWords.length) return false;
    let changes = 0;
    for (let i = 0; i < expectedWords.length; i++) {
      const entered = enteredWords[i];
      const target = expectedWords[i];
      if (entered === target) continue;
      // Short words, extra words, and multiple misspellings need explicit aliases.
      if (
        Math.min(entered.length, target.length) < 5 ||
        !oneEditApart(entered, target)
      ) {
        return false;
      }
      changes++;
    }
    return changes === 1;
  });
}
