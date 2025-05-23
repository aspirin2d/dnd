import { z } from "zod/v4";
import { createTransformer, DataItem } from "./util";

export const AbilitySchema = DataItem;

import { default as SkillsData } from "../data/abilities.json";
export const AbilityList = z.array(AbilitySchema).parse(SkillsData);

export const AbilityType = z.enum([
  "strength",
  "dexterity",
  "constitution",
  "intelligence",
  "wisdom",
  "charisma",
]);

export const AbilityTransformer = createTransformer(AbilityList, "Ability");
