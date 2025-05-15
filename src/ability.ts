import {
	abilityScoreModifier,
	proficiencyBonus,
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
	const modifiers: Modifier[] = [];

  // ability modifier
	const abilityScore = character[skill.ability];
	const abilityModifier = abilityScoreModifier(abilityScore);
	if (abilityModifier !== 0) {
		modifiers.push({
			source: "ability score modifier",
			index: skill.ability,
			value: abilityModifier,
		});
	}

  // proficient/expertise modifier
	const proficient =
		character.proSkills.find((s) => s === skill.index) !== undefined;
	const expertise =
		character.expSkills.find((s) => s === skill.index) !== undefined;
	const pb = proficiencyBonus(character.level);

	if (expertise) {
		modifiers.push({
			source: "expertise bonus",
			index: skill.index,
			value: pb * 2,
		});
	} else if (proficient) {
		modifiers.push({
			source: "proficiency bonus",
			index: skill.index,
			value: pb,
		});
	}

	// TODO: add other modifiers
	return roll20({
		modifiers,
		target: difficultyClass,
		type: rollType,
	});
}
