import { vi } from 'vitest';

// Helper: Mock Math.random to always return a specific value
function mockRandomSequence(...values: number[]) {
  let i = 0;
  vi.spyOn(Math, "random").mockImplementation(() => values[i++ % values.length]);
}
