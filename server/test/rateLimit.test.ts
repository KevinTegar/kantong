import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { errorCode, startTestApi, type TestApi } from './helpers';

let api: TestApi;

before(async () => {
  // Tiny limit so the test stays fast; runs in its own process, isolated from other files
  api = await startTestApi({ RATE_LIMIT_PER_MINUTE: '3' });
});

after(async () => {
  await api.close();
});

test('requests beyond the per-minute limit get a JSON 429', async () => {
  for (let i = 0; i < 3; i++) {
    assert.equal((await api.request('GET', '/categories')).status, 200);
  }

  const res = await api.request('GET', '/categories');

  assert.equal(res.status, 429);
  assert.equal(await errorCode(res), 'RATE_LIMITED');
});

test('the health check is never rate limited', async () => {
  const res = await api.request('GET', '/health');

  assert.equal(res.status, 200);
});
