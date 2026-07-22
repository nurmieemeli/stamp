import { describe, expect, it } from "vitest";
import { contrastInk } from "./color";

describe("contrastInk", () => {
  it("picks black for white", () => {
    expect(contrastInk("#ffffff")).toBe("#000000");
  });

  it("picks white for black", () => {
    expect(contrastInk("#000000")).toBe("#ffffff");
  });

  it("picks white for pure blue, which looks mid-bright but has low relative luminance", () => {
    expect(contrastInk("#0000ff")).toBe("#ffffff");
  });

  it("picks black for pure yellow", () => {
    expect(contrastInk("#ffff00")).toBe("#000000");
  });

  it("matches the built-in Amber palette's hand-picked accentInk direction", () => {
    // Amber's accent (#E8A33D) uses a dark ink (#1A1300) — confirms the
    // formula agrees with the existing hand-tuned palettes' intent even
    // though it won't reproduce their exact warm-toned values.
    expect(contrastInk("#E8A33D")).toBe("#000000");
  });
});
