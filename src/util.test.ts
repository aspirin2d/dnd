import { describe, expect, it } from "vitest";
import { z } from "zod/v4";
import { chooseFrom, DiceNotation } from "./util";

describe("util.chooseFrom", () => {
  const Item = z.string();
  const Schema = chooseFrom(Item, z.int().min(2).max(3));

  it("accepts when `from.length >= count`", () => {
    const ok = { from: ["a", "b", "c"], count: 2 };
    expect(() => Schema.parse(ok)).not.toThrow();
  });

  it("rejects when `from.length < count`", () => {
    const bad = { from: ["x"], count: 2 };
    expect(() => Schema.parse(bad)).toThrowError(
      /Not enough items to choose from/,
    );
  });
});

describe("util.DiceNotation", () => {
  const valid = ["1d6", "10d20+5", "2d8-3", "3d4+0"];
  for (const s of valid) {
    it(`accepts valid notation "${s}"`, () => {
      expect(() => DiceNotation.parse(s)).not.toThrow();
    });
  }

  const invalid = ["0d6", "1d0", "d6", "2d10++1", "2d6-", "01d6"];
  for (const s of invalid) {
    it(`rejects invalid notation "${s}"`, () => {
      expect(() => DiceNotation.parse(s)).toThrow();
    });
  }
});
