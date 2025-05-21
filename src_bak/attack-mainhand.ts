import { type Ability, abilityModifier } from "./ability";
import { armourClass } from "./armour";
import { type AttackOptions, type AttackResult, damageRoll, type DamageRollResult } from "./attack";
import { type Modifier, roll20 } from "./dice";
import { EquipmentList } from "./equipment";
import { type Weapon, weaponProficiency } from "./weapon";

/**
 * Resolves a main hand melee attack from attacker to defender.
 * - Uses slotMeleeLeft as the main hand.
 * - If weapon has versatile and offhand is unarmed, uses two-handed damage.
 * - Applies ability and proficiency modifiers appropriately.
 * - Rolls for hit, then for damage (with ability and enchantment bonuses).
 * - Sums extra damage sources.
 */
export function mainHandAttack(options: AttackOptions): AttackResult {
  const { attacker, defender, rollType } = options;
  if (!attacker.slotMeleeLeft) throw new Error("Main hand weapon not found: " + attacker.slotMeleeLeft);

  const weapon = EquipmentList.find(e => e.index === attacker.slotMeleeLeft) as Weapon;
  if (!weapon) throw new Error("Weapon not found at main hand: " + attacker.slotMeleeLeft);
  if (weapon.category !== "weapon") throw new Error("Main hand slot is not a weapon: " + attacker.slotMeleeLeft);

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
    // Decide between 1H/2H damage (versatile)
    const isVersatile = weapon.properties.includes("versatile");
    const useTwoHanded = isVersatile && !attacker.slotMeleeRight;
    const mainDamage = useTwoHanded ? weapon.damage2H : weapon.damage1H;
    if (!mainDamage) throw new Error("Damage property not found: " + weapon.index);

    // Build damage roll modifiers (usually same as ability mod; enchantment if applicable)
    const dmgModifiers: Modifier[] = [];

    if (attackAbilityMod) dmgModifiers.push(attackAbilityMod);

    if (weapon.enchantment) {
      dmgModifiers.push({
        source: "weapon_enchantment",
        value: weapon.enchantment,
      });
    }
    // TODO: Add more damage bonuses here if needed

    // Crit check: double dice if critical hit
    const isCrit = !!attackRoll.critical && attackRoll.roll === 20;

    // Base damage roll
    const base = damageRoll(defender, mainDamage, isCrit);

    // Extra damages (like fire, poison, etc.) -- also doubled on crit
    const extras = weapon.extraDamages?.map(d => damageRoll(defender, d, isCrit)) ?? undefined;

    // Total: sum base, extras, modifiers (if any)
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
