export interface Equipment {
	index: string;
	name: string;
	description: string;

	category: string; // eg. weapon, armour...
	rarity: string; // eg. common, uncommon, rare...
	weight: number; // weight in kg
	price: number; // price in copper coins
}

export interface Damage {
	dice: string; // e.g. "1d8"
	type: string; // e.g. "slashing, bludgeoning, piercing"
}

export interface WeaponType extends Equipment {
	weaponCategory: string; // "simple, martial"
	weaponFamily: string; // "club, dagger, crossbow..."

	damage1H?: Damage; // damage for one handed
	damage2H?: Damage; // damage for two handed

	properties: string[]; // weapon property ids. eg. "finesse,light,thrown"
	actions: string[]; // action ids. eg. "rush_attack,pierce_attack"
}

export interface Weapon extends WeaponType {
	extraDamage?: Damage[]; // extra damage. e.g. "1d6 fire"
	specials?: string[]; // weapon special ids. e.g., "flame tongue, frost brand"
	enchantment?: number; // eg. +1, +2, +3...
}

import { default as EquipmentData } from "../data/equipment.json";
export const EquipmentList: Equipment[] = EquipmentData;
