import type { Ability } from "./ability";
import type { Feat } from "./feats";
import type { Skill } from "./skill";
import type { ChooseFrom, DataItem } from "./utils";

export type CreatureType = "aberration" | "beast" | "celestial" | "construct" | "dragon" | "elemental" | "fey" | "fiend" | "giant" | "humanoid" | "monstrosity" | "ooze" | "plant" | "undead";

export type Size = "tiny" | "small" | "medium" | "large" | "huge" | "gargantuan";

//@see https://roll20.net/compendium/dnd5e/Rules:Origin%20Components?expansion=32231
export interface Specy extends DataItem {
  // Increase one by 2 and another one by 1, or increase all three by 1
  abilityScores: [Ability, Ability, Ability] | [ChooseFrom<Ability>, ChooseFrom<Ability>, ChooseFrom<Ability>];

  // creature type tag
  creatureType: CreatureType;

  // creature size tag
  size: Size;

  // speed
  speed: number;

  // Special traits
  traits: Feat[]
}

//@see https://roll20.net/compendium/dnd5e/Rules:Origin%20Components?expansion=32231
export interface Background extends DataItem {
  proficiencies: {
    skill: [Skill, Skill];
    // TODO: tool proficiencies
  },
}
