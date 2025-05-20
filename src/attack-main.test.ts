import { Character } from './character';
import { Weapon } from './weapon';
import { Dice } from './dice';
import { mainHandMeleeAttack } from './attack-mainhand';

describe('mainHandMeleeAttack', () => {
  let attacker: Character;
  let defender: Character;
  let weapon: Weapon;
  let mockDice: Dice;

  beforeEach(() => {
    attacker = new Character('Attacker');
    defender = new Character('Defender');
    weapon = {
      name: 'Sword',
      damageDie: 8,
      damageDieCount: 1,
      attackBonus: 2,
      damageBonus: 1,
      criticalThreatRange: 20,
      criticalMultiplier: 2,
      type: 'Melee',
    };
    mockDice = new Dice(); // Use a real Dice for now, but we can mock specific rolls
  });

  it('should deal damage on a hit', () => {
    // Mock a roll that hits
    jest.spyOn(mockDice, 'roll').mockReturnValue(15); // Attack roll
    jest.spyOn(mockDice, 'roll').mockReturnValueOnce(5); // Damage roll

    attacker.baseAttackBonus = 5; // Total attack bonus: 5 + 2 (weapon) = 7
    defender.armourClass = 10; // Needs a 3 or higher to hit

    const result = mainHandMeleeAttack(attacker, defender, weapon, mockDice);

    expect(result.hit).toBe(true);
    expect(result.damage).toBeGreaterThan(0);
  });

  it('should miss on a low roll', () => {
    // Mock a roll that misses
    jest.spyOn(mockDice, 'roll').mockReturnValue(1); // Attack roll

    attacker.baseAttackBonus = 0; // Total attack bonus: 0 + 2 (weapon) = 2
    defender.armourClass = 15; // Needs a 13 or higher to hit

    const result = mainHandMeleeAttack(attacker, defender, weapon, mockDice);

    expect(result.hit).toBe(false);
    expect(result.damage).toBe(0);
  });

  it('should deal critical damage on a critical hit', () => {
    // Mock a critical hit roll
    jest.spyOn(mockDice, 'roll').mockReturnValue(20); // Critical threat
    jest.spyOn(mockDice, 'roll').mockReturnValueOnce(18); // Confirm critical roll (hits)
    jest.spyOn(mockDice, 'roll').mockReturnValueOnce(5); // Normal damage roll
    jest.spyOn(mockDice, 'roll').mockReturnValueOnce(5); // Critical damage roll

    attacker.baseAttackBonus = 5;
    defender.armourClass = 10;

    const result = mainHandMeleeAttack(attacker, defender, weapon, mockDice);

    expect(result.hit).toBe(true);
    expect(result.isCritical).toBe(true);
    expect(result.damage).toBeGreaterThan(weapon.damageBonus * weapon.criticalMultiplier); // Base damage * multiplier + bonus
  });

  it('should not be a critical hit if the confirmation roll misses', () => {
    // Mock a critical threat but a missed confirmation
    jest.spyOn(mockDice, 'roll').mockReturnValue(20); // Critical threat
    jest.spyOn(mockDice, 'roll').mockReturnValueOnce(1); // Confirm critical roll (misses)
    jest.spyOn(mockDice, 'roll').mockReturnValueOnce(5); // Normal damage roll

    attacker.baseAttackBonus = 0; // Low attack bonus to ensure confirmation miss
    defender.armourClass = 15;

    const result = mainHandMeleeAttack(attacker, defender, weapon, mockDice);

    expect(result.hit).toBe(true); // Still a hit with the initial 20
    expect(result.isCritical).toBe(false);
    expect(result.damage).toBeGreaterThan(0); // Should still deal normal damage
  });

  it('should handle different damage rolls', () => {
    jest.spyOn(mockDice, 'roll').mockReturnValue(15); // Attack roll
    const mockDamageRoll = 2;
    jest.spyOn(mockDice, 'roll').mockReturnValueOnce(mockDamageRoll); // Damage roll

    attacker.baseAttackBonus = 5;
    defender.armourClass = 10;

    const result = mainHandMeleeAttack(attacker, defender, weapon, mockDice);

    expect(result.hit).toBe(true);
    expect(result.damage).toBe(mockDamageRoll + weapon.damageBonus);
  });

  it('should handle weapons with multiple damage dice', () => {
    weapon.damageDieCount = 2;
    jest.spyOn(mockDice, 'roll').mockReturnValue(15); // Attack roll
    jest.spyOn(mockDice, 'roll').mockReturnValueOnce(3); // First damage roll
    jest.spyOn(mockDice, 'roll').mockReturnValueOnce(4); // Second damage roll


    attacker.baseAttackBonus = 5;
    defender.armourClass = 10;

    const result = mainHandMeleeAttack(attacker, defender, weapon, mockDice);

    expect(result.hit).toBe(true);
    expect(result.damage).toBe(3 + 4 + weapon.damageBonus);
  });
});