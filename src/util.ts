import { z, type ZodInt, type ZodType } from "zod/v4";

export const DataItem = z.object({
  index: z.string(),
  name: z.string(),
  description: z.string(),
});

export function chooseFrom<T extends ZodType>(
  itemSchema: T,
  countSchema: ZodInt | number,
  duplicate: number = 1, // max duplicates item user can choose
) {
  const countArg =
    typeof countSchema === "number" ? z.literal(countSchema) : countSchema;
  return (
    z
      .object({
        from: z.array(itemSchema),
        count: countArg,
        duplicate: z.int().optional().default(duplicate),
      })
      .refine(
        (val) => {
          const { from, count } = val;
          return from.length >= count;
        },
        { message: "Not enough items to choose from", path: ["from"] },
      )
      // ensure each element is only present once (using JSON.stringify keys)
      .refine(
        (val) => {
          const seen = new Set<string>();
          for (const item of val.from) {
            const key = JSON.stringify(item);
            if (seen.has(key)) {
              return false;
            }
            seen.add(key);
          }
          return true;
        },
        {
          message: "Each item in `from` must be unique",
          path: ["from"],
        },
      )
  );
}

export const DiceNotation = z
  .string()
  .regex(/^[1-9]\d*d[1-9]\d*(?:[+-]\d+)?$/, {
    message: "Invalid dice notation. Use format XdY or XdY+Z (e.g. 1d6+2)",
  });

export function uniqueIndexArray<T extends { index: string }>(
  itemSchema: ZodType<T>,
  name: string,
) {
  return z.array(itemSchema).check((ctx) => {
    const arr = ctx.value;
    const counts = arr.reduce<Record<string, number>>((acc, item) => {
      acc[item.index] = (acc[item.index] || 0) + 1;
      return acc;
    }, {});
    const dups = Object.entries(counts)
      .filter(([, c]) => c > 1)
      .map(([idx]) => idx);

    if (dups.length) {
      ctx.issues.push({
        code: "custom",
        input: arr,
        message: `Duplicate ${name} index detected: ${dups.join(", ")}`,
        path: ["index"], // you could point at ["<field>"] if you want
      });
    }
  });
}

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
