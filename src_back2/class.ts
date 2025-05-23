import { Ability } from "./ability";
import type { ArmourCategory, WeaponCategory, WeaponType } from "./equipment";
import type { Skill } from "./skill";
import type { Spell } from "./spell";
import type { DataItem, ChooseFrom } from "./utils";

export interface Class extends DataItem {
  hitPoints: {
    initial: number;
    perLevel: number;
  },

  proficiencies: {
    skill: Skill[] | ChooseFrom<Skill, 2> | ChooseFrom<Skill, 3>;
    weapon: (WeaponType | WeaponCategory)[];
    armour: ArmourCategory[];
    savingThrows: [Ability, Ability];
    // TODO: tool proficiencies
  },

  expertise?: Skill[] | ChooseFrom<Skill, 2>;

  spellCasting?: {
    ability: Ability;
    Known: Spell[];
    prepared: Spell[];
  }

  // TODO: starting equipment

  // TODO: levelUp(n: number)
}

export interface Subclass extends Class {
}

export const fighterClass: Class = {
  index: "fighter",
  name: "Fighter",
  description: "A master of martial combat, skilled with a variety of weapons and armor.",

  hitPoints: {
    initial: 10,
    perLevel: 6,
  },

  proficiencies: {
    skill: {
      from: ["athletics", "survival", "intimidation", "perception"],
      count: 2,
    },
    weapon: ["simple", "martial"],
    armour: ["light", "medium", "heavy", "shields"],
    savingThrows: [Ability.Strength, Ability.Constitution],
  },

  // Fighters typically don't have expertise or spellcasting by default
};
