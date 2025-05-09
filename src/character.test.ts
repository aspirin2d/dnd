import { describe, expect, test, vi, afterEach } from "vitest";
import type { Character } from "./types";
import { getAbilityScoreModifier, getProficiencyBonus } from "./character";

export function EmptyCharacter(): Character {
	return {
		id: "tav",
		name: "Tav",

		class: "fighter",
		specy: "human",
		background: "soldier",

		level: 1,

		strength: 10,
		dexterity: 10,
		constitution: 10,
		intelligence: 10,
		wisdom: 10,
		charisma: 10,

		proWeapons: [],
		proArmour: [],
		proSkills: [],
		expSkills: [],
		savingThrows: [],

		spells: [],
	};
}

describe("Character", () => {
	const char = EmptyCharacter();
	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("Ability Check", () => {
		test("ability score modifier", () => {
			expect(char.strength).toBe(10);
			expect(getAbilityScoreModifier(char.strength)).toBe(0);

			vi.spyOn(char, "strength", "get").mockReturnValue(16);
			expect(char.strength).toBe(16);
			expect(getAbilityScoreModifier(char.strength)).toBe(3);

			vi.spyOn(char, "strength", "get").mockReturnValue(8);
			expect(char.strength).toBe(8);
			expect(getAbilityScoreModifier(char.strength)).toBe(-1);
		});

		test("proficiency bonus", () => {
			expect(char.strength).toBe(10);
			expect(char.level).toBe(1);
			expect(getProficiencyBonus(char.level)).toBe(2);

			vi.spyOn(char, "level", "get").mockReturnValue(5);
			expect(char.level).toBe(5);
			expect(getProficiencyBonus(char.level)).toBe(3);

			vi.spyOn(char, "level", "get").mockReturnValue(12);
			expect(char.level).toBe(12);
			expect(getProficiencyBonus(char.level)).toBe(4);
		});
	});
});
