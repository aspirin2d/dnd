import {abilityScoreModifier, proficiencyBonus, type Character} from "./character";
import {type RollType, type Roll20Result, type Modifier, roll20} from "./dice";

import {EquipmentList, type Weapon} from "./equipment";

export type AttackType = "melee" | "thrown" | "ranged" | "spell";

export interface AttackOptions {
  attacker: Character;
  defender: Character;
  rollType: RollType;
}

export interface DamageRollResult {}

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

export function meleeAttack(options: AttackOptions): AttackResult {
  const {attacker, defender, rollType} = options;

  const mainHand = EquipmentList.find(e => e.index === attacker.slotMeleeLeft);
  const offHand = EquipmentList.find(e => e.index === attacker.slotMeleeRight);

  let attackRoll: Roll20Result
  if (mainHand && !offHand) { // main hand attack
    const modifiers = weaponModifiers(attacker, mainHand as Weapon)
    const armourClass = 10
    attackRoll = roll20({modifiers, target: armourClass, type: rollType})
  } else if (offHand && !mainHand) { // off hand attack
  } else if (!mainHand && !offHand) { // unarmed strike
  } else if (mainHand && offHand) { // dual wielding
  }

  return {}
}

