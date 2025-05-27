import { describe, it, expect } from "vitest";
import { default as SpeciesData } from "../data/species.json";
import { SpecySchema, SpecyTransformer } from "./specy";

describe("SpecySchema", () => {
  it("parses all species.json entries correctly", () => {
    for (const entry of SpeciesData) {
      expect(() => SpecySchema.parse(entry)).not.toThrow();
    }
  });

  it("rejects invalid creatureType", () => {
    const bad = structuredClone(SpeciesData[0]);
    // @ts-ignore
    bad.type = "bad";
    expect(() => SpecySchema.parse(bad)).toThrow();
  });

  it("rejects invalid baseSpeed values", () => {
    const low = structuredClone(SpeciesData[0]);
    (low as any).speed = -1;
    expect(() => SpecySchema.parse(low)).toThrow();
  });

  it("rejects invalid size", () => {
    const bad = structuredClone(SpeciesData[0]);
    // @ts-ignore
    bad.size = "gigantic";
    expect(() => SpecySchema.parse(bad)).toThrow();
  });

  it("rejects missing features", () => {
    const bad = structuredClone(SpeciesData[0]);
    // @ts-ignore
    delete bad.features;
    expect(() => SpecySchema.parse(bad)).toThrow();
  });
});

describe("ClassTransformer (Specy Transformer)", () => {
  it("transforms a known specy index into a full object", () => {
    const index = SpeciesData[0].index;
    const specy = SpecyTransformer.parse(index);
    expect(specy).toHaveProperty("index", index);
  });

  it("throws for unknown specy index", () => {
    expect(() => SpecyTransformer.parse("unknown-specy" as any)).toThrow(
      /Specy unknown-specy not found/,
    );
  });
});
