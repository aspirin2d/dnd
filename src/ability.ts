import {
	AbilityScoreModifier,
	ProficiencyBonus,
	type Character,
} from "./character";

import {
	roll20,
	type Modifier,
	type Roll20Result,
	type RollType,
} from "./dice";

import type { Skill } from "./skill";

export type Ability =
	| "strength"
	| "dexterity"
	| "constitution"
	| "intelligence"
	| "wisdom"
	| "charisma";

export interface AbilityCheckOptions {
	character: Character;
	skill: Skill;
	difficultyClass: number;
	rollType?: RollType;
}

export function abilityCheck(options: AbilityCheckOptions): Roll20Result {
	const { character, skill, difficultyClass, rollType = "normal" } = options;
	const abilityScore = character[skill.ability];
	const abilityModifier = AbilityScoreModifier(abilityScore);

	const proficient =
		character.proSkills.find((s) => s === skill.index) !== undefined;
	const expertise =
		character.expSkills.find((s) => s === skill.index) !== undefined;
	const proficiencyBonus = ProficiencyBonus(character.level);

	const modifiers: Modifier[] = [];
	if (abilityModifier !== 0) {
		modifiers.push({
			source: "ability modifier",
			index: skill.ability,
			value: abilityModifier,
		});
	}

	if (expertise) {
		modifiers.push({
			source: "expertise bonus",
			index: skill.index,
			value: proficiencyBonus * 2,
		});
	} else if (proficient) {
		modifiers.push({
			source: "proficiency bonus",
			index: skill.index,
			value: proficiencyBonus,
		});
	}

	// TODO: add other modifiers
	return roll20({
		modifiers,
		target: difficultyClass,
		type: rollType,
	});
}
