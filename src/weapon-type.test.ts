import { describe, expect, it } from "vitest";
import { WeaponRange, WeaponTypeSchema } from "./weapon-type";

// Sample damage entries for reuse
const sampleOneHanded = {
  oneHanded: { damageType: "slashing", notation: "1d6+2" },
};
const sampleTwoHanded = {
  twoHanded: { damageType: "slashing", notation: "1d10+3" },
};
const sampleVersatile = {
  oneHanded: { damageType: "piercing", notation: "1d8" },
  twoHanded: { damageType: "piercing", notation: "1d10" },
};

describe("WeaponTypeSchema valid cases", () => {
  it("parses a simple one-handed weapon (club)", () => {
    const data = {
      index: "club",
      name: "Club",
      description: "",
      range: "melee",
      properties: [],
      damage: sampleOneHanded,
    };
    expect(() => WeaponTypeSchema.parse(data)).not.toThrow();
  });

  it("parses a two-handed weapon (greatsword)", () => {
    const data = {
      index: "greatsword",
      name: "Greatsword",
      description: "",
      range: "melee",
      properties: ["two-handed"],
      damage: sampleTwoHanded,
    };
    expect(() => WeaponTypeSchema.parse(data)).not.toThrow();
  });

  it("parses a versatile weapon (longsword)", () => {
    const data = {
      index: "longsword",
      name: "Longsword",
      description: "test description",
      range: "melee",
      properties: ["versatile"],
      damage: sampleVersatile,
    };
    expect(() => WeaponTypeSchema.parse(data)).not.toThrow();
  });
});

describe("WeaponTypeSchema invalid cases", () => {
  it("fails when versatile without both damage entries", () => {
    const data = {
      index: "halberd",
      name: "Halberd",
      description: "test description",
      range: "melee",
      properties: ["versatile"],
      damage: sampleOneHanded,
    };
    expect(() => WeaponTypeSchema.parse(data)).toThrow(
      /requires both oneHanded AND twoHanded/,
    );
  });

  it("fails when two-handed property includes oneHanded damage", () => {
    const data = {
      index: "greatclub",
      name: "Greatclub",
      description: "test description",
      range: "melee",
      properties: ["two-handed"],
      damage: sampleOneHanded,
    };
    expect(() => WeaponTypeSchema.parse(data)).toThrow(
      /must not include oneHanded damage/,
    );
  });

  it("fails when combining versatile and two-handed properties", () => {
    const data = {
      index: "glaive",
      name: "Glaive",
      description: "test description",
      range: "melee" as const,
      properties: ["versatile", "two-handed"],
      damage: sampleVersatile,
    };
    expect(() => WeaponTypeSchema.parse(data)).toThrowError();
  });

  it("fails when neither versatile nor two-handed but invalid damage shape", () => {
    const data = {
      index: "spear",
      name: "Spear",
      description: "test description",
      range: "melee" as const,
      properties: [],
      damage: sampleVersatile,
    };
    expect(() => WeaponTypeSchema.parse(data)).toThrowError();
  });
});

describe("WeaponRange enums", () => {
  it("accepts valid ranges", () => {
    expect(WeaponRange.parse("melee")).toBe("melee");
    expect(WeaponRange.parse("ranged")).toBe("ranged");
  });

  it("rejects invalid ranges", () => {
    expect(() => WeaponRange.parse("magical")).toThrow();
  });
});

describe("WeaponTypeSchema extended coverage", () => {
  const rangedOneHanded = {
    index: "handCrossbow",
    name: "Hand Crossbow",
    description: "",
    range: "ranged" as const,
    properties: ["light"],
    damage: { oneHanded: { damageType: "piercing", notation: "1d6" } },
  };

  it("parses a simple ranged one-handed weapon", () => {
    expect(() => WeaponTypeSchema.parse(rangedOneHanded)).not.toThrow();
  });

  it("rejects ranged weapons with twoHanded damage", () => {
    const bad = { ...rangedOneHanded, damage: sampleTwoHanded };
    expect(() => WeaponTypeSchema.parse(bad)).toThrowError(
      /must specify exactly oneHanded damage/,
    );
  });

  it("rejects combining light and finesse without valid damage shape", () => {
    const bad = {
      ...sampleVersatile,
      index: "badWeapon",
      name: "Bad Weapon",
      description: "",
      range: "melee" as const,
      properties: ["light", "finesse"],
      damage: sampleVersatile,
    };
    // even though no versatile/two-handed props, damage has two fields
    expect(() => WeaponTypeSchema.parse(bad)).toThrow();
  });
});
