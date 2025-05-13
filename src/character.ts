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
	slotCantrip?: string; // the cantrip id
	slotSpells?: string[]; // equiped spell ids
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

// return an empty character instance
export function tav(): Character {
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
  }
}
