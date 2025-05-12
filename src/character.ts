import type { AttackOption } from "./action";
import {
	RollDice,
	type DamageRollResult,
	type Modifier,
	type RollResult,
} from "./dice-roll";
import { EquipmentList, type Armour, type Weapon } from "./equipment";

export type AbilityScoreType =
	| "strength"
	| "dexterity"
	| "constitution"
	| "intelligence"
	| "wisdom"
	| "charisma";

export interface DataSource {
	index: string;
	name: string;
	description: string;
}

export interface AbilityScore extends DataSource {
	skills: string[]; // skill ids
}

export interface Skill extends DataSource {
	abilityScore: AbilityScoreType; // ability-score id
}

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
	// expertise skills
	expSkills: string[]; // expertise skill ids
	// ability-score saving throws
	savingThrows: string[]; // ability-score ids

	// equipment slots
	slotHead?: string; // equipped headwear id
	slotCloak?: string; // equipped cloak id
	slotBody?: string; // equipped body armour id
	slotHand?: string; // equipped handwear id
	slotFoot?: string; // equipped footwear id
	slotMeleeLeft?: string; // equipped weapon id
	slotMeleeRight?: string; // equipped weapon id or shield id
	slotRangedLeft?: string; // equipped weapon id
	slotRangedRight?: string; // equipped weapon id or shield id
	slotRing1?: string; // equipped ring id
	slotRing2?: string; // equipped ring id
	slotAmulet?: string; // equipped amulet id

	// spell casting
	cantrip?: string; // the cantrip id
	spells?: string[]; // equiped spell ids
}

export function EmptyCharacter(): Character {
	return {
		id: "tav",
		name: "Tav",

		class: "fighter",
		specy: "human",
		background: "soldier",

		level: 1,

		strength: 10,
		dexterity: 10,
		constitution: 10,
		intelligence: 10,
		wisdom: 10,
		charisma: 10,

		proWeapons: [],
		proArmour: [],
		proSkills: [],
		expSkills: [],
		savingThrows: [],
	};
}

export function AbilityScoreModifier(score: number): number {
	if (score < 1) {
		throw new Error("ability score cannot be less than 1");
	}
	return Math.floor((score - 10) / 2);
}

export function ProficiencyBonus(level: number): number {
	if (level < 1) {
		throw new Error("level cannot be less than 1");
	}
	return Math.ceil(level / 4) + 1;
}

export function AttackOptions(char: Character): AttackOption[] {
	const options = [] as AttackOption[];
	if (char.cantrip && char.spells) {
		options.push("spell");
	}

	if (char.slotMeleeLeft) {
		options.push("melee");
		const weapon = EquipmentList.find(
			(e) => e.index === char.slotMeleeLeft,
		) as Weapon;
		if (!weapon) {
			throw new Error("weapon not found: " + char.slotMeleeLeft);
		}
		if (weapon.properties.includes("thrown")) {
			options.push("thrown");
		}
	}

	if (char.slotRangedLeft) {
		options.push("ranged");
	}

	return options;
}

export interface ArmourClass {
	base: number;
	total: number;
	modifiers: Modifier[];
}
export function GetArmourClass(char: Character): ArmourClass {
	const unarmoured = char.slotBody === undefined;
	if (unarmoured) {
	}
	const armour = EquipmentList.find((e) => e.index === char.slotBody) as Armour;
	if (!armour) {
		throw new Error("armour not found: " + char.slotBody);
	}
	const base = armour.armourClass;
	let total = 0;
	const modifiers = [] as Modifier[];

	// add dexterity modifier
	const dexModifier = AbilityScoreModifier(char.dexterity);
	if (armour.armourCategory === "light") {
		total = base + dexModifier;
		modifiers.push({
			type: "ability modifier",
			index: "dexterity",
			value: dexModifier,
		});
	} else if (armour.armourCategory === "medium") {
		// medium armour cap dex modifier to 2
		total = base + Math.min(dexModifier, 2);
		modifiers.push({
			type: "ability modifier",
			index: "dexterity",
			value: dexModifier,
		});
	} else if (armour.armourCategory === "heavy") {
		// heavy armor doesn't add dex modifier
	}

	// TODO: implement more modifiers

	return {
		base,
		total,
		modifiers,
	};
}

// Attacks
export interface AttackResult {
	AttackRoll?: RollResult;
	DamageRoll?: DamageRollResult;
	SavingThrow?: RollResult;
}

export interface Attack {
	(from: Character, to: Character): AttackResult;
}

export const MainHandMeleeAttack: Attack = function (
	from: Character,
	to: Character,
): AttackResult {
	const weapon = EquipmentList.find(
		(e) => e.index === from.slotMeleeLeft,
	) as Weapon;
	if (!weapon) {
		throw new Error("weapon not found: " + from.slotMeleeLeft);
	}

	if (!weapon.damage1H) {
		throw new Error("weapon has no damage1H: " + from.slotMeleeLeft);
	}

	// if the weapon has finesse, use the higher of strength or dexterity
	// calculate ability score modifier
	const finesse = weapon.properties.includes("finesse");
	const abilityScore = finesse
		? Math.max(from.strength, from.dexterity)
		: from.strength;
	const abilityModifier = AbilityScoreModifier(abilityScore);

	// calculate profinciency bonus
	const proficient = from.proWeapons.includes(weapon.index);
	const proficiencyBonus = ProficiencyBonus(from.level);

	// get target's armour class
	const { total: armourClass } = GetArmourClass(to);

	// TODO: calculate advantage/disavantage
	// SEE: https://www.reddit.com/r/BaldursGate3/comments/ja08hz/a_guide_to_advantage_and_disadvantage_in_bg3/
	let rollType = "normal";
	// now, make the attack roll

	return {};
};
