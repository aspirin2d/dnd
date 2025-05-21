// attack-mainhand.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mainHandAttack } from "./attack-mainhand";
import type { Character } from "./character";
import * as dice from "./dice";
import { EquipmentList } from "./equipment";
import type { DamageType, Weapon } from "./weapon";

// --- Helpers ---
const mockRoll20 = (
  opts: Partial<dice.Roll20Result> & { success: boolean; roll?: number; critical?: boolean }
): dice.Roll20Result => ({
  target: opts.target ?? 10,
  modifiers: opts.modifiers ?? [],
  type: opts.type ?? "normal",
  dice: "1d20",
  rolls: [opts.roll ?? 15],
  roll: opts.roll ?? 15,
  total: (opts.roll ?? 15) + (opts.modifiers?.reduce((a, m) => a + m.value, 0) ?? 0),
  critical: opts.critical,
  success: opts.success,
});

// --- Mock Equipment Data (reset each test) ---
let meleeWeapon: Weapon;
let versatileWeapon: Weapon;
let enchantedWeapon: Weapon;
let weaponWithExtra: Weapon;
let baseEquipmentList: any[];

beforeEach(() => {
  meleeWeapon = {
    index: "sword",
    name: "Sword",
    description: "A basic sword.",
    category: "weapon",
    rarity: "common",
    weight: 2,
    price: 100,
    weaponCategory: "martial",
    weaponFamily: "sword",
    damage1H: { dice: "1d8", type: "slashing" },
    properties: ["melee"],
    actions: [],
  };

  versatileWeapon = {
    ...meleeWeapon,
    index: "versatile",
    name: "Versatile Sword",
    properties: ["melee", "versatile"],
    damage2H: { dice: "1d10", type: "slashing" },
  };

  enchantedWeapon = {
    ...meleeWeapon,
    index: "enchanted",
    name: "Enchanted Sword",
    enchantment: 2,
  };

  weaponWithExtra = {
    ...meleeWeapon,
    index: "fire_sword",
    name: "Fire Sword",
    extraDamages: [{ dice: "1d6", type: "fire" }],
  };

  baseEquipmentList = [meleeWeapon, versatileWeapon, enchantedWeapon, weaponWithExtra];
  EquipmentList.length = 0;
  baseEquipmentList.forEach((w) => EquipmentList.push(w));
});

afterEach(() => {
  vi.restoreAllMocks();
});

// --- Mock dice.roll and dice.roll20 ---
function mockDiceRoll(value: number) {
  vi.spyOn(dice, "roll").mockImplementation(() => {
    // Simulate 1d8 or 1d10, etc.
    // You can customize this if you want different numbers for base and extra damages
    return value;
  });
}

function mockRoll20Result(result: Partial<dice.Roll20Result>) {
  vi.spyOn(dice, "roll20").mockImplementation(() => result as dice.Roll20Result);
}

// --- Characters for test cases ---
const basicAttacker: Character = {
  id: "tav",
  name: "Tav",
  class: "fighter",
  level: 5,
  strength: 16,
  dexterity: 10,
  constitution: 12,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
  proWeapons: ["sword"],
  proArmour: [],
  proSkills: [],
  expSkills: [],
  savingThrows: [],
  slotMeleeLeft: "sword",
  slotMeleeRight: undefined,
  slotBody: undefined,
  background: "soldier",
  specy: "human",
};

const proficientAttacker: Character = {
  ...basicAttacker,
  proWeapons: ["sword", "club"],
};

const defender: Character = {
  ...basicAttacker,
  id: "defender",
  name: "Defender",
  slotMeleeLeft: undefined,
  slotMeleeRight: undefined,
  slotBody: undefined,
};

