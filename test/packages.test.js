import test from 'node:test';
import assert from 'node:assert/strict';
import { findPackage, packages } from '../server/packages.js';

test('package ids are unique and use integer GBP pence', () => {
  const all = Object.values(packages).flat();
  assert.equal(new Set(all.map(item => item.id)).size, all.length);
  for (const item of all) {
    assert.equal(Number.isInteger(item.pricePence), true);
    assert.equal(Number.isInteger(item.credits), true);
    assert.ok(item.pricePence > 0);
    assert.ok(item.credits > 0);
  }
});

test('package lookup includes its ledger role', () => {
  assert.equal(findPackage('client-essential').role, 'client');
  assert.equal(findPackage('guide-starter').role, 'guide');
  assert.equal(findPackage('missing'), undefined);
});
