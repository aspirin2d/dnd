import { describe, it, expect } from "vitest";

import { default as SkillsData } from "../data/skills.json";
import { SkillIndex, SkillTransformer, SkillSchema } from "./skill";
import { AbilityIndex } from "./ability";

describe("Skills Data", () => {
  it("should parse all skills.json entries correctly", () => {
    for (const entry of SkillsData) {
      expect(entry).toHaveProperty("index");
      expect(entry).toHaveProperty("name");
      expect(entry).toHaveProperty("description");
      expect(entry).toHaveProperty("ability");
    }
  });

  it("should match each skill index to SkillIndex enum", () => {
    const skillIndices = SkillsData.map((s) => s.index);
    for (const index of skillIndices) {
      expect(SkillIndex.options).toContain(index);
    }
  });

  it("each skill's ability must be in AbilityIndex", () => {
    for (const skill of SkillsData) {
      expect(AbilityIndex.options).toContain(skill.ability);
    }
  });

  it("should transform a known skill", () => {
    const skill = SkillTransformer.parse("arcana");
    expect(skill).toHaveProperty("name");
    expect(skill.index).toBe("arcana");
  });

  it("should throw for an unknown skill", () => {
    expect(() => {
      SkillTransformer.parse("fortune" as any);
    }).toThrow();
  });
});


// ✅ Mock-based unit tests
const mockSkill = {
  index: "perception",
  name: "Perception",
  description: "Spot hidden details or enemies.",
  ability: "wisdom"
};

describe("Mocked SkillSchema", () => {
  it("should accept a valid skill", () => {
    const result = SkillSchema.safeParse(mockSkill);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.ability.index).toBe("wisdom");
    }
  });

  it("should fail with invalid ability", () => {
    const badSkill = structuredClone(mockSkill);
    badSkill.ability = "luck"; // not a valid ability

    const result = SkillSchema.safeParse(badSkill);
    expect(result.success).toBe(false);
  });
});
