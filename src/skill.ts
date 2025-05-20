import type { AbilityScoreType } from "./ability";

export interface Skill {
  index: string;
  name: string;
  description: string;
  ability: AbilityScoreType;
}
