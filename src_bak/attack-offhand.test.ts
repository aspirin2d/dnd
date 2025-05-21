// attack-offhand.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { offHandAttack } from "./attack-offhand";
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
let lightWeapon: Weapon;
let enchantedWeapon: Weapon;
let weaponWithExtra: Weapon;
let finesseWeapon: Weapon;
let notLightWeapon: Weapon;
let baseEquipmentList: any[];

beforeEach(() => {
  lightWeapon = {
    index: "dagger",
    name: "Dagger",
    description: "A light dagger.",
    category: "weapon",
    rarity: "common",
    weight: 1,
    price: 50,
    weaponCategory: "simple",
    weaponFamily: "dagger",
    damage1H: { dice: "1d4", type: "piercing" },
    properties: ["melee", "light"],
    actions: [],
  };

  enchantedWeapon = {
    ...lightWeapon,
    index: "enchanted_dagger",
    name: "Enchanted Dagger",
    enchantment: 2,
  };

  weaponWithExtra = {
    ...lightWeapon,
    index: "fire_dagger",
    name: "Fire Dagger",
    extraDamages: [{ dice: "1d6", type: "fire" }],
  };

  finesseWeapon = {
    ...lightWeapon,
    index: "finesse_dagger",
    name: "Finesse Dagger",
    properties: ["melee", "light", "finesse"],
    damage1H: { dice: "1d4", type: "piercing" },
  };

  notLightWeapon = {
    ...lightWeapon,
    index: "sword",
    name: "Sword",
    properties: ["melee"],
    damage1H: { dice: "1d8", type: "slashing" },
    weaponFamily: "sword",
    weaponCategory: "martial",
  };

  baseEquipmentList = [lightWeapon, enchantedWeapon, weaponWithExtra, finesseWeapon, notLightWeapon];
  EquipmentList.length = 0;
  baseEquipmentList.forEach((w) => EquipmentList.push(w));
});

afterEach(() => {
  vi.restoreAllMocks();
});

