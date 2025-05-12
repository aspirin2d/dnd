import type { Character, Skill } from "./character";
import { AbilityScoreModifier, ProficiencyBonus } from "./character";

export type RollType = "normal" | "advantage" | "disadvantage";

export interface Modifier {
	type: string;
	index: string;
	value: number;
}

export interface RollResult {
	rolls: number[];
	pick: number;
	total: number;
	success: boolean;
	modifiers: Modifier[];
}

export interface DamageRollResult {
	roll: number;
	total: number;
	modifiers: Modifier[];
}

export function ParseDiceNotation(notation: string): {
	diceCount: number;
	diceSides: number;
	modifier: number;
} {
	const diceRegex = /^(\d*)d(\d+)([+-]\d+)?$/i;
	const match = notation.match(diceRegex);

	if (!match) {
		throw new Error(`Invalid dice notation: ${notation}`);
	}

	const [, diceCountStr, diceSidesStr, modifierStr] = match;
	return {
		diceCount: parseInt(diceCountStr || "1", 10),
		diceSides: parseInt(diceSidesStr, 10),
		modifier: modifierStr ? parseInt(modifierStr, 10) : 0,
	};
}

export function RollDice(notation: string, critical: boolean = false): number {
	const { diceCount, diceSides, modifier } = ParseDiceNotation(notation);

	let total = 0;
	// if critical, roll twice the number of dice
	for (let i = 0; i < (critical ? diceCount * 2 : diceCount); i++) {
		total += Math.floor(Math.random() * diceSides) + 1; // between 1 and diceSides, both inclusive
	}

	return total + modifier;
}

export function AbilityCheck(
	character: Character,
	skill: Skill,
	dc: number,
	rollType: RollType = "normal",
): RollResult {
	const abilityScore = character[skill.abilityScore];
	const abilityModifier = AbilityScoreModifier(abilityScore);

	const proficient =
		character.proSkills.find((s) => s === skill.index) !== undefined;
	const expertise =
		character.expSkills.find((s) => s === skill.index) !== undefined;
	const proficiencyBonus = ProficiencyBonus(character.level);

	const modifiers: Modifier[] = [];
	if (abilityModifier !== 0) {
		modifiers.push({
			type: "ability modifier",
			index: skill.abilityScore,
			value: abilityModifier,
		});
	}

	if (expertise) {
		modifiers.push({
			type: "expertise bonus",
			index: skill.index,
			value: proficiencyBonus * 2,
		});
	} else if (proficient) {
		modifiers.push({
			type: "proficiency bonus",
			index: skill.index,
			value: proficiencyBonus,
		});
	}

	let roll1 = RollDice("1d20");
	let roll2 = RollDice("1d20");

	let finalRoll: number;
	if (rollType === "advantage") {
		finalRoll = Math.max(roll1, roll2);
	} else if (rollType === "disadvantage") {
		finalRoll = Math.min(roll1, roll2);
	} else {
		finalRoll = roll1;
	}

	const isCriticalSuccess = finalRoll === 20;
	const isCriticalFailure = finalRoll === 1;

	let total = modifiers.reduce((acc, mod) => acc + mod.value, finalRoll);

	let success = false;
	if (isCriticalSuccess || (!isCriticalFailure && finalRoll >= dc)) {
		success = true;
	}

	return {
		rolls: rollType === "normal" ? [roll1] : [roll1, roll2],
		pick: finalRoll,
		total,
		modifiers,
		success,
	};
}

export function AttackRoll(
	modifiers: Modifier[],
	ac: number,
	rollType: RollType = "normal",
): RollResult {
	let roll1 = RollDice("1d20");
	let roll2 = RollDice("1d20");

	let finalRoll: number;
	if (rollType === "advantage") {
		finalRoll = Math.max(roll1, roll2);
	} else if (rollType === "disadvantage") {
		finalRoll = Math.min(roll1, roll2);
	} else {
		finalRoll = roll1;
	}

	const isCriticalSuccess = finalRoll === 20;
	const isCriticalFailure = finalRoll === 1;

	let total = modifiers.reduce((acc, mod) => acc + mod.value, finalRoll);

	let success = false;
	if (isCriticalSuccess || (!isCriticalFailure && finalRoll >= ac)) {
		success = true;
	}

	return {
		rolls: rollType === "normal" ? [roll1] : [roll1, roll2],
		pick: finalRoll,
		total,
		modifiers,
		success,
	};
}
