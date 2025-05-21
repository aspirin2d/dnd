import {
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

/**
 * List of D&D ability score keys for type safety
 */
export type Ability =
  | "strength"
  | "dexterity"
  | "constitution"
  | "intelligence"
  | "wisdom"
  | "charisma";

/**
 * Computes the ability modifier for a character and ability score.
 * Returns a Modifier only if not zero (to avoid cluttering the modifier list with +0).
 */
export function abilityModifier(character: Character, ability: Ability): Modifier | undefined {
  const score = character[ability];
  const value = Math.floor((score - 10) / 2);
  if (value !== 0) {
    return {
      source: "ability_" + ability,
      value,
    };
  }
  // If modifier is zero, omit it from the modifiers list.
  return undefined;
}

/**
 * Returns the proficiency/expertise modifier for a skill, if present.
 * - Double proficiency for expertise.
 * - Single proficiency for proficiency.
 * - undefined if not proficient.
 */
export function skillProficiency(
  character: Character,
  skill: Skill
): Modifier | undefined {
  const { proSkills = [], expSkills = [] } = character;
  const pb = proficiencyBonus(character);

  if (expSkills.includes(skill.index)) {
    return {
      source: "expertise_" + skill.index,
      value: pb * 2,
    };
  } else if (proSkills.includes(skill.index)) {
    return {
      source: "proficiency_" + skill.index,
      value: pb,
    };
  }
  return undefined;
}

/**
 * Options for performing an ability/skill check.
 */
export interface AbilityCheckOptions {
  character: Character;
  skill: Skill;
  difficultyClass: number;
  rollType?: RollType;
}

/**
 * Result of an ability check, including the skill used.
 */
export interface AbilityCheckResult extends Roll20Result {
  skill: Skill;
}

/**
 * Performs a D&D-style skill check, collecting all applicable modifiers.
 * Returns the full roll result, including modifiers and success state.
 */
export function abilityCheck(options: AbilityCheckOptions): AbilityCheckResult {
  const { character, skill, difficultyClass, rollType = "normal" } = options;
  const modifiers: Modifier[] = [];

  // Add ability score modifier if not zero
  const abilityMod = abilityModifier(character, skill.ability);
  if (abilityMod) {
    modifiers.push(abilityMod);
  }

  // Add proficiency or expertise bonus if present
  const proficiencyMod = skillProficiency(character, skill);
  if (proficiencyMod) {
    modifiers.push(proficiencyMod);
  }

  // TODO: Add other modifiers here (e.g., magic, conditions, situational)

  // Call the d20 roller with all collected modifiers
  return {
    ...roll20({
      modifiers,
      target: difficultyClass,
      type: rollType,
    }),
    skill,
  };
}
