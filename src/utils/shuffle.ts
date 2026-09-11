export function shuffled<T>(
  values: readonly T[],
  random: () => number = Math.random,
): T[] {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const value = random();
    if (value < 0 || value >= 1 || !Number.isFinite(value)) {
      throw new Error("Random source must return a number in [0, 1).");
    }
    const j = Math.floor(value * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
