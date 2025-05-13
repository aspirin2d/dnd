export function parse(dice: string): {
	diceCount: number;
	diceSides: number;
	modifier: number;
} {
	const diceRegex = /^(\d*)d(\d+)([+-]\d+)?$/i;
	const match = dice.match(diceRegex);

	if (!match) {
		throw new Error(`Invalid dice notation: ${dice}`);
	}

	const [, diceCountStr, diceSidesStr, modifierStr] = match;
	return {
		diceCount: parseInt(diceCountStr || "1", 10),
		diceSides: parseInt(diceSidesStr, 10),
		modifier: modifierStr ? parseInt(modifierStr, 10) : 0,
	};
}

export function roll(dice: string, critical: boolean = false): number {
	const { diceCount, diceSides, modifier } = parse(dice);

	let total = 0;
	// if critical, roll twice the number of dice
	for (let i = 0; i < (critical ? diceCount * 2 : diceCount); i++) {
		total += Math.floor(Math.random() * diceSides) + 1; // between 1 and diceSides, both inclusive
	}

	return total + modifier;
}

export interface Modifier {
	source: string;
	index: string;
	value: number;
}

export type RollType = "normal" | "advantage" | "disadvantage";

export interface Roll20Options {
	modifiers?: Modifier[];
	type?: RollType;
	target: number;
}

export interface Roll20Result {
	rolls: number[];
	roll: number;
	success: boolean;
	modifiers?: Modifier[]; // if not critical
	total?: number; // if not critical
	critical?: boolean; // if critical
}

export function roll20(options: Roll20Options): Roll20Result {
	const { modifiers = [], target, type = "normal" } = options;

	const roll1 = roll("1d20");
	const roll2 = roll("1d20");

	let finalRoll = roll1;
	let rolls = [roll1];

	if (type === "advantage") {
		finalRoll = Math.max(roll1, roll2);
		rolls = [roll1, roll2];
	} else if (type === "disadvantage") {
		finalRoll = Math.min(roll1, roll2);
		rolls = [roll1, roll2];
	}

	if (finalRoll === 20) {
		return {
			rolls,
			roll: finalRoll,
			success: true,
			critical: true,
		};
	}

	if (finalRoll === 1) {
		return {
			rolls,
			roll: finalRoll,
			success: false,
			critical: true,
		};
	}

	const total = modifiers.reduce((acc, roll) => acc + roll.value, finalRoll);
	let success = finalRoll === 20 || (total >= target && finalRoll >= 1);
	return {
		rolls,
		roll: finalRoll,
		success,
		modifiers,
		total,
	};
}
