import type { Ability } from "./ability";
import type { Damage } from "./weapon";

/**
 * Represents the area of effect for a spell.
 * Maybe unsed in the idle game.
 */
export interface AreaOfEffect {
  shape: "cone" | "cube" | "cylinder" | "line" | "sphere";
  size: number; // e.g., "6m", "3m radius"
}

/**
 * Enum for schools of magic.
 * Just like in D&D 5e.
 */
export type SchoolOfMagic =
  | "abjuration"
  | "conjuration"
  | "divination"
  | "enchantment"
  | "evocation"
  | "illusion"
  | "necromancy"
  | "transmutation";

/**
 * Enum for casting times.
 */
export type CastingTime =
  | "action"
  | "bonus action"
  | "reaction"

/**
 * Represents a spell in Baldur's Gate 3.
 */
export interface Spell {
  index: string; // Unique identifier for the spell
  name: string;
  description: string;
  level: number; // 0 for cantrips
  school: SchoolOfMagic;
  castingTime: string; // eg., "action", "bonus_action", "reaction"
  range: string; // e.g., "self", "melee", "ranged"
  areaOfEffect?: AreaOfEffect; // Optional area details
  concentration: boolean;
  ritual: boolean;
  attackRoll: boolean; // If the spell requires an attack roll
  saveType?: Ability; // If the spell requires a saving throw
  damages?: Damage[]; // Damage dealt by the spell
  healing?: string; // Healing amount, e.g., "1d8+3"
  conditions?: string[]; // Condition ids applied by the spell
}

/**
 * Represents a spell slot for a character.
 */
export interface SpellSlot {
  level: number;
  max: number;
  used: number;
}

/**
 * Utility function to determine if a spell is a cantrip.
 */
export function isCantrip(spell: Spell): boolean {
  return spell.level === 0;
}

/**
 * Utility function to determine if a spell is a ritual.
 */
export function isRitual(spell: Spell): boolean {
  return spell.ritual;
}

/**
 * Utility function to determine if a spell requires concentration.
 */
export function requiresConcentration(spell: Spell): boolean {
  return spell.concentration;
}

import { default as SpellData } from "../data/spell.json";
export const SpellList: Spell[] = SpellData as Spell[]
