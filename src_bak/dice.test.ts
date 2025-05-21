import { describe, it, expect, vi, afterEach } from "vitest";
import { parse, roll, roll20, type Modifier, type Roll20Options } from "./dice";

// Utility to mock Math.random to produce predictable rolls
export function mockRandomSequence(...values: number[]) {
  let i = 0;
  vi.spyOn(Math, "random").mockImplementation(() => values[i++ % values.length]);
}

afterEach(() => {
  vi.restoreAllMocks(); // Clean up after each test
});

describe("parse", () => {
  it("parses standard dice notations", () => {
    expect(parse("2d6+3")).toEqual({ diceCount: 2, diceSides: 6, modifier: 3 });
    expect(parse("1d20")).toEqual({ diceCount: 1, diceSides: 20, modifier: 0 });
    expect(parse("d8")).toEqual({ diceCount: 1, diceSides: 8, modifier: 0 });
    expect(parse("3d4-2")).toEqual({ diceCount: 3, diceSides: 4, modifier: -2 });
    expect(parse("10d12")).toEqual({ diceCount: 10, diceSides: 12, modifier: 0 });
  });

  it("trims spaces", () => {
    expect(parse(" 2d6+1 ")).toEqual({ diceCount: 2, diceSides: 6, modifier: 1 });
  });

  it("throws on invalid dice notation", () => {
    expect(() => parse("bad")).toThrow();
    expect(() => parse("1d")).toThrow();
    expect(() => parse("d0")).toThrow();
    expect(() => parse("0d6")).toThrow();
    expect(() => parse("2d-1")).toThrow();
    expect(() => parse("")).toThrow();
  });
});

describe("roll", () => {
  it("rolls the correct number of dice, returns total plus modifier", () => {
    // Mock random: always 0.5 (so Math.floor(0.5 * N) + 1 = N/2 + 1)
    // For d6: Math.floor(0.5 * 6) + 1 = 3 + 1 = 4
    mockRandomSequence(0.5, 0.5); // repeat for each die
    expect(roll("2d6+3")).toBe(4 + 4 + 3); // two dice + modifier
  });

  it("handles 'double' parameter (for crits, e.g., 2x dice)", () => {
    mockRandomSequence(0.2, 0.8, 0.1, 0.9); // 2d4 crit: rolls 4 dice
    // 0.2 * 4 = 0.8 -> 0 + 1 = 1; 0.8*4=3.2->3+1=4; 0.1*4=0.4->0+1=1; 0.9*4=3.6->3+1=4
    expect(roll("2d4", true)).toBe(1 + 4 + 1 + 4);
  });
});

describe("roll20", () => {
  const baseOptions: Omit<Roll20Options, "target"> = { modifiers: [] };

  it("rolls 1d20 by default, applies modifiers, and checks success", () => {
    mockRandomSequence(0.9); // 0.9*20=18->18+1=19
    const result = roll20({ ...baseOptions, target: 15 });
    expect(result.roll).toBe(19);
    expect(result.total).toBe(19);
    expect(result.success).toBe(true);
    expect(result.dice).toBe("1d20");
    expect(result.rolls).toEqual([19]);
    expect(result.critical).toBeUndefined();
  });

  it("applies modifiers to roll", () => {
    mockRandomSequence(0); // roll = 1
    const mods: Modifier[] = [
      { source: "bonus", value: 3 },
      { source: "magic", value: 2 },
    ];
    const result = roll20({ modifiers: mods, target: 5 });
    expect(result.roll).toBe(1);
    expect(result.total).toBe(6);
    // This should be a critical fail, so success is false and critical is true
    expect(result.critical).toBe(true);
    expect(result.success).toBe(false);
  });

  it("handles advantage (uses higher roll)", () => {
    mockRandomSequence(0.2, 0.8); // 0.2*20=4+1=5, 0.8*20=16+1=17
    const result = roll20({ ...baseOptions, type: "advantage", target: 18 });
    expect(result.dice).toBe("2d20");
    expect(result.rolls).toEqual([5, 17]);
    expect(result.roll).toBe(17);
    expect(result.total).toBe(17);
    expect(result.success).toBe(false);
  });

  it("handles disadvantage (uses lower roll)", () => {
    mockRandomSequence(0.1, 0.9); // 0.1*20=2+1=3, 0.9*20=18+1=19
    const result = roll20({ ...baseOptions, type: "disadvantage", target: 5 });
    expect(result.dice).toBe("2d20");
    expect(result.rolls).toEqual([3, 19]);
    expect(result.roll).toBe(3);
    expect(result.total).toBe(3);
    expect(result.success).toBe(false);
  });

  it("returns critical on natural 20 (auto success)", () => {
    mockRandomSequence(0.95); // 0.95*20=19+1=20
    const result = roll20({ ...baseOptions, target: 50 });
    expect(result.roll).toBe(20);
    expect(result.total).toBe(20);
    expect(result.success).toBe(true);
    expect(result.critical).toBe(true);
  });

  it("returns critical on natural 1 (auto fail)", () => {
    mockRandomSequence(0.0); // 0.0*20=0+1=1
    const result = roll20({ ...baseOptions, target: 0 });
    expect(result.roll).toBe(1);
    expect(result.total).toBe(1);
    expect(result.success).toBe(false);
    expect(result.critical).toBe(true);
  });

  it("handles negative modifiers", () => {
    mockRandomSequence(0.5); // 0.5*20=10+1=11
    const mods: Modifier[] = [{ source: "curse", value: -3 }];
    const result = roll20({ modifiers: mods, target: 10 });
    expect(result.roll).toBe(11);
    expect(result.total).toBe(8);
    expect(result.success).toBe(false);
  });

  it("defaults to normal roll if no type specified", () => {
    mockRandomSequence(0.7); // 0.7*20=14+1=15
    const result = roll20({ ...baseOptions, target: 10 });
    expect(result.roll).toBe(15);
    expect(result.total).toBe(15);
    expect(result.success).toBe(true);
    expect(result.dice).toBe("1d20");
  });
});
