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

// @see: https://roll20.net/compendium/dnd5e/Rules:Step%203%20-%20Determine%20Ability%20Scores?expansion=32231
export const AbilityScores = z.object({
  strength: z.int().min(3).max(30),
  dexterity: z.int().min(3).max(30),
  constitution: z.int().min(3).max(30),
  intelligence: z.int().min(3).max(30),
  wisdom: z.int().min(3).max(30),
  charisma: z.int().min(3).max(30),
});

export const AbilityTransformer = createTransformer(AbilityList, "Ability");
