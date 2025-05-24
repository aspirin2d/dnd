import { describe, expect, it } from "vitest";
import { z } from "zod/v4";
import {
  chooseFrom,
  createTransformer,
  DataItem,
  uniqueIndexArray,
} from "./util";

describe("DataItem schema", () => {
  const Schema = DataItem;

  it("accepts a fully valid object", () => {
    const obj = {
      index: "foo",
      name: "Foo",
      description: "Just a foo",
    };
    const parsed = Schema.parse(obj);
    expect(parsed).toEqual(obj);
  });

  it("rejects when a required field is missing", () => {
    const bad = { index: "foo", name: "Foo" };
    expect(() => Schema.parse(bad)).toThrowError(/description/);
  });

  it("rejects unexpected extra keys when .strict() is added", () => {
    const StrictSchema = DataItem.strict();
    const extra = {
      index: "bar",
      name: "Bar",
      description: "Extra test",
      unexpected: 123,
    };
    expect(() => StrictSchema.parse(extra)).toThrow();
  });
});

describe("uniqueIndexArray", () => {
  const ItemSchema = z.object({ index: z.string() });
  const Schema = uniqueIndexArray(ItemSchema, "TestItem");

  it("accepts an array with all-unique indices", () => {
    const arr = [{ index: "a" }, { index: "b" }, { index: "c" }];
    expect(() => Schema.parse(arr)).not.toThrow();
  });

  it("throws when duplicate indices are present", () => {
    const arr = [{ index: "dup" }, { index: "dup" }];
    expect(() => Schema.parse(arr)).toThrowError(
      /Duplicate TestItem index detected: dup/,
    );
  });
});

describe("createTransformer", () => {
  const list = [
    { index: "one", foo: 1 },
    { index: "two", foo: 2 },
  ];
  const Transformer = createTransformer(list, "MyItem");

  it("transforms a known index into the full object", () => {
    const result = Transformer.parse("one");
    expect(result).toEqual({ index: "one", foo: 1 });
  });

  it("throws a custom error for an unknown index", () => {
    expect(() => Transformer.parse("three")).toThrowError(
      /MyItem three not found/,
    );
  });
});

describe("chooseFrom schema", () => {
  const NumberSchema = z.number();
  const baseSchema = chooseFrom(NumberSchema, 2);

  it("parses successfully when `from` has ≥ count unique items", () => {
    const input = { from: [10, 20, 30], count: 2 };
    const result = baseSchema.parse(input);
    expect(result).toEqual({ from: [10, 20, 30], count: 2, duplicate: 1 });
  });

  it("rejects when `from` contains duplicate primitives", () => {
    const input = { from: [1, 1, 2], count: 2 };
    const { success, error } = baseSchema.safeParse(input);
    expect(success).toBe(false);
    expect(error?.issues[0].message).toBe("Each item in `from` must be unique");
  });

  // New tests for object duplicates using JSON.stringify

  it("rejects duplicate objects in `from`", () => {
    const ObjSchema = z.object({ a: z.number() });
    const objSchema = chooseFrom(ObjSchema, 2);
    const input = { from: [{ a: 1 }, { a: 1 }, { a: 2 }], count: 2 };
    const { success, error } = objSchema.safeParse(input);
    expect(success).toBe(false);
    expect(error?.issues[0].message).toBe("Each item in `from` must be unique");
  });

  it("parses successfully when objects in `from` are unique", () => {
    const ObjSchema = z.object({ a: z.number(), b: z.string() });
    const objSchema = chooseFrom(ObjSchema, 2);
    const input = {
      from: [
        { a: 1, b: "x" },
        { a: 1, b: "y" },
      ],
      count: 2,
    };
    const result = objSchema.parse(input);
    expect(result.from).toEqual([
      { a: 1, b: "x" },
      { a: 1, b: "y" },
    ]);
  });

  it("rejects duplicate nested objects based on JSON.stringify", () => {
    const NestedSchema = z.object({ x: z.object({ y: z.number() }) });
    const nestedSchema = chooseFrom(NestedSchema, 1);
    const dup = { x: { y: 5 } };
    const input = { from: [dup, { x: { y: 5 } }], count: 1 };
    const { success, error } = nestedSchema.safeParse(input);
    expect(success).toBe(false);
    expect(error?.issues[0].message).toBe("Each item in `from` must be unique");
  });
});
