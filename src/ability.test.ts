// ability-check.test.ts

import { describe, it, expect, vi, afterEach } from "vitest";
import { abilityCheck } from "./ability";
import type { Skill } from "./skill";
import type { Character } from "./character";

// Helper: Mock Math.random to always return a specific value
function mockRandomSequence(...values: number[]) {
  let i = 0;
  vi.spyOn(Math, "random").mockImplementation(() => values[i++ % values.length]);
}

afterEach(() => {
  vi.restoreAllMocks();
});

// Minimal Skill mock for testing
const SKILLS: Record<string, Skill> = {
  athletics: { index: "athletics", name: "Athletics", ability: "strength", description: "" },
  stealth: { index: "stealth", name: "Stealth", ability: "dexterity", description: "" },
  investigation: { index: "investigation", name: "Investigation", ability: "intelligence", description: "" },
};

const BASE_CHARACTER: Character = {
  id: "hero1",
  name: "Test Hero",
  class: "fighter",
  specy: "human",
  background: "soldier",
  level: 4,
  strength: 14,    // +2
  dexterity: 10,   // +0
  constitution: 12, // +1
  intelligence: 8, // -1
  wisdom: 10,      // +0
  charisma: 10,    // +0
  proWeapons: [],
  proArmour: [],
  proSkills: [],
  expSkills: [],
  savingThrows: [],
};

describe("abilityCheck", () => {
  it("applies ability modifier only if no proficiency", () => {
    // strength 14 = +2, not proficient
    mockRandomSequence(0.4); // 0.4*20=8+1=9
    const char = { ...BASE_CHARACTER };
    const result = abilityCheck({
      character: char,
      skill: SKILLS.athletics,
      difficultyClass: 10,
    });
    expect(result.roll).toBe(9);
    expect(result.total).toBe(11); // 9+2
    expect(result.success).toBe(true);
    expect(result.skill.index).toBe("athletics");
  });

  it("applies proficiency modifier if proficient", () => {
    // level 4 = PB+2, strength 14 = +2
    mockRandomSequence(0.1); // 0.1*20=2+1=3
    const char = { ...BASE_CHARACTER, proSkills: ["athletics"] };
    const result = abilityCheck({
      character: char,
      skill: SKILLS.athletics,
      difficultyClass: 7,
    });
    // 3 (roll) +2 (STR) +2 (PB) = 7
    expect(result.roll).toBe(3);
    expect(result.total).toBe(7);
    expect(result.success).toBe(true);
    // Check sources for transparency
    expect(result.modifiers?.map(m => m.source)).toContain("ability_strength");
    expect(result.modifiers?.map(m => m.source)).toContain("proficiency_athletics");
  });

  it("applies expertise modifier if character has expertise", () => {
    // level 4 = PB+2, expertise doubles to +4
    mockRandomSequence(0.5); // 0.5*20=10+1=11
    const char = { ...BASE_CHARACTER, expSkills: ["stealth"], dexterity: 16 }; // +3
    const result = abilityCheck({
      character: char,
      skill: SKILLS.stealth,
      difficultyClass: 20,
    });
    // 11 (roll) +3 (DEX) +4 (expertise) = 18
    expect(result.roll).toBe(11);
    expect(result.total).toBe(18);
    expect(result.success).toBe(false);
    expect(result.modifiers?.map(m => m.source)).toContain("ability_dexterity");
    expect(result.modifiers?.map(m => m.source)).toContain("expertise_stealth");
  });

  it("returns critical success on natural 20", () => {
    mockRandomSequence(0.95); // 0.95*20=19+1=20
    const char = { ...BASE_CHARACTER, strength: 8 }; // -1
    const result = abilityCheck({
      character: char,
      skill: SKILLS.athletics,
      difficultyClass: 99,
    });
    expect(result.roll).toBe(20);
    expect(result.critical).toBe(true);
    expect(result.success).toBe(true);
  });

  it("returns critical fail on natural 1", () => {
    mockRandomSequence(0.0); // 0*20=0+1=1
    const char = { ...BASE_CHARACTER, proSkills: ["athletics"], strength: 20 }; // +5
    const result = abilityCheck({
      character: char,
      skill: SKILLS.athletics,
      difficultyClass: 1,
    });
    expect(result.roll).toBe(1);
    expect(result.critical).toBe(true);
    expect(result.success).toBe(false);
  });

  it("omits zero-value modifiers from total", () => {
    mockRandomSequence(0.3); // 0.3*20=6+1=7
    const char = { ...BASE_CHARACTER, dexterity: 10 }; // +0, not proficient
    const result = abilityCheck({
      character: char,
      skill: SKILLS.stealth,
      difficultyClass: 7,
    });
    expect(result.roll).toBe(7);
    expect(result.total).toBe(7);
    // If zero modifiers are not added, modifiers array will be undefined or empty
    expect(!result.modifiers || result.modifiers.length === 0).toBe(true);
  });

  it("handles negative ability modifiers", () => {
    mockRandomSequence(0.5); // 0.5*20=10+1=11
    const char = { ...BASE_CHARACTER, intelligence: 8 }; // -1, not proficient
    const result = abilityCheck({
      character: char,
      skill: SKILLS.investigation,
      difficultyClass: 12,
    });
    expect(result.roll).toBe(11);
    expect(result.total).toBe(10); // 11 - 1
    expect(result.success).toBe(false);
    expect(result.modifiers?.[0].value).toBe(-1);
  });
});
