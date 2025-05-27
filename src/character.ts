import { z } from "zod/v4";
import { ClassTransformer } from "./class";
import { SpecyTransformer } from "./specy";
import { AbilityScores } from "./ability";
import { BackgroundTransformer } from "./background";

export const Character = z.object({
  id: z.string(),
  name: z.string(),

  level: z.int().min(1).max(20),
  experiences: z.int().min(1),

  // characters' origin
  specy: SpecyTransformer,
  background: BackgroundTransformer,
  // TODO add alignment

  // character's starting class
  class: ClassTransformer,

  // character's ability scores
  abilityScores: AbilityScores,

  // TODO character's appearance
  // TODO identity: "male", "female", "other"
  // TODO body type: choose from specy body types
});

export type Character = z.infer<typeof Character>;
