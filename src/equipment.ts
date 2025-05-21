export interface Equipment {
  index: string;
  name: string;
  description: string;

  category: string; // eg. weapon, armour...
  rarity: string; // eg. common, uncommon, rare...
  weight: number; // weight in kg
  price: number; // price in copper coins

  specials?: string[]; // effects ids. eg. "darkvision, advantage on wisdom saving throws"
}

export type ArmourCategory = "light" | "medium" | "heavy";

export interface Headwear extends Equipment {
  category: "headwear";
  armourCategory?: ArmourCategory; // required for armour proficiencies
}

export interface Armour extends Equipment {
  category: "armour";
  armourCategory?: ArmourCategory; // required for armour proficiencies
  armourClass: number;
  stealthDisavantage: boolean;
}


export interface Sheild extends Equipment {
  category: "shield";
  armourClassBonus: number;
}

export interface Clothing extends Equipment {
  category: "clothing";
}

export interface Cloak extends Equipment {
  category: "cloak";
}

export interface Ring extends Equipment {
  category: "ring";
}

export interface Amulet extends Equipment {
  category: "amulet";
}

export interface Handwear extends Equipment {
  category: "handwear";
  armourCategory?: ArmourCategory; // required for armour proficiencies
}

export type WeaponCategory = "simple" | "martial";
export type WeaponRange = "melee" | "ranged";

export type WeaponType =
  | "battleaxe"
  | "club"
  | "dagger"
  | "dart"
  | "flail"
  | "glaive"
  | "greataxe"
  | "greatclub"
  | "greatsword"
  | "halberd"
  | "hand crossbow"
  | "handaxe"
  | "heavy crossbow"
  | "javelin"
  | "light crossbow"
  | "light hammer"
  | "longbow"
  | "longsword"
  | "mace"
  | "maul"
  | "morningstar"
  | "pike"
  | "quarterstaff"
  | "rapier"
  | "scimitar"
  | "shortbow"
  | "shortsword"
  | "sickle"
  | "sling"
  | "spear"
  | "trident"
  | "war pick"
  | "warhammer";

export type WeaponProperty =
  | "finesse"
  | "light"
  | "thrown"

export type WeapongHanding = "one-handed" | "two-handed" | "versatile";

export interface Weapon extends Equipment {
  category: "weapon";
  weaponCategory: WeaponCategory;

  type: WeaponType;
  range: WeaponRange;
  handing: WeapongHanding;

  properties: WeaponProperty[]; // eg. "finesse, light, thrown"
}
