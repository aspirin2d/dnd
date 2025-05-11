import { describe, expect, test, vi, afterEach } from "vitest";
import { RollDice, AbilityCheck } from "./dice-roll";
import type { Character, Skill } from "./character";

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
		test("normal check", () => {
			const skill = {
				index: "athletics",
				name: "Athletics",
				description: "Athletics",
				abilityScore: "strength",
			} satisfies Skill;

			vi.spyOn(Math, "random").mockReturnValue(0.5);
			const res = AbilityCheck(char, skill, 10);
			expect(res.rolls).toHaveLength(1);
			expect(res.rolls[0]).toBe(11);
			expect(res.pick).toBe(11);
			expect(res.total).toBe(11);
			expect(res.modifiers).not.haveOwnProperty("ability modifier");
			expect(res.modifiers).not.haveOwnProperty("skill proficiency");
			expect(res.success).toBeTruthy();
		});

		test("normal check 2", () => {
			const skill = {
				index: "athletics",
				name: "Athletics",
				description: "Athletics",
				abilityScore: "strength",
			} satisfies Skill;

			vi.spyOn(char, "strength", "get").mockReturnValue(14);
			vi.spyOn(Math, "random").mockReturnValue(0.5);

			let res = AbilityCheck(char, skill, 10);
			expect(res.rolls).toHaveLength(1);
			expect(res.rolls[0]).toBe(11);
			expect(res.pick).toBe(11);
			expect(res.total).toBe(13);
			expect(res.modifiers[0].type).toBe("ability modifier");
			expect(res.modifiers[0].value).toBe(2);
			expect(res.success).toBeTruthy();

			vi.spyOn(char, "proSkills", "get").mockReturnValue(["athletics"]);
			res = AbilityCheck(char, skill, 10);
			expect(res.total).toBe(15); // 11 + 2 + 2
			expect(res.modifiers).toHaveLength(2);
			expect(res.modifiers[0].type).toBe("ability modifier");
			expect(res.modifiers[1].type).toBe("proficiency bonus");
			expect(res.success).toBeTruthy();

			vi.spyOn(char, "proSkills", "get").mockReturnValue(["athletics"]);
			vi.spyOn(char, "expSkills", "get").mockReturnValue(["athletics"]);
			res = AbilityCheck(char, skill, 10);
			expect(res.total).toBe(17); // 11 + 2 + 4
			expect(res.modifiers).toHaveLength(2);
			expect(res.modifiers[0].type).toBe("ability modifier");
			expect(res.modifiers[1].type).toBe("expertise bonus");
			expect(res.success).toBeTruthy();
		});

		test("advantage/disavantage", () => {
			const skill = {
				index: "athletics",
				name: "Athletics",
				description: "Athletics",
				abilityScore: "strength",
			} satisfies Skill;

			vi.spyOn(Math, "random")
				.mockReturnValueOnce(0.5) // 11
				.mockReturnValueOnce(0.1); // 3

			let res = AbilityCheck(char, skill, 10, "advantage");
			expect(res.rolls).toHaveLength(2);
			expect(res.pick).toBe(11);
			expect(res.success).toBeTruthy();

			vi.spyOn(Math, "random")
				.mockReturnValueOnce(0.5) // 11
				.mockReturnValueOnce(0.1); // 3
			res = AbilityCheck(char, skill, 10, "disadvantage");
			expect(res.rolls).toHaveLength(2);
			expect(res.pick).toBe(3);
			expect(res.success).toBeFalsy();
		});
	});
});
