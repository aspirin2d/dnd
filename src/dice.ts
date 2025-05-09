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
