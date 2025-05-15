import { afterEach, describe, expect, it, vi } from "vitest";
import { abilityCheck } from "./ability";
import { tav } from "./character";
import { mockRandomSequence } from "./dice.test";
import { type Skill } from "./skill";

afterEach(() => {
	vi.restoreAllMocks(); // Reset Math.random after each test
});

const mockSkill: Skill = {
  index: "test",
	name: "Test",
	description: "Test",
	ability: "strength",
};

describe("Ability Check", () => {
	it("a normal check", () => {
		mockRandomSequence(0.5);
		const res = abilityCheck({
			character: tav(),
			skill: mockSkill,
			difficultyClass: 10,
			rollType: "normal",
		});
		expect(res.roll).toBe(11);
		expect(res.success).toBe(true);
	});

	it("skill with proficiency", () => {
		mockRandomSequence(0.5);
		const char = tav();
		char.proSkills = [mockSkill.index];
		const res = abilityCheck({
			character: char,
			skill: mockSkill,
			difficultyClass: 10,
			rollType: "normal",
		});

		expect(res.roll).toBe(11);
		expect(res.total).toBe(13); // 11 + 2
	});

	it("skill with expertise", () => {
		mockRandomSequence(0.5);
		const char = tav();
		char.expSkills = [mockSkill.index];
		const res = abilityCheck({
			character: char,
			skill: mockSkill,
			difficultyClass: 10,
			rollType: "normal",
		});

		expect(res.roll).toBe(11);
		expect(res.total).toBe(15); // 11 + 2*2
	});

	it("skill with expertise and proficiency", () => {
		mockRandomSequence(0.5);

		const char = tav();
		char.expSkills = [mockSkill.index];
		char.proSkills = [mockSkill.index];
		const res = abilityCheck({
			character: char,
			skill: mockSkill,
			difficultyClass: 10,
			rollType: "normal",
		});

		expect(res.roll).toBe(11);
		// should only take expertise into calculation
		expect(res.total).toBe(15); // 11 + 2*2
	});

	it("critical success", () => {
		mockRandomSequence(0.99);
		const char = tav();
		char.expSkills = [mockSkill.index];
		const res = abilityCheck({
			character: char,
			skill: mockSkill,
			difficultyClass: 10,
			rollType: "normal",
		});

		expect(res.roll).toBe(20);
		expect(res.success).toBe(true);
		expect(res.critical).toBe(true);
		expect(res.total).toBeUndefined(); // 20 + 2*2
	});

	it("critical failure", () => {
		mockRandomSequence(0.0);
		const char = tav();
		char.expSkills = [mockSkill.index];
		const res = abilityCheck({
			character: char,
			skill: mockSkill,
			difficultyClass: 10,
			rollType: "normal",
		});

		expect(res.roll).toBe(1);
		expect(res.success).toBe(false);
		expect(res.critical).toBe(true);
		expect(res.total).toBeUndefined();
		expect(res.modifiers).toBeUndefined();
	});
});
