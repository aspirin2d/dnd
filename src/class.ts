import type { Ability } from "./ability";
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
    skill: ChooseFrom<Skill>;
    weapon: (WeaponType | WeaponCategory)[];
    armour: (ArmourCategory | "shield")[];
    savingThrow: [Ability, Ability];
    // TODO: tool proficiencies
  },

  expertise?: ChooseFrom<Skill>;

  spellCasting?: {
    ability: Ability;
    Known: Spell[];
    prepared: Spell[];
  }

  // TODO: starting equipment
}

export interface Subclass extends Class {
}
