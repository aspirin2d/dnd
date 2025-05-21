import type { Ability } from "./ability";
import type { DataItem } from "./utils";

export interface Skill extends DataItem {
  ability: Ability; // ability id
}
