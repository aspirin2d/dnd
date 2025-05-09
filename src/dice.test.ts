import { describe, expect, test, vi, afterEach } from "vitest";
import { RollDice } from "./dice";

describe("Dice", () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	test("roll 1d20", () => {
		vi.spyOn(Math, "random").mockReturnValue(0.5);
		const res = RollDice("1d20");
		expect(res).toBe(11);
	});
	test("roll 1d6+5", () => {
		vi.spyOn(Math, "random").mockReturnValue(0.5);
		const res = RollDice("1d6+5"); // 4 + 5
		expect(res).toBe(9);
	});
	test("roll d8", () => {
		vi.spyOn(Math, "random").mockReturnValue(0.5);
		let res = RollDice("d8"); // 5
		expect(res).toBe(5);

		res = RollDice("d4"); // 3
		expect(res).toBe(3);
	});
	test("invalid notation", () => {
		expect(() => RollDice("abc")).toThrowError();
		expect(() => RollDice("1d20+3+4")).toThrowError();
	});
	test("critical hit", () => {
		vi.spyOn(Math, "random").mockReturnValue(0.5);
		let res = RollDice("d8", true); // 5
		expect(res).toBe(10);
	});
});
