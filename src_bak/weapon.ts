import { proficiencyBonus, type Character } from "./character";
import type { Modifier } from "./dice";
import { type Equipment } from "./equipment";

export type DamageType = "slashing" | "bludgeoning" | "piercing" | "fire" | "cold" | "lightning" | "poison" | "necrotic" | "radiant" | "psychic" | "thunder" | "force" | "acid"; // and more...

export interface Damage {
  dice: string; // e.g. "1d8"
  type: DamageType; // damage type, e.g. "slashing, bludgeoning, piercing, fire..."
}

export interface WeaponType extends Equipment {
  weaponCategory: string; // "simple, martial"
  weaponFamily: string; // "club, dagger, crossbow..."

  damage1H?: Damage; // damage for one handed
  damage2H?: Damage; // damage for two handed

  properties: string[]; // weapon property ids. eg. "melee, finesse, light, thrown..."
  actions: string[]; // action ids. eg. "rush_attack,pierce_attack"
}

export interface Weapon extends WeaponType {
  extraDamages?: Damage[]; // extra damage. e.g. "1d6 fire"
  specials?: string[]; // weapon special ids. e.g., "flame tongue, frost brand"
  enchantment?: number; // eg. +1, +2, +3...
}

export function weaponProficiency(character: Character, weapon: Weapon): Modifier | undefined {
  if (character.proWeapons.includes(weapon.weaponFamily)) {
    return {
      source: "proficiency_" + weapon.weaponFamily,
      value: proficiencyBonus(character),
    }
  }
  return undefined
}
