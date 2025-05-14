export interface Character {
	id: string;
	name: string;
	description?: string;

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
	spellCasting?: string; // ""
	spellCastingAbility?: string;
	slotCantrip?: string; // the cantrip id
	slotSpells?: string[]; // equiped spell ids
}

export function abilityScoreModifier(score: number): number {
	if (score < 1) {
		throw new Error("ability score cannot be less than 1");
	}
	return Math.floor((score - 10) / 2);
}

export function proficiencyBonus(level: number): number {
	if (level < 1) {
		throw new Error("level cannot be less than 1");
	}
	return Math.ceil(level / 4) + 1;
}

import { default as CharacterData } from "../data/character.json";
export const CharacterList = CharacterData as Character[];

// return a mock character instance
export function tav(): Character {
	return CharacterList.find((ch) => ch.id === "tav")!;
}
