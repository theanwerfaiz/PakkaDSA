import { describe, expect, it } from 'vitest';
import { GENERATORS } from '../../../src/engine/algorithms';
import { defaultInput } from '../../../src/engine/inputs';
import { ALGORITHM_IDS, REGISTRY, runAlgorithm } from '../../../src/engine/registry';
import { IDS, META } from './helpers';

describe('registry', () => {
  it('lists all 38 algorithms in catalog order, with matching view and input type', () => {
    expect(ALGORITHM_IDS).toEqual(IDS);
    expect(Object.keys(GENERATORS).sort()).toEqual([...IDS].sort());
    for (const id of IDS) {
      expect(REGISTRY[id].view, id).toBe(META[id].view);
      expect(REGISTRY[id].inputType, id).toBe(META[id].input.type);
      expect(defaultInput(id).type, id).toBe(META[id].input.type);
    }
  });

  it('lazy-loads each generator and adds identity ids', async () => {
    for (const id of IDS) {
      expect(await REGISTRY[id].load(), id).toBe(GENERATORS[id]);
      const steps = await runAlgorithm(id, defaultInput(id));
      const st = steps[0].st as { a?: unknown[]; ids?: number[] };
      if (Array.isArray(st.a)) expect(st.ids?.length, id).toBe(st.a.length);
    }
  });

  it('does not mutate the input it is given', async () => {
    const input = defaultInput('bubble');
    const before = JSON.stringify(input);
    await runAlgorithm('bubble', input);
    expect(JSON.stringify(input)).toBe(before);
  });

  it('rejects unknown ids', async () => {
    await expect(runAlgorithm('nope', defaultInput('bubble'))).rejects.toThrow();
  });
});
