import { type Ability, abilityModifier } from "./ability";
import { armourClass } from "./armour";
import { type AttackOptions, type AttackResult, damageRoll, type DamageRollResult } from "./attack";
import { type Modifier, roll20 } from "./dice";
import { EquipmentList } from "./equipment";
import { type Damage, type Weapon, weaponProficiency } from "./weapon";

// main hand melee attack
// @see: https://bg3.wiki/wiki/Main_Hand_Attack
export function mainHandMeleeAttack(options: AttackOptions): AttackResult {
  const { attacker, defender, rollType } = options;
  if (!attacker.slotMeleeLeft) throw new Error("Main hand weapon not found: " + attacker.slotMeleeLeft)

  const weapon = EquipmentList.find(e => e.index === attacker.slotMeleeLeft) as Weapon
  if (!weapon) throw new Error("Weapon not found at main hand: " + attacker.slotRangedLeft)

  let modifiers: Modifier[] = []

  // main hand attack roll
  // @see: https://bg3.wiki/wiki/Attacks#Attack_rolls
  let weaponAbility: Ability = "strength"

  if (weapon.properties.includes("finesse")) {
    if (attacker.dexterity > attacker.strength) {
      weaponAbility = "dexterity"
    }
  }

  // ability modifier
  const am = abilityModifier(attacker, weaponAbility)
  if (am) {
    modifiers.push(am)
  }

  // weapon proficiency bonus
  const proficiency = weaponProficiency(attacker, weapon)
  if (proficiency) {
    modifiers.push(proficiency)
  }

  // get defender's AC
  const ac = armourClass(defender)
  const attackRoll = roll20({ modifiers, target: ac.total, type: rollType })

  const result: AttackResult = {
    attackRoll
  }

  // if success, make the damage roll
  // @see: https://bg3.wiki/wiki/Damage
  if (attackRoll.success) {
    let damage: Damage | undefined
    const versatile = weapon.properties.includes("versatile")
    if (versatile && !attacker.slotMeleeRight) {
      // if versatile and offhand is unarmed, use 2H damage
      damage = weapon.damage2H
    } else {
      damage = weapon.damage1H
    }
    if (!damage) throw new Error("damage property not found: " + weapon.index)

    // add ability score modifier
    const dmgModifiers: Modifier[] = am ? [am] : []

    // add enchantment bonus
    if (weapon.enchantment) {
      dmgModifiers.push({
        source: "weapon_enchantment",
        value: weapon.enchantment,
      })
    }

    // TODO: add other damage bonus

    const base = damageRoll(defender, damage);
    const extras = weapon.extraDamages?.map(d => damageRoll(defender, d)) ?? undefined
    const total = base.final + (extras ? extras.reduce((acc, d) => acc + d.final, 0) : 0) + modifiers.reduce((acc, m) => acc + m.value, 0)

    const damageRollRes: DamageRollResult = {
      base: base,
      extras: extras,
      total: total,
    }

    result.damageRoll = damageRollRes
  }

  return result
}
