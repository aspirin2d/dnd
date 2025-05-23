import z, { ZodNumber, type ZodType } from "zod/v4";

export const DataItem = z.object({
  index: z.string(),
  name: z.string(),
  description: z.string()
})

/**
 * Create a ChooseFrom schema where:
 * - from: an array of a Zod schema T
 * - count: must be a ZodNumber with `.int()`
 */
export const ChooseFrom = <T extends ZodType, N extends ZodNumber>(
  itemSchema: T,
  countSchema: N
) => {
  return z.object({
    from: z.array(itemSchema),
    count: countSchema,
  });
};

export const DiceNotation = z.string().regex(
  /^[1-9]\d*d[1-9]\d*(?:[+-]\d+)?$/,
  { message: "Invalid dice notation. Use format XdY or XdY+Z (e.g. 1d6+2)" }
);
