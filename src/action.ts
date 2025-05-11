// player can choose which attack option he want to use
export type AttackOption = "melee" | "ranged" | "thrown" | "spell";

export type AttackType =
	| "melee"
	| "ranged"
	| "offhand-melee"
	| "offhand-ranged"
	| "thrown"
	| "spell";

export interface Attack {
	type: AttackType; // melee, ranged, thrown, spell
	attackBonus: number; // attack bonus
	damage: string; // damage dice. e.g. "1d8+2"
	damageType: string; // damage type. e.g. "slashing, bludgeoning, piercing"
	critical?: string; // critical hit dice. e.g. "2d8+2"
	description?: string; // description of the attack
	attackOptions?: AttackOption[]; // attack options
	attackAction?: string; // action id. eg. "rush_attack,pierce_attack"
}
