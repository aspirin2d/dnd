import { describe, it, expect } from "vitest";

import { default as SkillsData } from "../data/skills.json";
import { SkillTransformer, SkillSchema } from "./skill";
import { AbilityType } from "./ability";

describe("Skills Data", () => {
  it("should parse all skills.json entries correctly", () => {
    for (const entry of SkillsData) {
      expect(entry).toHaveProperty("index");
      expect(entry).toHaveProperty("name");
      expect(entry).toHaveProperty("description");
      expect(entry).toHaveProperty("ability");
    }
  });

  it("each skill's ability must be in AbilityType", () => {
    for (const skill of SkillsData) {
      expect(AbilityType.options).toContain(skill.ability);
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
  ability: "wisdom",
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

describe("SkillSchema additional tests", () => {
  it("safeParse returns data.ability.index correctly", () => {
    const res = SkillSchema.safeParse(mockSkill);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.ability.index).toBe("wisdom");
      // full object round‐trip
      expect(res.data.name).toBe(mockSkill.name);
    }
  });

  it("SkillTransformer.parse returns the full Skill object", () => {
    const skillObj = SkillTransformer.parse("perception");
    expect(skillObj).toHaveProperty("description");
    expect(skillObj.index).toBe("perception");
  });
});
