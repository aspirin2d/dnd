export interface DataSource {
	id: string;
	name: string;
	description: string;
}

export interface AbilityScore extends DataSource {
	skills: string[]; // skill ids
}

export type AbilityScoreId =
	| "strength"
	| "dexterity"
	| "constitution"
	| "intelligence"
	| "wisdom"
	| "charisma";

export interface Skill extends DataSource {
	abilityScore: AbilityScoreId; // ability-score id
}

export interface WeaponType extends DataSource {
	damage1H: string; // e.g., "1d8+2"
	damage2H: string; // e.g., "1d10+2"
	damageType: string; // damaga type ids. eg. "slashing,bludgeoning,piercing"
	range: number; // range in meters
	properties: string[]; // weapon property ids. eg. "finesse,light,thrown"
	actions: string[]; // action ids. eg. "rush_attack,pierce_attack"
}

export interface Weapon extends DataSource {
	type: string; // weapon type id
	enchantment: number; // eg. +1, +2, +3...
	extraDamage: string; // e.g., "1d4"
	extraDamageType: string; // e.g., "fire,ice,thunder"
	special: string[]; // weapon special ids. e.g., "flame tongue, frost brand"
}

export interface ArmourType extends DataSource {} // "light,medium,heavy,shiled"

export interface Character {
	id: string;
	name: string;

	class: string; // class id
	subclass?: string; // subclass id

	specy: string; // specy id
	subspecy?: string; // sub specy id
	background: string; // background id
	alignment?: string; // alignment id

	level: number;

	// ability-scores
	strength: number;
	dexterity: number;
	constitution: number;
	intelligence: number;
	wisdom: number;
	charisma: number;

	// proficiencies
	proWeapons: string[]; // weapon type ids
	proArmour: string[]; // armour type ids

	proSkills: string[]; // skill ids
	expSkills: string[]; // expertise skill ids

	savingThrows: string[]; // ability-score ids
	spells: string[]; // spell ids
}
