// @see: https://bg3.wiki/wiki/Attacks
import { type Character } from "./character";
import { type Modifier, type Roll20Result, type RollType, roll } from "./dice";
import type { Damage } from "./weapon";

export type AttackType = "melee" | "thrown" | "ranged" | "spell";

export interface AttackOptions {
  attacker: Character;
  defender: Character;
  rollType: RollType;
}

export interface AttackRollResult extends Roll20Result { }

export interface DamageResult extends Damage {
  roll: number;
  final: number; // if the target has volnerability or resistance or immunity, the final may be different from the roll
  resistance?: "imimunity" | "vulnerability" | "resistance";
}

export interface DamageRollResult {
  base: DamageResult
  extras?: DamageResult[]
  modifiers?: Modifier[]
  total: number
}

export interface AttackResult {
  attackRoll: Roll20Result;
  damageRoll?: DamageRollResult; // if not present, the attack roll failed
}

export function damageRoll(defender: Character, damage: Damage, critical: boolean = false): DamageResult {
  const rolled = roll(damage.dice, critical)
  let final = rolled

  const hasImmunity = defender.immunities?.includes(damage.type)
  if (hasImmunity) {
    return {
      ...damage,
      roll: rolled,
      final: 0,
      resistance: "imimunity"
    }
  }

  const hasVulnerability = defender.vulnerabilities?.includes(damage.type)
  const hasResistance = defender.resistances?.includes(damage.type)

  const res: DamageResult = {
    ...damage,
    roll: rolled,
    final,
  }

  if (hasResistance && !hasVulnerability) {
    res.final = Math.floor(rolled / 2);
    res.resistance = "resistance"
  } else if (!hasResistance && hasVulnerability) {
    res.final = rolled * 2;
    res.resistance = "vulnerability"
  }

  return res;
}
