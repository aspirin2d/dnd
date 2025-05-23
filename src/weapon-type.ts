import { z } from "zod/v4";
import { DataItem } from "./util";
import { DamageSchema } from "./damage";

// 1. Enumerate all allowed weapon-properties (including "versatile" and "two-handed")
export const WeaponProperty = z.enum([
  "light",
  "finesse",
  "thrown",
  "versatile",
  "heavy",
  "two-handed",
]);

export const WeaponRange = z.enum([
  "ranged",
  "melee"
])

// 2. Define each damage‐variant as a strict object
const VersatileDamageSchema = z
  .object({
    oneHanded: DamageSchema,
    twoHanded: DamageSchema,
  })
  .strict();

const OneHandedDamageSchema = z
  .object({ oneHanded: DamageSchema })
  .strict();

const TwoHandedDamageSchema = z
  .object({ twoHanded: DamageSchema })
  .strict();

// 3. Union with the *specific* (versatile) branch first
const DamageUnion = z.union([
  VersatileDamageSchema,
  OneHandedDamageSchema,
  TwoHandedDamageSchema,
]);

// 4. Main schema with two `.refine()` calls
export const WeaponTypeSchema = DataItem.extend({
  range: WeaponRange,
  properties: z.array(WeaponProperty),
  damage: DamageUnion,
}).check((ctx) => {
  const { properties, damage } = ctx.value;
  const hasVersatile = properties.includes("versatile");
  const hasTwoHandedProp = properties.includes("two-handed");
  const hasOne = "oneHanded" in damage;
  const hasTwo = "twoHanded" in damage;

  // a) versatile ⇒ must have both oneHanded & twoHanded
  if (hasVersatile && (!hasOne || !hasTwo)) {
    ctx.issues.push({
      input: damage,
      code: "custom",
      path: ["damage"],
      message: `The "versatile" property requires both oneHanded AND twoHanded damage.`,
    });
  }

  // b) two-handed ⇒ must NOT have oneHanded
  if (hasTwoHandedProp && hasOne) {
    ctx.issues.push({
      input: damage,
      code: "custom",
      path: ["damage", "oneHanded"],
      message: `Weapons with the "two-handed" property must not include oneHanded damage.`,
    });
  }

  // c) cannot combine versatile & two-handed
  if (hasVersatile && hasTwoHandedProp) {
    ctx.issues.push({
      input: properties,
      code: "custom",
      path: ["properties"],
      message: `Cannot combine "two-handed" and "versatile" properties on the same weapon.`,
    });
  }

  // d) default to one-handed: if neither versatile nor two-handed ⇒ exactly oneHanded
  if (!hasVersatile && !hasTwoHandedProp && (!hasOne || hasTwo)) {
    ctx.issues.push({
      input: damage,
      code: "custom",
      path: ["damage"],
      message: `Non-versatile, non-two-handed weapons must specify exactly oneHanded damage.`,
    });
  }
});

export const WeaponTypeIndex = z.enum([
  "battleaxe",
  "club",
  "dagger",
  "dart",
  "flail",
  "glaive",
  "greataxe",
  "greatclub",
  "greatsword",
  "halberd",
  "hand-crossbow",
  "handaxe",
  "heavy-crossbow",
  "javelin",
  "light-crossbow",
  "light-hammer",
  "longbow",
  "longsword",
  "mace",
  "maul",
  "morningstar",
  "pike",
  "quarterstaff",
  "rapier",
  "scimitar",
  "shortbow",
  "shortsword",
  "sickle",
  "sling",
  "spear",
  "trident",
  "war-pick",
  "warhammer",
]);
