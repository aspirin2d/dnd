import { z } from "zod/v4";
import { createTransformer, DataItem, uniqueIndexArray } from "./util";

import { default as SpeciesData } from "../data/species.json";

export const CreatureSize = z.enum(["tiny", "small", "medium", "large"]);
export const CreatureType = z.enum([
  "humanoid",
  "beast",
  "undead",
  "construct",
  "dragon",
  "fey",
  "fiend",
  "celestial",
]); // TODO add more types

export const SpecySchema = DataItem.extend({
  type: CreatureType, // TODO maybe add more types
  speed: z.int().min(25).max(40),
  size: CreatureSize,
  features: z.array(z.string()), // FIXME transformer for race features
  // TODO body type
});

export type Specy = z.infer<typeof SpecySchema>;

const SpecyList: Specy[] = uniqueIndexArray(SpecySchema, "Specy").parse(
  SpeciesData,
);

export const SpecyTransformer = createTransformer(SpecyList, "Specy");
