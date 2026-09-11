import { describe, expect, it } from "vitest";
import {
  matchesTypedAnswer,
  normalizeAnswer,
} from "../src/utils/answerValidation";

describe("typed answer matching", () => {
  it("accepts the specification's conservative insertion example", () => {
    expect(matchesTypedAnswer("chandeler", "Chandler")).toBe(true);
    expect(matchesTypedAnswer("Charlie", "Chandler")).toBe(false);
  });
  it("normalizes case, diacritics, whitespace, apostrophes, and punctuation", () => {
    expect(normalizeAnswer("  RÉGINA   Phalange!! ")).toBe("regina phalange");
    expect(normalizeAnswer("Chandler’s")).toBe("chandlers");
    expect(matchesTypedAnswer("Jean Luc", "Jean-Luc")).toBe(true);
  });
  it("accepts explicit aliases without guessing abbreviations", () => {
    expect(matchesTypedAnswer("Dr Green", "Leonard Green", ["Dr. Green"])).toBe(
      true,
    );
    expect(matchesTypedAnswer("Dr Green", "Leonard Green")).toBe(false);
  });
  it.each(["Chandlr", "Chandller", "Chandlar", "Chandlre"])(
    "accepts one minor error: %s",
    (value) => {
      expect(matchesTypedAnswer(value, "Chandler")).toBe(true);
    },
  );
  it.each([
    "",
    "  ",
    "!!!",
    "Ross",
    "Chan",
    "Chxndlxr",
    "Chandler Bing",
    "not Chandler",
  ])("rejects invalid or substantively different answers: %s", (value) => {
    expect(matchesTypedAnswer(value, "Chandler")).toBe(false);
  });
  it("rejects misspellings in short words and numbers", () => {
    expect(matchesTypedAnswer("Rose", "Ross")).toBe(false);
    expect(matchesTypedAnswer("12346", "12345")).toBe(false);
    expect(matchesTypedAnswer("Chandlr 5", "Chandler 5")).toBe(false);
  });
  it("permits only one changed long word", () => {
    expect(
      matchesTypedAnswer("Chandlr Muriel Bing", "Chandler Muriel Bing"),
    ).toBe(true);
    expect(
      matchesTypedAnswer("Chandlr Muriel Bng", "Chandler Muriel Bing"),
    ).toBe(false);
  });
  it("supports disabling fuzzy matching for easily confused answers", () => {
    expect(matchesTypedAnswer("Chandlr", "Chandler", [], false)).toBe(false);
  });
});

describe("shortened answers", () => {
  it("accepts a majority of correct words in order", () => {
    expect(matchesTypedAnswer("my best bud", "To my best bud")).toBe(true);
    expect(matchesTypedAnswer("best my bud", "To my best bud")).toBe(false);
    expect(matchesTypedAnswer("best bud", "To my best bud")).toBe(false);
    expect(matchesTypedAnswer("not my best bud", "To my best bud")).toBe(false);
    expect(matchesTypedAnswer("my best bud or pal", "To my best bud")).toBe(
      false,
    );
    expect(matchesTypedAnswer("my best friend", "Not my best friend")).toBe(
      false,
    );
    expect(matchesTypedAnswer("hundred dollars", "One hundred dollars")).toBe(
      false,
    );
  });
});
