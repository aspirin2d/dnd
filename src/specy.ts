import { z } from "zod/v4";
import { createTransformer, DataItem, uniqueIndexArray } from "./util";

import { default as SpeciesData } from "../data/species.json";

export const CreatureSize = z.enum(["tiny", "small", "medium", "large"]);

export const SpecySchema = DataItem.extend({
  creatureType: z.literal("humanoid"), // TODO: maybe add more types
  baseSpeed: z.int().min(0).max(30),
  size: CreatureSize,
  features: z.array(z.string()), // FIXME: transform to Trait
});

export type Specy = z.infer<typeof SpecySchema>;

const SpecyList: Specy[] = uniqueIndexArray(SpecySchema, "Specy").parse(
  SpeciesData,
);

export const SpecyTransformer = createTransformer(SpecyList, "Specy");
