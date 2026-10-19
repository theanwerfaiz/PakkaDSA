import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { canon, sha1, stepHash } from '../../../src/engine/canon';

describe('canonical JSON and SHA-1', () => {
  it('sorts object keys recursively but keeps array order', () => {
    expect(canon({ b: 1, a: { d: [3, 1], c: null } })).toBe('{"a":{"c":null,"d":[3,1]},"b":1}');
  });

  it('matches Node’s SHA-1 for ASCII, Devanagari and long input', () => {
    for (const s of [
      '',
      'abc',
      'हिन्दी ∞ — ₹',
      'x'.repeat(1000),
      'a'.repeat(55),
      'a'.repeat(56),
      'a'.repeat(64),
    ]) {
      expect(sha1(s)).toBe(createHash('sha1').update(s).digest('hex'));
    }
  });

  it('fingerprints {st, hl} to 12 hex characters regardless of key order', () => {
    expect(stepHash({ b: 2, a: 1 }, {})).toBe(stepHash({ a: 1, b: 2 }, {}));
    expect(stepHash({ a: 1 }, {})).toMatch(/^[0-9a-f]{12}$/);
  });
});
