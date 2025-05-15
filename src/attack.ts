import { abilityScoreModifier, proficiencyBonus, type Character } from "./character";

import type { Modifier, Roll20Result, RollType } from "./dice";
import { roll20 } from "./dice";

import { EquipmentList, type Armour, type Damage, type Weapon } from "./equipment";

export type AttackType = "melee" | "thrown" | "ranged" | "spell";

export interface AttackOptions {
  attacker: Character;
  defender: Character;
  rollType: RollType;
}

export interface DamageRollResult { }

export interface AttackResult {
  attackRoll?: Roll20Result;
  damageRoll?: DamageRollResult;
}

export function weaponModifiers(character: Character, weapon: Weapon): Modifier[] {
  const modifiers = [] as Modifier[]
  let ability: "strength" | "dexterity" = "strength"

  if (weapon.properties.includes("melee") && weapon.properties.includes("finesse")) {
    if (character.dexterity > character.strength) {
      ability = "dexterity"
    }
  } else if (weapon.properties.includes("ranged")) {
    ability = "dexterity"
  }

  modifiers.push({
    source: "ability modifier",
    index: ability,
    value: abilityScoreModifier(character[ability]),
  })

  const proficient = character.proWeapons.includes(weapon.weaponFamily)
  if (proficient) {
    modifiers.push({
      source: "weapon proficiency",
      index: weapon.weaponFamily,
      value: proficiencyBonus(character.level),
    })
  }

  return modifiers
}

export interface ArmourClass {
  base: number;
  total: number;
  modifiers?: Modifier[]
}

// @see https://bg3.wiki/wiki/Armour_Class
export function armourClass(character: Character): ArmourClass {
  const bodyArmour = EquipmentList.find(e => e.index === character.slotBody)

  let base = 10
  const modifiers: Modifier[] = []

  if (bodyArmour && bodyArmour.category === "armour") {
    const armour = bodyArmour as Armour
    base = armour.armourClass
    switch (armour.armourCategory) {
      case "light":
        // add dexterity modifier
        modifiers.push({
          source: "ability score modifier",
          index: "dexterity",
          value: abilityScoreModifier(character.dexterity)
        })
        break;
      case "medium":
        // add dexterity modifier, and cap to 2
        modifiers.push({
          source: "ability score modifier",
          index: "dexterity",
          value: Math.max(2, abilityScoreModifier(character.dexterity))
        })
        break;
      case "heavy":
        // do nothing
        break;
    }
  }

  // add shield
  let offHand = EquipmentList.find(e => e.index === character.slotMeleeRight)
  if (offHand && offHand.category === "armour") {
    const shield = offHand as Armour
    modifiers.push({
      source: "shield bonus",
      index: shield.index,
      value: abilityScoreModifier(character.dexterity)
    })
  }

  return {
    base,
    total: modifiers.reduce((prev, next) => (prev + next.value), base),
    modifiers,
  }
}

export function MainHandMeleeAttack(options: AttackOptions): AttackResult {
  const { attacker, defender, rollType } = options;
  let result: AttackResult = {}

  const weapon = EquipmentList.find(e => e.index === attacker.slotMeleeLeft);
  if (weapon) {
    const modifiers = weaponModifiers(attacker, weapon as Weapon)
    const ac = armourClass(defender)
    // make the attack roll
    const attackRoll = roll20({ modifiers, target: ac.total, type: rollType })
    if (attackRoll.success) {
      let damage: Damage | undefined
      const versatile = (weapon as Weapon).properties.includes("versatile")

      // if versatile and offhand is unarmed, use 2H damage
      if (versatile && !attacker.slotMeleeRight) {
        damage = (weapon as Weapon).damage2H
      } else {
        damage = (weapon as Weapon).damage1H
      }

      if (!damage) {
        throw new Error("Damage not found at main hand")
      }
    }
  } else {
    throw new Error("Weapon not found at main hand: " + attacker.slotMeleeLeft)
  }

  return result
}
