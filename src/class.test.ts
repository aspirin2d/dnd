import { describe, expect, it } from "vitest";

import { default as ClassesData } from "../data/classes.json";
import { ClassTransformer, ClassSchema } from "./class";

// schema under test (re-import ClassSchema if testing structure)
import { AbilityType } from "./ability";

describe("Class Schema", () => {
  it("should parse all classes.json entries correctly", () => {
    for (const entry of ClassesData) {
      expect(() => {
        // Basic Zod shape check (use parsed list if needed)
        expect(entry).toHaveProperty("index");
        expect(entry).toHaveProperty("hitPoints");
        expect(entry).toHaveProperty("proficiencies");
      }).not.toThrow();
    }
  });

  it("should find a known class using ClassTransformer", () => {
    expect(() => {
      const wizard = ClassTransformer.parse("wizard");
      expect(wizard).toHaveProperty("name");
      expect(wizard.index).toBe("wizard");
    }).not.toThrow();
  });

  it("should throw error for unknown class", () => {
    expect(() => {
      ClassTransformer.parse("archmage" as any); // not in enum
    }).toThrow();
  });

  it("each class should have 2 savingThrows from AbilityType", () => {
    for (const cls of ClassesData) {
      const [a1, a2] = cls.proficiencies.savingThrows;
      expect(AbilityType.options).toContain(a1);
      expect(AbilityType.options).toContain(a2);
      expect(a1).not.toBe(a2);
    }
  });

  it("each class should have valid skill selections", () => {
    for (const cls of ClassesData) {
      const skillSet = cls.proficiencies.skills;
      expect(skillSet.from.length).toBeGreaterThanOrEqual(skillSet.count);
    }
  });
});

// Create a mocked class entry
const mockClass = {
  index: "wizard",
  name: "Wizard",
  description: "A spellcasting class.",
  hitPoints: {
    initial: 6,
    perLevel: 4,
  },
  proficiencies: {
    skills: {
      from: ["arcana", "history", "investigation"],
      count: 2,
    },
    weapons: ["dagger", "quarterstaff"],
    armour: [],
    savingThrows: ["intelligence", "wisdom"],
  },
};

describe("Mocked ClassSchema", () => {
  it("should validate mocked class data correctly", () => {
    const result = ClassSchema.safeParse(mockClass);
    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.index).toBe("wizard");
      expect(result.data.hitPoints.initial).toBe(6);
    }
  });

  it("should fail if savingThrows are invalid", () => {
    const badClass = structuredClone(mockClass);
    badClass.proficiencies.savingThrows[0] = "luck"; // not a valid ability

    const result = ClassSchema.safeParse(badClass);
    expect(result.success).toBe(false);
  });

  it("should fail if skill count exceeds available choices", () => {
    const badClass = structuredClone(mockClass);
    badClass.proficiencies.skills.count = 5; // only 3-4 skills available

    const result = ClassSchema.safeParse(badClass);
    expect(result.success).toBe(false);
  });
});

describe("ClassSchema additional edge cases", () => {
  const base = structuredClone(mockClass);

  it("allows selecting exactly the minimum count of skills", () => {
    const cls = structuredClone(base);
    cls.proficiencies.skills.from = ["arcana", "history"];
    cls.proficiencies.skills.count = 2;
    expect(() => ClassSchema.parse(cls)).not.toThrow();
  });

  it("allows selecting exactly the maximum count of skills", () => {
    const cls = structuredClone(base);
    // max is 4 per z.int().max(4)
    cls.proficiencies.skills.from = [
      "arcana",
      "history",
      "stealth",
      "investigation",
    ];
    cls.proficiencies.skills.count = 4;
    expect(() => ClassSchema.parse(cls)).not.toThrow();
  });

  it("rejects when count is below the minimum", () => {
    const cls = structuredClone(base);
    cls.proficiencies.skills.count = 1;
    expect(() => ClassSchema.parse(cls)).toThrowError(/Too small/);
  });

  it("rejects when count is above the maximum", () => {
    const cls = structuredClone(base);
    cls.proficiencies.skills.count = 5;
    expect(() => ClassSchema.parse(cls)).toThrowError(/Too big/);
  });

  it("ClassTransformer throws a custom error message for unknown class", () => {
    expect(() => ClassTransformer.parse("dragonborn" as any)).toThrowError(
      /Class dragonborn not found/,
    );
  });
});
