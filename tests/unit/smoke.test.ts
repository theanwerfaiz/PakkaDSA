import { describe, expect, it } from 'vitest';

describe('toolchain', () => {
  it('runs TypeScript tests under Node', () => {
    expect([3, 1, 2].sort((a, b) => a - b)).toEqual([1, 2, 3]);
  });
});
