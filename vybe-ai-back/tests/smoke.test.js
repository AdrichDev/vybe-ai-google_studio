import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

// Smoke test: confirms the node:test runner works.
// Replace with real API/route tests as SDD tasks are implemented.
describe('toolchain smoke', () => {
  it('runs node:test', () => {
    assert.equal(1 + 1, 2);
  });
});
