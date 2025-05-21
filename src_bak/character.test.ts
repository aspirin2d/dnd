import { describe, it, expect } from "vitest";
import {
  proficiencyBonus,
  tav,
  CharacterList,
  type Character
} from "./character";

// Dummy character for testing
const makeChar = (level: number): Character => ({
  id: "test",
  name: "Test Char",
  class: "fighter",
  level,
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
  proWeapons: [],
  proArmour: [],
  proSkills: [],
  expSkills: [],
  savingThrows: [],
  background: "",
  specy: "",
});

// Level 1-4: Proficiency Bonus is +2.
// Level 5-8: Proficiency Bonus is +3.
// Level 9-12: Proficiency Bonus is +4.
// Level 13-16: Proficiency Bonus is +5.
// Level 17-20: Proficiency Bonus is +6. 
describe("proficiencyBonus", () => {
  it("should return 2 for level 1", () => {
    expect(proficiencyBonus(makeChar(1))).toBe(2);
  });
  it("should return 2 for level 4", () => {
    expect(proficiencyBonus(makeChar(4))).toBe(2);
  });
  it("should return 3 for level 5", () => {
    expect(proficiencyBonus(makeChar(5))).toBe(3);
  });
  it("should return 4 for level 9", () => {
    expect(proficiencyBonus(makeChar(9))).toBe(4);
  });
  it("should return 5 for level 17", () => {
    expect(proficiencyBonus(makeChar(17))).toBe(6);
  });
  it("should return 6 for level 20", () => {
    expect(proficiencyBonus(makeChar(20))).toBe(6);
  });
  it("should increase at the correct level thresholds", () => {
    // Level : Bonus
    // 1-4   : 2
    // 5-8   : 3
    // 9-12  : 4
    // 13-16 : 5
    // 17-20 : 6
    expect(proficiencyBonus(makeChar(1))).toBe(2);
    expect(proficiencyBonus(makeChar(4))).toBe(2);
    expect(proficiencyBonus(makeChar(5))).toBe(3);
    expect(proficiencyBonus(makeChar(8))).toBe(3);
    expect(proficiencyBonus(makeChar(9))).toBe(4);
    expect(proficiencyBonus(makeChar(12))).toBe(4);
    expect(proficiencyBonus(makeChar(13))).toBe(5);
    expect(proficiencyBonus(makeChar(16))).toBe(5);
    expect(proficiencyBonus(makeChar(17))).toBe(6);
    expect(proficiencyBonus(makeChar(20))).toBe(6);
  });
});

describe("tav", () => {
  it('should return a character named "tav"', () => {
    const c = tav();
    expect(c).toBeDefined();
    expect(c.name.toLowerCase()).toContain("tav");
    // You could check for id === "tav" if that's always true
    expect(c.id).toBe("tav");
  });
});

describe("CharacterList", () => {
  it("should be an array and contain at least one character", () => {
    expect(Array.isArray(CharacterList)).toBe(true);
    expect(CharacterList.length).toBeGreaterThan(0);
  });
  it("all entries should have required fields", () => {
    for (const char of CharacterList) {
      expect(char).toHaveProperty("id");
      expect(char).toHaveProperty("name");
      expect(typeof char.level).toBe("number");
      expect(typeof char.strength).toBe("number");
      expect(typeof char.dexterity).toBe("number");
      expect(typeof char.constitution).toBe("number");
      expect(typeof char.intelligence).toBe("number");
      expect(typeof char.wisdom).toBe("number");
      expect(typeof char.charisma).toBe("number");
    }
  });
});
