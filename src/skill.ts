import { z } from "zod/v4";
import { createTransformer, DataItem, uniqueIndexArray } from "./util";
import { AbilityTransformer } from "./ability";

export const SkillSchema = DataItem.extend({
  ability: AbilityTransformer,
});

export type Skill = z.infer<typeof SkillSchema>;

import { default as SkillsData } from "../data/skills.json";
export const SkillList: Skill[] = uniqueIndexArray(SkillSchema, "Skill").parse(
  SkillsData,
);

export const SkillTransformer = createTransformer(SkillList, "Skill");
