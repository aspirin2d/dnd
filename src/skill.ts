import type { Ability } from "./ability";

export interface Skill {
	index: string;
	name: string;
	description: string;
	ability: Ability;
}
