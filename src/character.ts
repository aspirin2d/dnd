import type { DataItem } from "./utils";
import type { Class, Subclass } from "./class";
import type { Amulet, Armour, Cloak, Clothing, Handwear, Headwear, Ring, Sheild, Weapon } from "./equipment";
import type { Background, Specy } from "./origin";

export interface ClassInfo {
  level: number;
  experiences: number;

  class: Class
  subclass?: Subclass
}

export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface EquipmentSlots {
  head?: Headwear
  body?: Armour | Clothing
  back?: Cloak
  hand?: Handwear

  neck?: Amulet;
  finger1?: Ring;
  finger2?: Ring;

  mainHandMelee?: Weapon;
  offHandMelee?: Weapon | Sheild;

  mainHandRanged?: Weapon;
  offHandRanged?: Weapon;
}

export interface CharacterData extends DataItem {

}

export interface Character {
  id: string;
  name: string;

  level: number;
  experiences: number;

  class: Class
  subclass?: Subclass

  specy: Specy;
  background: Background;
}
