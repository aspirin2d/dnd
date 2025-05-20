import type { Character } from "./character";
import type { Modifier } from "./dice";
import type { Equipment } from "./equipment";
import { EquipmentList } from "./equipment";
import { abilityModifier } from "./ability";

export interface Armour extends Equipment {
  armourCategory: string; // "light, medium, heavy"
  stealthAdvantage: boolean; // disadvantage on stealth check
  armourClass: number; // base AC
  special: string[]; // special rules
  enchantment?: number; // eg. +1, +2, +3...
}

export interface ArmourClass {
  base: number;
  total: number;
  modifiers: Modifier[]
}

// Get armour class for a character
// @see https://bg3.wiki/wiki/Armour_Class
export function armourClass(character: Character): ArmourClass {
  const bodyArmour = EquipmentList.find(e => e.index === character.slotBody)

  let base = 10
  const modifiers: Modifier[] = []

  if (bodyArmour && bodyArmour.category === "armour") {
    const armour = bodyArmour as Armour
    base = armour.armourClass

    const modifier = abilityModifier(character, "dexterity")

    switch (armour.armourCategory) {
      case "light":
        // add dexterity modifier
        if (modifier) {
          modifiers.push(modifier)
        }
        break;
      case "medium":
        // add dexterity modifier, and cap to 2
        if (modifier) {
          modifier!.value = Math.min(modifier!.value, 2)
          modifiers.push(modifier)
        }
        break;
      case "heavy":
        // do nothing, heavy armour does not add dexterity modifier
        break;
    }
  }

  // add shield bonus
  let offHand = EquipmentList.find(e => e.index === character.slotMeleeRight)
  if (offHand && offHand.category === "armour") {
    const shield = offHand as Armour
    if (shield.armourCategory === "shield") {
      modifiers.push({
        source: "shield_bonus",
        value: shield.armourClass
      })
    }
  }

  // TODO: add modifiers from other sources
  return {
    total: modifiers.reduce((prev, next) => (prev + next.value), base),
    base,
    modifiers,
  }
}
