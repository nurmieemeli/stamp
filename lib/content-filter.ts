import { RegExpMatcher, englishDataset, englishRecommendedTransformers } from "obscenity";

// englishDataset ships slurs and general profanity; the recommended
// transformers catch common evasion (leetspeak, confusable unicode, mixed
// case) without being so aggressive they flag ordinary words — see
// lib/content-filter.test.ts for the false-positive/true-positive cases this
// was checked against before wiring it into any form.
const matcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});

export function containsProfanity(text: string): boolean {
  if (!text) return false;
  return matcher.hasMatch(text);
}
