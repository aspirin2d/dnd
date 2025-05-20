/**
 * Parses dice notation strings (e.g., "2d6+3", "d20", "1d8-2") into structured objects.
 * Throws an error if notation is invalid or if dice count/sides are non-positive.
 */
export function parse(dice: string): {
  diceCount: number;
  diceSides: number;
  modifier: number;
} {
  // Regex matches: [diceCount]d[diceSides][+/-modifier], e.g., "2d6+3", "d20"
  const diceRegex = /^(\d*)d(\d+)([+-]\d+)?$/i;
  const match = dice.trim().match(diceRegex);

  if (!match) throw new Error(`Invalid dice notation: ${dice}`);

  // Destructure the match: diceCount (optional), diceSides (required), modifier (optional)
  const [, diceCountStr, diceSidesStr, modifierStr] = match;
  const diceCount = parseInt(diceCountStr || "1", 10); // Default to 1 if omitted
  const diceSides = parseInt(diceSidesStr, 10);

  // Prevent zero or negative dice count/sides (e.g., "0d6", "2d0", "-1d8")
  if (diceSides <= 0 || diceCount <= 0)
    throw new Error(`Invalid dice notation: ${dice}`);

  return {
    diceCount,
    diceSides,
    modifier: modifierStr ? parseInt(modifierStr, 10) : 0,
  };
}

/**
 * Rolls dice according to notation (e.g., "2d6+3"). If double=true, rolls twice the dice (e.g., for crits).
 * Returns the sum including the modifier.
 */
export function roll(notation: string, double: boolean = false): number {
  const { diceCount, diceSides, modifier } = parse(notation);

  let total = 0;
  // For criticals, double the number of dice rolled, not the modifier.
  for (let i = 0; i < (double ? diceCount * 2 : diceCount); i++) {
    // Each die roll produces a value from 1 up to diceSides
    total += Math.floor(Math.random() * diceSides) + 1;
  }
  return total + modifier;
}

/**
 * Represents a modifier applied to a roll (e.g., from ability score or magic item).
 */
export interface Modifier {
  source: string; // Description or source of modifier (e.g., "STR mod", "Proficiency")
  value: number;  // Numeric value of the modifier
}
export type Modifiers = Modifier[]; // List of modifiers

export type RollType = "normal" | "advantage" | "disadvantage";

/**
 * Options for rolling a d20 (ability check, saving throw, attack roll).
 */
export interface Roll20Options {
  target: number;         // DC or AC to beat
  modifiers?: Modifier[]; // All bonuses/penalties to the roll
  type?: RollType;        // normal (default), advantage, or disadvantage
}

/**
 * Result of a d20 roll.
 */
export interface Roll20Result extends Roll20Options {
  dice: "1d20" | "2d20"; // Which dice were rolled (single or double d20)
  rolls: number[];       // All d20 values rolled (1 or 2, depending on advantage/disadvantage)
  roll: number;          // The value actually used for the check
  total: number;         // roll + sum of modifiers (always present)
  critical?: boolean;    // true if natural 20 or 1
  success: boolean;      // true if meets or beats target (except for auto-fail on 1)
}

/**
 * Rolls a d20 (with optional advantage/disadvantage), applies modifiers, and checks success against a target.
 * Handles auto-success/failure for natural 20/1.
 * Always includes the final total in the result for consistency.
 */
export function roll20(options: Roll20Options): Roll20Result {
  const { modifiers = [], target, type = "normal" } = options;

  // Always roll two d20s, use the relevant one depending on roll type
  const roll1 = roll("1d20");
  const roll2 = roll("1d20");

  let finalRoll = roll1;              // Default: use the first roll
  let rolls = [roll1];                // Array of d20s rolled
  let dice: "1d20" | "2d20" = "1d20"; // Tracks if advantage/disadvantage was used

  // Select the higher/lower of two rolls for advantage/disadvantage
  if (type === "advantage") {
    finalRoll = Math.max(roll1, roll2);
    rolls = [roll1, roll2];
    dice = "2d20";
  } else if (type === "disadvantage") {
    finalRoll = Math.min(roll1, roll2);
    rolls = [roll1, roll2];
    dice = "2d20";
  }

  // Apply all modifiers to the chosen roll to get the final total
  const total = modifiers.reduce((acc, m) => acc + m.value, finalRoll);

  // Check for auto-success (natural 20) or auto-fail (natural 1)
  // Always return `total` for consistency, but set `critical: true` if so.
  if (finalRoll === 20) {
    return {
      ...options,
      dice,
      rolls,
      roll: finalRoll,
      total,
      success: true,
      critical: true,
    };
  }
  if (finalRoll === 1) {
    return {
      ...options,
      dice,
      rolls,
      roll: finalRoll,
      total,
      success: false,
      critical: true,
    };
  }

  // Otherwise, success if total >= target (meets or beats DC/AC)
  return {
    ...options,
    dice,
    rolls,
    roll: finalRoll,
    total,
    success: total >= target,
  };
}
