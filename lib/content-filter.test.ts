import { describe, expect, it } from "vitest";
import { containsProfanity } from "./content-filter";

describe("containsProfanity", () => {
  it("catches slurs and profanity, including basic evasion", () => {
    expect(containsProfanity("nigger")).toBe(true);
    expect(containsProfanity("chink")).toBe(true);
    expect(containsProfanity("kike")).toBe(true);
    expect(containsProfanity("faggot")).toBe(true);
    expect(containsProfanity("retard")).toBe(true);
    expect(containsProfanity("fuck you")).toBe(true);
    expect(containsProfanity("n1gger")).toBe(true); // leetspeak
  });

  it("doesn't flag ordinary words that merely contain a bad substring", () => {
    // The classic "Scunthorpe problem" cases word-list filters get wrong.
    expect(containsProfanity("Essex")).toBe(false);
    expect(containsProfanity("Scunthorpe")).toBe(false);
    expect(containsProfanity("classic")).toBe(false);
    expect(containsProfanity("assassin")).toBe(false);
    expect(containsProfanity("bassist")).toBe(false);
    expect(containsProfanity("Massachusetts")).toBe(false);
    expect(containsProfanity("therapist")).toBe(false);
    expect(containsProfanity("Scotland")).toBe(false);
  });

  it("doesn't flag typical profile content", () => {
    expect(containsProfanity("Rhea Solano")).toBe(false);
    expect(containsProfanity("Sound Archivist — Bristol, UK")).toBe(false);
    expect(containsProfanity("Field recordings dubbed to cassette, one small batch at a time.")).toBe(false);
    expect(containsProfanity("undertow-tapes")).toBe(false);
  });

  it("treats empty input as clean", () => {
    expect(containsProfanity("")).toBe(false);
  });
});
