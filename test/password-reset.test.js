import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildPasswordResetLink,
  createPasswordResetToken,
  hashPasswordResetToken,
  sendPasswordResetEmail,
} from '../server/passwordReset.js';

test('password reset tokens are random URL-safe secrets', () => {
  const first = createPasswordResetToken();
  const second = createPasswordResetToken();
  assert.ok(first.length >= 40);
  assert.match(first, /^[A-Za-z0-9_-]+$/);
  assert.notEqual(first, second);
});

test('password reset token hashes do not expose the raw token', () => {
  const token = 'sample-reset-token';
  const hash = hashPasswordResetToken(token);
  assert.equal(hash, hashPasswordResetToken(token));
  assert.notEqual(hash, token);
  assert.equal(hash.length, 64);
});

test('password reset links carry the reset token as a query parameter', () => {
  const link = new URL(buildPasswordResetLink('abc123'));
  assert.equal(link.searchParams.get('reset_password'), 'abc123');
  assert.equal(link.hash, '#join');
});

test('password reset email reports missing provider without throwing', async () => {
  const result = await sendPasswordResetEmail('person@example.com', 'https://example.com/reset');
  assert.equal(result.sent, false);
  assert.equal(result.reason, 'missing_resend_api_key');
});
