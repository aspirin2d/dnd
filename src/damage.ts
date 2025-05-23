import z from "zod/v4";
import { DiceNotation } from "./util";

export const DamageType = z.enum([
  "bludgeoning",
  "piercing",
  "slashing",
  "acid",
  "cold",
  "fire",
  "force",
  "lightning",
  "necrotic",
  "poison",
  "psychic",
  "radiant",
  "thunder",
]);

export const DamageSchema = z.object({
  damageType: DamageType,
  notation: DiceNotation,
});

export type Damage = z.infer<typeof DamageSchema>;
