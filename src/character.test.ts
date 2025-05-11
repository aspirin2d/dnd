import { describe, expect, test, vi, afterEach } from "vitest";
import { AbilityScoreModifier, ProficiencyBonus } from "./character";

describe("Character", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("Ability Check", () => {
		test("ability score modifier", () => {
			expect(AbilityScoreModifier(10)).toBe(0);
			expect(AbilityScoreModifier(16)).toBe(3);
			expect(AbilityScoreModifier(8)).toBe(-1);
		});

		test("proficiency bonus", () => {
			expect(ProficiencyBonus(1)).toBe(2);
			expect(ProficiencyBonus(5)).toBe(3);
			expect(ProficiencyBonus(12)).toBe(4);
		});
	});
});
