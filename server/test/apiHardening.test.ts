import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { errorCode, startTestApi, type TestApi } from './helpers';

let api: TestApi;

before(async () => {
  api = await startTestApi();
});

after(async () => {
  await api.close();
});

test('responses carry security headers and hide the framework', async () => {
  const res = await api.request('GET', '/health');

  assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(res.headers.get('x-powered-by'), null);
});

test('a request from a disallowed origin gets a JSON 403, not a stack trace', async () => {
  const res = await api.request('GET', '/categories', undefined, { Origin: 'https://evil.example' });

  assert.equal(res.status, 403);
  assert.equal(await errorCode(res), 'CORS_FORBIDDEN');
});

test('the allowed client origin still works', async () => {
  const res = await api.request('GET', '/categories', undefined, { Origin: 'http://localhost:5173' });

  assert.equal(res.status, 200);
  assert.equal(res.headers.get('access-control-allow-origin'), 'http://localhost:5173');
});

test('malformed JSON gets a JSON 400', async () => {
  const res = await fetch(`${api.baseUrl}/transactions`, {
    method: 'POST',
    headers: { Authorization: 'Bearer token-a', 'Content-Type': 'application/json' },
    body: '{"amount": 5000,',
  });

  assert.equal(res.status, 400);
  assert.equal(await errorCode(res), 'INVALID_JSON');
});

test('an oversized body is refused with a JSON 413', async () => {
  const res = await api.request('POST', '/transactions', { amount: 1000, type: 'income', description: 'x'.repeat(20_000) });

  assert.equal(res.status, 413);
  assert.equal(await errorCode(res), 'PAYLOAD_TOO_LARGE');
});

test('an unknown API route gets a JSON 404', async () => {
  const res = await api.request('GET', '/does-not-exist');

  assert.equal(res.status, 404);
  assert.equal(await errorCode(res), 'NOT_FOUND');
});
