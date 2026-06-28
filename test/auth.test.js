import assert from 'node:assert/strict';
import test from 'node:test';
import {
  REMEMBERED_AUTH_TOKEN_MS,
  SESSION_AUTH_TOKEN_MS,
  readToken,
  signToken,
} from '../server/auth.js';

test('auth tokens can be issued with session and remembered durations', () => {
  const now = Date.now();
  const sessionPayload = readToken(signToken('user-session', SESSION_AUTH_TOKEN_MS));
  const rememberedPayload = readToken(signToken('user-remembered', REMEMBERED_AUTH_TOKEN_MS));

  assert.equal(sessionPayload.sub, 'user-session');
  assert.equal(rememberedPayload.sub, 'user-remembered');
  assert.ok(sessionPayload.exp <= now + SESSION_AUTH_TOKEN_MS + 1000);
  assert.ok(rememberedPayload.exp >= now + REMEMBERED_AUTH_TOKEN_MS - 1000);
});