// --- Mock dice.roll and dice.roll20 ---
function mockDiceRoll(value: number) {
  vi.spyOn(dice, "roll").mockImplementation(() => {
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
  class: "rogue",
  level: 5,
  strength: 10,
  dexterity: 16,
  constitution: 12,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
  proWeapons: ["dagger"],
  proArmour: [],
  proSkills: [],
  expSkills: [],
  savingThrows: [],
  slotMeleeLeft: undefined,
  slotMeleeRight: "dagger",
  slotBody: undefined,
  background: "urchin",
  specy: "human",
};

const proficientAttacker: Character = {
  ...basicAttacker,
  proWeapons: ["dagger", "sword"],
};

const defender: Character = {
  ...basicAttacker,
  id: "defender",
  name: "Defender",
  slotMeleeLeft: undefined,
  slotMeleeRight: undefined,
  slotBody: undefined,
};

describe("offHandAttack", () => {
  it("should throw if off-hand weapon is not found", () => {
    const attacker = { ...basicAttacker, slotMeleeRight: undefined };
    expect(() =>
      offHandAttack({ attacker, defender, rollType: "normal" })
    ).toThrow(/Off-hand weapon not found/);
  });

  it("should throw if weapon in slot is not found", () => {
    const attacker = { ...basicAttacker, slotMeleeRight: "not_exist" };
    expect(() =>
      offHandAttack({ attacker, defender, rollType: "normal" })
    ).toThrow(/Weapon not found at off-hand/);
  });

  it("throws if off-hand item is not of weapon category", () => {
    const notAWeapon = {
      ...lightWeapon,
      index: "helmet",
      name: "Helmet",
      category: "armour",
      properties: [],
    };
    EquipmentList.push(notAWeapon);
    const attacker = { ...basicAttacker, slotMeleeRight: "helmet" };
    expect(() =>
      offHandAttack({ attacker, defender, rollType: "normal" })
    ).toThrow(/Off-hand slot is not a weapon/);
  });


  it("should throw if off-hand weapon is not light", () => {
    const attacker = { ...basicAttacker, slotMeleeRight: "sword" };
    expect(() =>
      offHandAttack({ attacker, defender, rollType: "normal" })
    ).toThrow(/Off-hand attacks require a light weapon/);
  });

  it("performs a normal offhand attack: hit, with ability and proficiency for attack, but no ability mod to damage", () => {
    mockRoll20Result(
      mockRoll20({
        roll: 14,
        total: 17,
        success: true,
        modifiers: [{ source: "ability_dexterity", value: 3 }, { source: "proficiency_dagger", value: 3 }],
      })
    );
    mockDiceRoll(3);

    const attacker = { ...proficientAttacker, slotMeleeRight: "dagger", dexterity: 16, proWeapons: ["dagger"] };
    const res = offHandAttack({ attacker, defender, rollType: "normal" });

    expect(res.attackRoll.success).toBe(true);
    expect(res.attackRoll.total).toBeGreaterThan(0);

    expect(res.damageRoll).toBeDefined();
    expect(res.damageRoll?.base.roll).toBe(3);
    expect(res.damageRoll?.base.type).toBe("piercing");
    expect(res.damageRoll?.extras).toBeUndefined();
    expect(res.damageRoll?.total).toBe(3); // **No ability modifier by default**
  });

  it("misses if attackRoll fails", () => {
    mockRoll20Result(
      mockRoll20({ roll: 2, total: 5, success: false, modifiers: [] })
    );
    const attacker = { ...proficientAttacker, slotMeleeRight: "dagger" };
    const res = offHandAttack({ attacker, defender, rollType: "normal" });

    expect(res.attackRoll.success).toBe(false);
    expect(res.damageRoll).toBeUndefined();
  });

  it("applies weapon enchantment to damage", () => {
    mockRoll20Result(
      mockRoll20({ roll: 15, total: 18, success: true, modifiers: [{ source: "ability_dexterity", value: 3 }, { source: "proficiency_dagger", value: 3 }] })
    );
    mockDiceRoll(4);
    const attacker = { ...proficientAttacker, slotMeleeRight: "enchanted_dagger", dexterity: 16 };
    const res = offHandAttack({ attacker, defender, rollType: "normal" });

    expect(res.damageRoll?.total).toBe(4 + 2); // 4 base + 2 enchantment
  });

  it("adds extra damages (e.g., fire) if weapon has them", () => {
    mockRoll20Result(
      mockRoll20({ roll: 17, total: 20, success: true, modifiers: [{ source: "ability_dexterity", value: 3 }, { source: "proficiency_dagger", value: 3 }] })
    );
    // Base = 2, Extra = 5
    let calls = 0;
    vi.spyOn(dice, "roll").mockImplementation(() => {
      calls++;
      return calls === 1 ? 2 : 5;
    });

    const attacker = { ...proficientAttacker, slotMeleeRight: "fire_dagger" };
    const res = offHandAttack({ attacker, defender, rollType: "normal" });

    expect(res.damageRoll?.base.roll).toBe(2);
    expect(res.damageRoll?.extras?.[0].roll).toBe(5);
    expect(res.damageRoll?.total).toBe(2 + 5);
  });

  it("doubles damage dice (including extra) on crit", () => {
    mockRoll20Result(
      mockRoll20({
        roll: 20,
        total: 25,
        success: true,
        critical: true,
        modifiers: [{ source: "ability_dexterity", value: 3 }, { source: "proficiency_dagger", value: 3 }],
      })
    );
    // Should call with double=true for both base and extra
    let calls = 0;
    vi.spyOn(dice, "roll").mockImplementation((_: string, double?: boolean) => {
      expect(double).toBe(true);
      calls++;
      return calls === 1 ? 6 : 4;
    });

    const attacker = { ...proficientAttacker, slotMeleeRight: "fire_dagger" };
    const res = offHandAttack({ attacker, defender, rollType: "normal" });

    expect(res.attackRoll.critical).toBe(true);
    expect(res.damageRoll?.base.roll).toBe(6);
    expect(res.damageRoll?.extras?.[0].roll).toBe(4);
    expect(res.damageRoll?.total).toBe(6 + 4);
  });

  it("does not apply proficiency if not proficient with weapon", () => {
    mockRoll20Result(
      mockRoll20({
        roll: 12,
        total: 12,
        success: true,
        modifiers: [{ source: "ability_dexterity", value: 3 }],
      })
    );
    mockDiceRoll(4);

    const attacker = { ...basicAttacker, slotMeleeRight: "dagger", proWeapons: [] };
    const res = offHandAttack({ attacker, defender, rollType: "normal" });

    expect(res.attackRoll.modifiers?.find((m) => m.source.startsWith("proficiency"))).toBeUndefined();
    expect(res.damageRoll?.base.roll).toBe(4);
  });

  it("uses dexterity modifier for attack if weapon has finesse and DEX > STR", () => {
    mockRoll20Result(
      mockRoll20({
        roll: 15,
        total: 18,
        success: true,
        modifiers: [{ source: "ability_dexterity", value: 3 }, { source: "proficiency_dagger", value: 3 }],
      })
    );
    mockDiceRoll(3);
    const attacker = {
      ...proficientAttacker,
      strength: 10,
      dexterity: 16,
      slotMeleeRight: "finesse_dagger",
      proWeapons: ["dagger"],
    };
    const res = offHandAttack({ attacker, defender, rollType: "normal" });

    expect(res.attackRoll.modifiers?.some((m) => m.source === "ability_dexterity")).toBe(true);
    expect(res.damageRoll?.base.type).toBe("piercing");
    expect(res.damageRoll?.modifiers).toBeUndefined(); // no ability mod by default
    expect(res.damageRoll?.base.roll).toBe(3);
    expect(res.damageRoll?.total).toBe(3);
  });

  it("handles missing damage1H by throwing", () => {
    const brokenWeapon = {
      ...lightWeapon,
      index: "broken",
      name: "Broken Dagger",
      damage1H: undefined,
    };
    EquipmentList.push(brokenWeapon);

    mockRoll20Result(mockRoll20({ roll: 10, total: 12, success: true, modifiers: [] }));

    const attacker = { ...basicAttacker, slotMeleeRight: "broken", proWeapons: ["dagger"] };
    expect(() =>
      offHandAttack({ attacker, defender, rollType: "normal" })
    ).toThrow(/Damage property not found/);
  });
});
