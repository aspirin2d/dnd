import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { armourClass, type Armour } from "./armour";
import type { Character } from "./character";
import * as equipmentModule from "./equipment"; // To mock EquipmentList

// Mock EquipmentList for all tests
const mockArmour: Armour = {
  index: "leather",
  name: "Leather Armor",
  description: "Basic light armor.",
  category: "armour",
  armourCategory: "light",
  stealthAdvantage: false,
  armourClass: 11,
  special: [],
  rarity: "common",
  weight: 5,
  price: 100,
};
const mockMediumArmour: Armour = {
  ...mockArmour,
  index: "scale",
  name: "Scale Mail",
  armourCategory: "medium",
  armourClass: 14,
};
const mockHeavyArmour: Armour = {
  ...mockArmour,
  index: "plate",
  name: "Plate Armor",
  armourCategory: "heavy",
  armourClass: 18,
};
const mockShield: Armour = {
  ...mockArmour,
  index: "shield",
  name: "Shield",
  category: "armour",
  armourCategory: "shield",
  armourClass: 2, // bonus only!
};

beforeEach(() => {
  // Mock EquipmentList globally for all tests
  vi.spyOn(equipmentModule, "EquipmentList", "get").mockReturnValue([
    mockArmour,
    mockMediumArmour,
    mockHeavyArmour,
    mockShield,
  ]);
});
afterEach(() => {
  vi.restoreAllMocks();
});

const BASE_CHAR: Character = {
  id: "tav",
  name: "Tav",
  class: "fighter",
  specy: "human",
  background: "soldier",
  level: 1,
  strength: 10,
  dexterity: 16,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
  proWeapons: [],
  proArmour: [],
  proSkills: [],
  expSkills: [],
  savingThrows: [],
  // equipment slots (all empty by default)
};

describe("armourClass", () => {
  it("returns 10 for unarmored character", () => {
    const char = { ...BASE_CHAR, slotBody: undefined };
    const result = armourClass(char);
    expect(result.base).toBe(10);
    expect(result.total).toBe(10);
    expect(result.modifiers).toEqual([]);
  });

  it("returns correct AC for light armor (adds full Dex)", () => {
    const char = { ...BASE_CHAR, slotBody: "leather" }; // Dex 16 (+3)
    const result = armourClass(char);
    expect(result.base).toBe(11); // Leather base
    expect(result.total).toBe(14); // 11 + 3 (Dex)
    expect(result.modifiers[0].value).toBe(3); // Dex modifier
  });

  it("returns correct AC for medium armor (Dex capped at 2)", () => {
    const char = { ...BASE_CHAR, slotBody: "scale" }; // Dex 16 (+3)
    const result = armourClass(char);
    expect(result.base).toBe(14);
    expect(result.total).toBe(16); // 14 + 2 (Dex cap)
    expect(result.modifiers[0].value).toBe(2);
  });

  it("returns correct AC for heavy armor (no Dex)", () => {
    const char = { ...BASE_CHAR, slotBody: "plate" }; // Dex 16 ignored
    const result = armourClass(char);
    expect(result.base).toBe(18);
    expect(result.total).toBe(18); // no modifiers
    expect(result.modifiers.length).toBe(0);
  });

  it("adds shield bonus from right hand", () => {
    const char = { ...BASE_CHAR, slotMeleeRight: "shield" };
    const result = armourClass(char);
    expect(result.base).toBe(10); // unarmored
    expect(result.total).toBe(12); // 10 + 2 (shield)
    expect(result.modifiers[0].source).toBe("shield_bonus");
    expect(result.modifiers[0].value).toBe(2);
  });

  it("adds shield bonus from left hand", () => {
    const char = { ...BASE_CHAR, slotMeleeRight: "shield" };
    const result = armourClass(char);
    expect(result.total).toBe(12);
    expect(result.modifiers[0].source).toBe("shield_bonus");
  });

  it("stacks armor and shield", () => {
    const char = { ...BASE_CHAR, slotBody: "leather", slotMeleeRight: "shield" };
    const result = armourClass(char);
    expect(result.base).toBe(11);
    // 11 (leather) + 3 (Dex) + 2 (shield)
    expect(result.total).toBe(16);
    expect(result.modifiers.find(m => m.source === "shield_bonus")?.value).toBe(2);
    expect(result.modifiers.find(m => m.source.startsWith("ability"))?.value).toBe(3);
  });
});
