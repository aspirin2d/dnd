export interface Character {
  id: string;
  name: string;
  description?: string;

  class: string; // class id
  subclass?: string; // subclass id

  specy: string; // specy id
  subspecy?: string; // sub specy id
  background: string; // background id
  alignment?: string; // alignment id

  level: number;

  // ability-scores
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;

  // proficiencies
  proWeapons: string[]; // weapon type ids
  proArmour: string[]; // armour type ids
  proSkills: string[]; // skill ids
  // expertise skills
  expSkills: string[]; // expertise skill ids
  // ability-score saving throws
  savingThrows: string[]; // ability-score ids

  // equipment slots
  slotHead?: string; // equipped headwear id
  slotCloak?: string; // equipped cloak id
  slotBody?: string; // equipped body armour id
  slotHand?: string; // equipped handwear id
  slotFoot?: string; // equipped footwear id
  slotMeleeLeft?: string; // equipped weapon id
  slotMeleeRight?: string; // equipped weapon id or shield id
  slotRangedLeft?: string; // equipped weapon id
  slotRangedRight?: string; // equipped weapon id or shield id
  slotRing1?: string; // equipped ring id
  slotRing2?: string; // equipped ring id
  slotAmulet?: string; // equipped amulet id

  // spell casting
  spellCasting?: string; // ""
  spellCastingAbility?: string;
  slotCantrip?: string[]; // the cantrip id
  slotSpells?: string[]; // equiped spell ids

  // resisitances
  // @see: https://bg3.wiki/wiki/Resistances
  vulnerabilities?: DamageType[]
  resistances?: DamageType[]
  immunities?: DamageType[]
}

export function proficiencyBonus(character: Character): number {
  return Math.ceil(character.level / 4) + 1;
}

import { default as CharacterData } from "../data/character.json";
import type { DamageType } from "./weapon";
export const CharacterList = CharacterData as Character[];

// return an empty character instance
export function tav(): Character {
  return CharacterList.find((ch) => ch.id === "tav")!;
}
