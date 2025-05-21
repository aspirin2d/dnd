import type { Feat } from "./feats";
import type { Skill } from "./skill";
import type { DataItem } from "./utils";

export type CreatureType = "aberration" | "beast" | "celestial" | "construct" | "dragon" | "elemental" | "fey" | "fiend" | "giant" | "humanoid" | "monstrosity" | "ooze" | "plant" | "undead";

export type Size = "tiny" | "small" | "medium" | "large" | "huge" | "gargantuan";

export interface Specy extends DataItem {
  creatureType: CreatureType;
  size: Size;

  proficiencies: {
    skill: [Skill, Skill];
    // TODO: tool proficiencies
  },

  // TODO: speed
  speed: number;

  // TODO: Special traits
  traits: Feat[]
}

export interface Background extends DataItem {
  proficiencies: {
    skill: [Skill, Skill];
    // TODO: tool proficiencies
  },
}

export interface Origin {
  specy: Specy;
  background: Background;

// TODO: Alignment
}
