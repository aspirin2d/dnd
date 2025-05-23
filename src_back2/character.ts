import type { DataItem } from "./utils";
import type { Class, Subclass } from "./class";
import type { Amulet, Armour, Cloak, Clothing, Handwear, Headwear, Ring, Shield, Weapon } from "./equipment";
import type { Background, Specy } from "./origin";

export interface CharacterData extends DataItem {

}

export interface Character {
  id: string;
  name: string;

  level: number;
  experiences: number;

  // class and subclass
  class: Class
  subclass?: Subclass

  // character's origin
  specy: Specy;
  background: Background;

  // ability scores
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;


  // equipment slots
  head?: Headwear
  body?: Armour | Clothing
  back?: Cloak
  hand?: Handwear
  neck?: Amulet;
  finger1?: Ring;
  finger2?: Ring;

  // melee weapon slots
  mainHandMelee?: Weapon;
  offHandMelee?: Weapon | Shield;

  // ranged weapon slots
  mainHandRanged?: Weapon;
  offHandRanged?: Weapon;
}
