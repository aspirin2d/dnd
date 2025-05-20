// attack-offhand.ts
import { type Ability, abilityModifier } from "./ability";
import { armourClass } from "./armour";
import { type AttackOptions, type AttackResult, damageRoll, type DamageRollResult } from "./attack";
import { type Modifier, roll20 } from "./dice";
import { EquipmentList } from "./equipment";
import { type Weapon, weaponProficiency } from "./weapon";

/**
 * Resolves an off-hand melee attack (bonus action, typically).
 * - Uses slotMeleeRight as the off-hand.
 * - Only allows weapons with the "light" property (unless overridden).
 * - Ability modifier is **NOT** added to damage (unless weapon explicitly allows).
 * - Applies proficiency to attack if proficient with the weapon.
 * - No extra attack ability bonuses unless stated.
 */
export function offHandAttack(options: AttackOptions): AttackResult {
  const { attacker, defender, rollType } = options;
  if (!attacker.slotMeleeRight) throw new Error("Off-hand weapon not found: " + attacker.slotMeleeRight);

  const weapon = EquipmentList.find(e => e.index === attacker.slotMeleeRight) as Weapon;
  if (!weapon) throw new Error("Weapon not found at off-hand: " + attacker.slotMeleeRight);
  if (weapon.category !== "weapon") throw new Error("Off-hand slot is not a weapon: " + attacker.slotMeleeRight);

  // Off-hand attacks require "light" weapon unless a feature overrides this (not handled here)
  if (!weapon.properties.includes("light")) {
    throw new Error("Off-hand attacks require a light weapon: " + weapon.name);
  }

  // --- Build attack roll modifiers ---
  let weaponAbility: Ability = "strength";
  if (weapon.properties.includes("finesse") && attacker.dexterity > attacker.strength) {
    weaponAbility = "dexterity";
  }
  const attackAbilityMod = abilityModifier(attacker, weaponAbility);
  const proficiencyMod = weaponProficiency(attacker, weapon);

  // Collect modifiers for attack roll
  const attackModifiers: Modifier[] = [];
  if (attackAbilityMod) attackModifiers.push(attackAbilityMod);
  if (proficiencyMod) attackModifiers.push(proficiencyMod);

  // Defender's AC
  const ac = armourClass(defender);
  const attackRoll = roll20({ modifiers: attackModifiers, target: ac.total, type: rollType });

  const result: AttackResult = { attackRoll };

  // --- Damage Roll if attack hits ---
  if (attackRoll.success) {
    // Always use one-handed damage for off-hand attacks
    const mainDamage = weapon.damage1H;
    if (!mainDamage) throw new Error("Damage property not found: " + weapon.index);

    const dmgModifiers: Modifier[] = [];

    // By default, **do NOT add ability modifier to off-hand damage**
    // If the weapon or a feature specifically allows, you can add it here.
    // e.g., if (weapon.properties.includes("offhand_ability_bonus")) { ... }
    // For BG3/D&D, leave blank by default.

    // Weapon enchantment bonus applies to damage
    if (weapon.enchantment) {
      dmgModifiers.push({
        source: "weapon_enchantment",
        value: weapon.enchantment,
      });
    }

    // Crit check: double dice if critical hit
    const isCrit = !!attackRoll.critical && attackRoll.roll === 20;

    // Base damage roll (no ability modifier)
    const base = damageRoll(defender, mainDamage, isCrit);

    // Extra damages (e.g. fire, poison), doubled on crit
    const extras = weapon.extraDamages?.map(d => damageRoll(defender, d, isCrit)) ?? undefined;

    // Sum: base + extras + flat modifiers (no ability mod by default)
    let total = base.final + (extras ? extras.reduce((acc, d) => acc + d.final, 0) : 0) + dmgModifiers.reduce((acc, d) => acc + d.value, 0);

    const damageRollRes: DamageRollResult = {
      base,
      extras,
      total,
    };

    result.damageRoll = damageRollRes;
  }

  return result;
}
