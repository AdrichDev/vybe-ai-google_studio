import {describe, expect, it} from 'vitest';

// Smoke test: confirms the Vitest + jsdom toolchain runs.
// Replace with real feature tests as SDD tasks are implemented.
describe('toolchain smoke', () => {
  it('runs vitest', () => {
    expect(1 + 1).toBe(2);
  });

  it('has a jsdom document', () => {
    expect(typeof document).toBe('object');
    expect(document.createElement('div')).toBeTruthy();
  });
});
