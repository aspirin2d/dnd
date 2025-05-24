import { z } from "zod/v4";

import {
  WeaponCategoryTransformer,
  WeaponTypeTransformer,
} from "./weapon-type";

import { AbilityTransformer } from "./ability";
import { SkillTransformer } from "./skill";
import {
  chooseFrom,
  createTransformer,
  DataItem,
  uniqueIndexArray,
} from "./util";

// load the class data from the JSON file
import { default as ClassesData } from "../data/classes.json";
import { ArmourCategory } from "./armour";

export const weaponProficiencyTransformer = z.string().transform((index) => {
  if (index === "simple-weapons" || index === "martial-weapons") {
    return WeaponCategoryTransformer.parse(index);
  }

  return WeaponTypeTransformer.parse(index);
});

export const ClassSchema = DataItem.extend({
  hitPoints: z.object({
    initial: z.number(),
    perLevel: z.number(),
  }),

  proficiencies: z.object({
    // bard can choose 3 skills, and rogue can choose 4
    skills: chooseFrom(SkillTransformer, z.int().min(2).max(4)),
    weapons: z.array(weaponProficiencyTransformer),
    armour: z.array(ArmourCategory),
    // every class has 2 saving throw proficiencies
    savingThrows: z.tuple([AbilityTransformer, AbilityTransformer]),
  }),
});

export type Class = z.infer<typeof ClassSchema>;

const ClassList: Class[] = uniqueIndexArray(ClassSchema, "Class").parse(
  ClassesData,
);

export const ClassTransformer = createTransformer(ClassList, "Class");
