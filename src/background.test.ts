import { describe, expect, it } from "vitest";
import BackgroundsData from "../data/backgrounds.json";
import { BackgroundSchema, BackgroundTransformer } from "./background";

describe("BackgroundSchema", () => {
  it("parses all entries in backgrounds.json without errors", () => {
    for (const entry of BackgroundsData) {
      expect(() => BackgroundSchema.parse(entry)).not.toThrow();
    }
  });

  it("ensures abilities.from length is >= count", () => {
    for (const entry of BackgroundsData) {
      const parsed = BackgroundSchema.parse(entry);
      expect(parsed.abilities.from.length).toBeGreaterThanOrEqual(
        parsed.abilities.count,
      );
    }
  });

  it("ensures all abilities.from items are unique", () => {
    for (const entry of BackgroundsData) {
      const parsed = BackgroundSchema.parse(entry);
      const keys = parsed.abilities.from.map((a) => a.index);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });

  it("applies the default duplicate limit", () => {
    const parsed = BackgroundSchema.parse(BackgroundsData[0]);
    expect(parsed.abilities.duplicate).toBe(2);
  });

  it("validates features as an array of strings", () => {
    for (const entry of BackgroundsData) {
      const parsed = BackgroundSchema.parse(entry);
      expect(Array.isArray(parsed.features)).toBe(true);
      parsed.features.forEach((f) => expect(typeof f).toBe("string"));
    }
  });

  it("throws when abilities.count is invalid", () => {
    const bad = {
      ...BackgroundsData[0],
      abilities: { ...BackgroundsData[0].abilities, count: 0 },
    };
    expect(() => BackgroundSchema.parse(bad)).toThrow();
  });
});

describe("BackgroundTransformer", () => {
  it("transforms a known background index into full object", () => {
    const index = BackgroundsData[0].index;
    const bg = BackgroundTransformer.parse(index);
    expect(bg).toHaveProperty("name");
    expect(bg.index).toBe(index);
  });

  it("throws for unknown background index", () => {
    expect(() => BackgroundTransformer.parse("nonexistent" as any)).toThrow();
  });
});
