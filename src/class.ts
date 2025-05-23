import { z } from "zod/v4";

import { AbilityTransformer } from "./ability";
import { SkillTransformer } from "./skill";
import { chooseFrom, createTransformer, DataItem } from "./util";

export const ClassSchema = DataItem.extend({
  hitPoints: z.object({
    initial: z.number(),
    perLevel: z.number(),
  }),

  proficiencies: z.object({
    // bard can choose 3 skills, and rogue can choose 4
    skills: chooseFrom(SkillTransformer, z.int().min(2).max(4)),
    weapons: z.array(z.string()),
    armour: z.array(z.string()),
    // every class has 2 saving throw proficiencies
    savingThrows: z.tuple([AbilityTransformer, AbilityTransformer]),
  }),
});

export type Class = z.infer<typeof ClassSchema>;

// load the class data from the JSON file
import { default as ClassesData } from "../data/classes.json";
const ClassList: Class[] = z.array(ClassSchema).parse(ClassesData);

export const ClassIndex = z.enum([
  "bard",
  "cleric",
  "druid",
  "fighter",
  "monk",
  "paladin",
  "ranger",
  "rogue",
  "sorcerer",
  "warlock",
  "wizard",
  "unknown",
]);

export const ClassTransformer = createTransformer(ClassList, "Class");
