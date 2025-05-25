import { z } from "zod/v4";
import {
  chooseFrom,
  createTransformer,
  DataItem,
  uniqueIndexArray,
} from "./util";

import { default as BackgroundsData } from "../data/backgrounds.json";
import { AbilityTransformer } from "./ability";
import { SkillTransformer } from "./skill";

export const BackgroundSchema = DataItem.extend({
  //  Increase one by 2 and another one by 1, or increase all three by 1. None of these increases can raise a score above 20.
  abilities: chooseFrom(AbilityTransformer, 3, 2),
  proficiences: {
    skills: [SkillTransformer, SkillTransformer],
    // TODO: tools
  },
  features: z.array(z.string()), // FIXME: use FeatTransformer
  // TODO equipment
});

export type Background = z.infer<typeof BackgroundSchema>;

const BackgroundList: Background[] = uniqueIndexArray(
  BackgroundSchema,
  "Background",
).parse(BackgroundsData);

export const BackgroundTransformer = createTransformer(
  BackgroundList,
  "Background",
);
