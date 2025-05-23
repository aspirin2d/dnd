import { z, type ZodInt, type ZodType } from "zod/v4";

export const DataItem = z.object({
  index: z.string(),
  name: z.string(),
  description: z.string(),
});

export function chooseFrom<T extends ZodType>(
  itemSchema: T,
  countSchema: ZodInt,
) {
  return z
    .object({
      from: z.array(itemSchema),
      count: countSchema,
    })
    .refine(
      (val) => {
        const { from, count } = val;
        return from.length >= count;
      },
      { message: "Not enough items to choose from", path: ["from"] },
    );
}

export const DiceNotation = z
  .string()
  .regex(/^[1-9]\d*d[1-9]\d*(?:[+-]\d+)?$/, {
    message: "Invalid dice notation. Use format XdY or XdY+Z (e.g. 1d6+2)",
  });

export function createTransformer<T extends { index: string }>(
  list: T[],
  name: string,
) {
  return z.string().transform((idx, ctx) => {
    const item = list.find((i) => i.index === idx);
    if (!item) {
      ctx.issues.push({
        code: "custom",
        input: idx,
        message: `${name} ${idx} not found`,
      });
      return z.NEVER;
    }
    return item;
  });
}
