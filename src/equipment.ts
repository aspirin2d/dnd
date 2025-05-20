export interface Equipment {
  index: string;
  name: string;
  description: string;

  category: string; // eg. weapon, armour...
  rarity: string; // eg. common, uncommon, rare...
  weight: number; // weight in kg
  price: number; // price in copper coins
}

export interface HeadWear extends Equipment {
  armourCategory?: string; // "light, medium, heavy", required for armour proficiencies
  specials?: string[]; // effects ids. eg. "darkvision, advantage on wisdom saving throws"
}

import { default as EquipmentData } from "../data/equipment.json";
export const EquipmentList: Equipment[] = EquipmentData;
