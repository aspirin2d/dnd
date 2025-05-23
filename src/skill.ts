import { z } from "zod/v4";
import { DataItem } from "./util";
import { AbilityTransformer } from "./ability";

export const SkillSchema = DataItem.extend({
  ability: AbilityTransformer,
})

export type Skill = z.infer<typeof SkillSchema>;

import { default as SkillsData } from "../data/skills.json";
export const SkillList: Skill[] = z.array(SkillSchema).parse(SkillsData);

export const SkillIndex = z.enum(["athletics", "acrobatics", "sleight-of-hand", "stealth", "arcana", "history", "investigation", "nature", "religion", "animal-handling", "insight", "medicine", "perception", "survival", "deception", "intimidation", "performance", "persuasion"])

export const SkillTransformer = SkillIndex.transform((index) => {
  const skillInstance: Skill | undefined = SkillList.find((c) => c.index === index);
  if (!skillInstance) {
    throw new Error(`Skill ${index} not found`);
  }
  return skillInstance
})
