import z from "zod/v4"
import { DataItem } from "./util";

export const AbilitySchema = DataItem

import { default as SkillsData } from "../data/abilities.json";
export const AbilityList = z.array(AbilitySchema).parse(SkillsData);

export const AbilityIndex = z.enum(["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"])

export const AbilityTransformer = AbilityIndex.transform((index) => {
  const abilityInstance = AbilityList.find((c) => c.index === index);
  if (!abilityInstance) {
    throw new Error(`Ability ${index} not found`);
  }
  return abilityInstance
})