describe("mainHandAttack", () => {
  it("should throw if main hand weapon is not found", () => {
    const attacker = { ...basicAttacker, slotMeleeLeft: undefined };
    expect(() =>
      mainHandAttack({ attacker, defender, rollType: "normal" })
    ).toThrow(/Main hand weapon not found/);
  });

  it("should throw if weapon in slot is not found", () => {
    const attacker = { ...basicAttacker, slotMeleeLeft: "not_exist" };
    expect(() =>
      mainHandAttack({ attacker, defender, rollType: "normal" })
    ).toThrow(/Weapon not found at main hand/);
  });

  it("performs a normal attack: hit, 1H, with ability and proficiency", () => {
    // Mock hit (success)
    mockRoll20Result(
      mockRoll20({
        roll: 13,
        total: 18,
        success: true,
        modifiers: [{ source: "ability_strength", value: 3 }, { source: "proficiency_sword", value: 3 }],
      })
    );
    // Mock damage: always 5 for 1d8
    mockDiceRoll(5);

    const attacker = { ...proficientAttacker, slotMeleeLeft: "sword", strength: 16, proWeapons: ["sword"] };
    const res = mainHandAttack({ attacker, defender, rollType: "normal" });

    expect(res.attackRoll.success).toBe(true);
    expect(res.attackRoll.total).toBeGreaterThan(0);

    expect(res.damageRoll).toBeDefined();
    expect(res.damageRoll?.base.roll).toBe(5);
    expect(res.damageRoll?.base.type).toBe("slashing");
    expect(res.damageRoll?.extras).toBeUndefined();
    expect(res.damageRoll?.total).toBe(5 + 3); // with 3 strength modifier
  });

  it("misses if attackRoll fails", () => {
    mockRoll20Result(
      mockRoll20({ roll: 3, total: 5, success: false, modifiers: [] })
    );
    const attacker = { ...proficientAttacker, slotMeleeLeft: "sword", strength: 16, proWeapons: ["sword"] };
    const res = mainHandAttack({ attacker, defender, rollType: "normal" });

    expect(res.attackRoll.success).toBe(false);
    expect(res.damageRoll).toBeUndefined();
  });

  it("applies weapon enchantment to damage", () => {
    mockRoll20Result(
      mockRoll20({ roll: 15, total: 20, success: true, modifiers: [{ source: "ability_strength", value: 3 }, { source: "proficiency_sword", value: 3 }] })
    );
    mockDiceRoll(6);
    const attacker = { ...proficientAttacker, slotMeleeLeft: "enchanted", strength: 16, proWeapons: ["sword"] };
    const res = mainHandAttack({ attacker, defender, rollType: "normal" });

    expect(res.damageRoll?.total).toBe(6 + 3 + 2); // 6 base + 2 enchantment + 3 strength modifier
  });

  it("uses versatile damage (2H) if weapon has 'versatile' and offhand empty", () => {
    mockRoll20Result(
      mockRoll20({ roll: 12, total: 15, success: true, modifiers: [{ source: "ability_strength", value: 3 }, { source: "proficiency_sword", value: 3 }] })
    );
    mockDiceRoll(7);
    const attacker = { ...proficientAttacker, slotMeleeLeft: "versatile", slotMeleeRight: undefined };
    const res = mainHandAttack({ attacker, defender, rollType: "normal" });
    expect(res.damageRoll?.base.dice).toBe("1d10"); // 2H
    expect(res.damageRoll?.base.roll).toBe(7);
  });

  it("uses 1H damage if versatile but offhand occupied", () => {
    mockRoll20Result(
      mockRoll20({ roll: 10, total: 13, success: true, modifiers: [{ source: "ability_strength", value: 3 }, { source: "proficiency_sword", value: 3 }] })
    );
    mockDiceRoll(8);
    const attacker = { ...proficientAttacker, slotMeleeLeft: "versatile", slotMeleeRight: "shield" };
    const res = mainHandAttack({ attacker, defender, rollType: "normal" });
    expect(res.damageRoll?.base.dice).toBe("1d8"); // 1H
    expect(res.damageRoll?.base.roll).toBe(8);
  });

  it("adds extra damages (e.g., fire) if weapon has them", () => {
    mockRoll20Result(
      mockRoll20({ roll: 17, total: 20, success: true, modifiers: [{ source: "ability_strength", value: 3 }, { source: "proficiency_sword", value: 3 }] })
    );
    // Base = 4, Extra = 3
    let calls = 0;
    vi.spyOn(dice, "roll").mockImplementation(() => {
      calls++;
      return calls === 1 ? 4 : 3;
    });

    const attacker = { ...proficientAttacker, slotMeleeLeft: "fire_sword" };
    const res = mainHandAttack({ attacker, defender, rollType: "normal" });

    expect(res.damageRoll?.base.roll).toBe(4);
    expect(res.damageRoll?.extras?.[0].roll).toBe(3);
    expect(res.damageRoll?.total).toBe(4 + 3 + 3);
  });

  it("doubles damage dice (including extra) on crit", () => {
    mockRoll20Result(
      mockRoll20({
        roll: 20,
        total: 25,
        success: true,
        critical: true,
        modifiers: [{ source: "ability_strength", value: 3 }, { source: "proficiency_sword", value: 3 }],
      })
    );
    // Mock critical: double dice, so function will call with double=true
    let calls = 0;
    vi.spyOn(dice, "roll").mockImplementation((_: string, double?: boolean) => {
      // Should be double for both base and extra
      expect(double).toBe(true);
      calls++;
      return calls === 1 ? 8 : 5; // base, extra
    });

    const attacker = { ...proficientAttacker, slotMeleeLeft: "fire_sword" };
    const res = mainHandAttack({ attacker, defender, rollType: "normal" });

    expect(res.attackRoll.critical).toBe(true);
    expect(res.damageRoll?.base.roll).toBe(8);
    expect(res.damageRoll?.extras?.[0].roll).toBe(5);
    expect(res.damageRoll?.total).toBe(8 + 5 + 3);
  });

  it("does not apply proficiency if not proficient with weapon", () => {
    mockRoll20Result(
      mockRoll20({
        roll: 12,
        total: 15,
        success: true,
        modifiers: [{ source: "ability_strength", value: 3 }],
      })
    );
    mockDiceRoll(4);

    const attacker = { ...basicAttacker, slotMeleeLeft: "sword", proWeapons: [] };
    const res = mainHandAttack({ attacker, defender, rollType: "normal" });

    expect(res.attackRoll.modifiers?.find((m) => m.source.startsWith("proficiency"))).toBeUndefined();
    expect(res.damageRoll?.base.roll).toBe(4);
  });

  it("uses dexterity modifier if weapon has finesse and DEX > STR", () => {
    // Make attacker with higher dex than str, weapon has finesse
    const finesseWeapon = {
      ...meleeWeapon,
      index: "dagger",
      name: "Dagger",
      weaponFamily: "dagger",
      properties: ["melee", "finesse"],
      damage1H: { dice: "1d4", type: "piercing" },
    };
    EquipmentList.push(finesseWeapon);

    mockRoll20Result(
      mockRoll20({
        roll: 15,
        total: 17,
        success: true,
        modifiers: [{ source: "ability_dexterity", value: 2 }, { source: "proficiency_dagger", value: 3 }],
      })
    );
    mockDiceRoll(3);
    const attacker = {
      ...proficientAttacker,
      strength: 10,
      dexterity: 14, // DEX mod = 2
      slotMeleeLeft: "dagger",
      proWeapons: ["dagger"],
    };
    const res = mainHandAttack({ attacker, defender, rollType: "normal" });

    expect(res.attackRoll.success).toBe(true);
    expect(res.attackRoll.modifiers?.some((m) => m.source === "ability_dexterity")).toBe(true);
    expect(res.damageRoll?.base.type).toBe("piercing");
    expect(res.damageRoll?.base.roll).toBe(3);
    expect(res.damageRoll?.total).toBe(3 + 2); // 3 roll + 2 dex mod
  });

  it("handles missing damage1H and damage2H by throwing", () => {
    const brokenWeapon = {
      ...meleeWeapon,
      index: "broken",
      name: "Broken Sword",
      damage1H: undefined,
      damage2H: undefined,
    };
    EquipmentList.push(brokenWeapon);

    mockRoll20Result(mockRoll20({ roll: 15, total: 18, success: true, modifiers: [] }));

    const attacker = { ...basicAttacker, slotMeleeLeft: "broken", proWeapons: ["sword"] };
    expect(() =>
      mainHandAttack({ attacker, defender, rollType: "normal" })
    ).toThrow(/Damage property not found/);
  });

  it("returns only ability mod on damage if no proficiency or enchantment", () => {
    mockRoll20Result(
      mockRoll20({ roll: 14, total: 17, success: true, modifiers: [{ source: "ability_strength", value: 3 }] })
    );
    mockDiceRoll(5);

    const attacker = { ...basicAttacker, slotMeleeLeft: "sword", proWeapons: [] };
    const res = mainHandAttack({ attacker, defender, rollType: "normal" });

    expect(res.damageRoll?.total).toBe(5 + 3); // Only strength mod
  });

  it("adds zero modifier if ability mod is zero", () => {
    mockRoll20Result(
      mockRoll20({ roll: 10, total: 10, success: true, modifiers: [] })
    );
    mockDiceRoll(4);

    const attacker = { ...proficientAttacker, slotMeleeLeft: "sword", strength: 10 }; // STR mod = 0
    const res = mainHandAttack({ attacker, defender, rollType: "normal" });
    expect(res.damageRoll?.total).toBe(4); // No modifiers
  });

  it("throws if weapon in main hand is not of weapon type (wrong category)", () => {
    const notAWeapon = {
      ...meleeWeapon,
      index: "helmet",
      category: "armour",
    };
    EquipmentList.push(notAWeapon);

    const attacker = { ...basicAttacker, slotMeleeLeft: "helmet" };
    expect(() =>
      mainHandAttack({ attacker, defender, rollType: "normal" })
    ).toThrow();
  });

  it("sets damage to 0 if defender is immune to damage type", () => {
    mockRoll20Result(
      mockRoll20({ roll: 18, total: 21, success: true, modifiers: [{ source: "ability_strength", value: 3 }] })
    );
    mockDiceRoll(6);

    const immuneDefender = { ...defender, immunities: ["slashing"] as DamageType[] };
    const attacker = { ...basicAttacker, slotMeleeLeft: "sword", proWeapons: ["sword"] };

    const res = mainHandAttack({ attacker, defender: immuneDefender, rollType: "normal" });
    expect(res.damageRoll?.base.final).toBe(0);
    expect(res.damageRoll?.base.resistance).toBe("imimunity");
  });

  it("halves damage if defender is resistant to damage type", () => {
    mockRoll20Result(
      mockRoll20({ roll: 16, total: 19, success: true, modifiers: [{ source: "ability_strength", value: 3 }] })
    );
    mockDiceRoll(7);

    const resistantDefender = { ...defender, resistances: ["slashing"] as DamageType[] };
    const attacker = { ...basicAttacker, slotMeleeLeft: "sword", proWeapons: ["sword"] };

    const res = mainHandAttack({ attacker, defender: resistantDefender, rollType: "normal" });
    expect(res.damageRoll?.base.final).toBe(Math.floor(3)); // Should be floored, since no vulnerability
    expect(res.damageRoll?.base.resistance).toBe("resistance");
  });

  it("doubles damage if defender is vulnerable to damage type", () => {
    mockRoll20Result(
      mockRoll20({ roll: 15, total: 18, success: true, modifiers: [{ source: "ability_strength", value: 3 }] })
    );
    mockDiceRoll(8);

    const vulnerableDefender = { ...defender, vulnerabilities: ["slashing"] as DamageType[] };
    const attacker = { ...basicAttacker, slotMeleeLeft: "sword", proWeapons: ["sword"] };

    const res = mainHandAttack({ attacker, defender: vulnerableDefender, rollType: "normal" });
    expect(res.damageRoll?.base.final).toBe(16); // 8 * 2
    expect(res.damageRoll?.base.resistance).toBe("vulnerability");
  });

  // If both resistance and vulnerability are present, vulnerability takes priority (double, not half)
  it("no prioritizes or vulnerability if defender has both", () => {
    mockRoll20Result(
      mockRoll20({ roll: 14, total: 17, success: true, modifiers: [{ source: "ability_strength", value: 3 }] })
    );
    mockDiceRoll(5);

    const defenderBoth = {
      ...defender,
      resistances: ["slashing"] as DamageType[],
      vulnerabilities: ["slashing"] as DamageType[],
    };
    const attacker = { ...basicAttacker, slotMeleeLeft: "sword", proWeapons: ["sword"] };

    const res = mainHandAttack({ attacker, defender: defenderBoth, rollType: "normal" });
    expect(res.damageRoll?.base.final).toBe(5);
    expect(res.damageRoll?.base.resistance).toBeUndefined();
  });
});
