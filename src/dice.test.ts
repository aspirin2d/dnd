import { describe, it, expect, vi, afterEach } from "vitest";
import { parse, roll, roll20, type Modifier } from "./dice"; // replace with actual path

// Helper to mock Math.random
export function mockRandomSequence(...values: number[]) {
	let i = 0;
	vi.spyOn(Math, "random").mockImplementation(
		() => values[i++ % values.length],
	);
}

afterEach(() => {
	vi.restoreAllMocks(); // Reset Math.random after each test
});

describe("parse", () => {
	it("parses standard dice", () => {
		expect(parse("2d6+3")).toEqual({ diceCount: 2, diceSides: 6, modifier: 3 });
		expect(parse("1d20")).toEqual({ diceCount: 1, diceSides: 20, modifier: 0 });
		expect(parse("d8")).toEqual({ diceCount: 1, diceSides: 8, modifier: 0 });
		expect(parse("3d4-2")).toEqual({
			diceCount: 3,
			diceSides: 4,
			modifier: -2,
		});
	});

	it("throws on invalid format", () => {
		expect(() => parse("abc")).toThrow("Invalid dice notation");
		expect(() => parse("1d")).toThrow("Invalid dice notation");
		expect(() => parse("d")).toThrow("Invalid dice notation");
	});
});

describe("roll", () => {
	it("rolls dice correctly without critical", () => {
		mockRandomSequence(0.0, 0.5); // roll 1 and 11
		const result = roll("2d20+1"); // expect 1 + 11 + 1 = 13
		expect(result).toBe(13);
	});

	it("rolls dice correctly with critical (double dice)", () => {
		mockRandomSequence(0.5, 0.3, 0.2, 0.1); // 11 + 7 + 5 + 3
		const result = roll("2d20+1", true);
		expect(result).toBe(11 + 7 + 5 + 3 + 1);
	});
});

describe("roll20", () => {
	it("rolls a normal 1d20 with no modifiers and succeeds", () => {
		mockRandomSequence(0.95); // Math.floor(0.95 * 20) + 1 = 20
		const result = roll20({ target: 15 });
		expect(result.roll).toBe(20);
		expect(result.success).toBe(true);
		expect(result.critical).toBe(true);
		expect(result.rolls).toEqual([20]);
	});

	it("rolls a normal 1d20 and fails with low result", () => {
		mockRandomSequence(0.0); // 1
		const result = roll20({ target: 10 });
		expect(result.roll).toBe(1);
		expect(result.success).toBe(false);
		expect(result.critical).toBe(true); // 1 is critical
		expect(result.rolls).toEqual([1]);
	});

	it("applies modifiers correctly", () => {
		mockRandomSequence(0.5); // 11
		const modifiers: Modifier[] = [
			{ source: "ability_score", index: "strength", value: 4 },
			{ source: "proficiency_bonus", index: "athletic", value: 2 },
		];
		const result = roll20({ target: 15, modifiers });
		expect(result.roll).toBe(11);
		expect(result.success).toBe(true); // 11 + 6 = 17 >= target
		expect(result.critical).toBeUndefined();
	});

	it("handles advantage correctly", () => {
		mockRandomSequence(0.3, 0.7); // 7 and 15
		const result = roll20({ target: 10, type: "advantage" });
		expect(result.rolls).toEqual([7, 15]);
		expect(result.roll).toBe(15);
		expect(result.success).toBe(true);
	});

	it("handles disadvantage correctly", () => {
		mockRandomSequence(0.3, 0.7); // 7 and 15
		const result = roll20({ target: 10, type: "disadvantage" });
		expect(result.rolls).toEqual([7, 15]);
		expect(result.roll).toBe(7);
		expect(result.success).toBe(false);
	});
});
