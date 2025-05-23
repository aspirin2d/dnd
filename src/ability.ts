import { z } from "zod/v4";
import { createTransformer, DataItem, uniqueIndexArray } from "./util";

export const AbilitySchema = DataItem;

import { default as AbilitiesData } from "../data/abilities.json";
export const AbilityList = uniqueIndexArray(AbilitySchema, "Ability").parse(
  AbilitiesData,
);

export const AbilityType = z.enum([
  "strength",
  "dexterity",
  "constitution",
  "intelligence",
  "wisdom",
  "charisma",
]);

export const AbilityTransformer = createTransformer(AbilityList, "Ability");
