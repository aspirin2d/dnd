import type { Character, Skill } from "./types";

export function getAbilityScoreModifier(score: number): number {
	if (score < 1) {
		throw new Error("Ability score cannot be less than 1");
	}
	return Math.floor((score - 10) / 2);
}

export function getProficiencyBonus(level: number): number {
	if (level < 1) {
		throw new Error("Level cannot be less than 1");
	}
	return Math.ceil(level / 4) + 1;
}

export function AbilityCheck(
	character: Character,
	skill: Skill,
	proficient: boolean = false,
): number {
	const abilityScore = character[skill.abilityScore];
	const modifier = getAbilityScoreModifier(abilityScore);
	const proficiencyBonus = proficient
		? getProficiencyBonus(character.level)
		: 0;
	return modifier + proficiencyBonus;
}
