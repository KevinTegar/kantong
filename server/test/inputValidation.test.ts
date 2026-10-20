import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { CAT_A, TX_A, errorCode, startTestApi, type TestApi } from './helpers';

let api: TestApi;

before(async () => {
  api = await startTestApi();
});

after(async () => {
  await api.close();
});

const writesTo = (table: string) => api.fake.writes.filter((write) => write.table === table).length;

async function expectRejected(res: Response, code: string) {
  assert.equal(res.status, 400);
  assert.equal(await errorCode(res), code);
}

// Income keeps the Burn Rate Engine out of these requests
const validIncome = { amount: 50000, type: 'income', description: 'Gaji', date: '2026-10-02', category_id: null };

describe('transactions', () => {
  test('a fractional amount is rejected before reaching the database', async () => {
    const before = writesTo('transactions');
    await expectRejected(await api.request('POST', '/transactions', { ...validIncome, amount: 1500.5 }), 'INVALID_AMOUNT');
    assert.equal(writesTo('transactions'), before);
  });

  test('an amount sent as text is rejected', async () => {
    await expectRejected(await api.request('POST', '/transactions', { ...validIncome, amount: '50000' }), 'INVALID_AMOUNT');
  });

  test('a date that does not exist on the calendar is rejected', async () => {
    await expectRejected(await api.request('POST', '/transactions', { ...validIncome, date: '2026-02-30' }), 'INVALID_DATE');
  });

  test('an overly long description is rejected', async () => {
    await expectRejected(
      await api.request('POST', '/transactions', { ...validIncome, description: 'x'.repeat(501) }),
      'INVALID_DESCRIPTION'
    );
  });

  test('a request without a JSON body is rejected instead of crashing', async () => {
    const res = await fetch(`${api.baseUrl}/transactions`, { method: 'POST', headers: { Authorization: 'Bearer token-a' } });
    await expectRejected(res, 'INVALID_AMOUNT');
  });

  test('a valid transaction is still accepted', async () => {
    const res = await api.request('POST', '/transactions', validIncome);
    assert.equal(res.status, 201);
  });

  test('editing with a fractional amount is rejected', async () => {
    await expectRejected(await api.request('PUT', `/transactions/${TX_A}`, { amount: 0.5 }), 'INVALID_AMOUNT');
  });

  test('an id that is not a UUID is rejected', async () => {
    await expectRejected(await api.request('PUT', '/transactions/not-a-uuid', { amount: 1000 }), 'INVALID_ID');
  });

  test('listing with month 13 is rejected', async () => {
    await expectRejected(await api.request('GET', '/transactions?month=13&year=2026'), 'INVALID_PERIOD');
  });

  test('listing with an unknown type filter is rejected', async () => {
    await expectRejected(await api.request('GET', '/transactions?month=10&year=2026&type=refund'), 'INVALID_TYPE');
  });

  test('listing with a valid period is still accepted', async () => {
    const res = await api.request('GET', '/transactions?month=10&year=2026');
    assert.equal(res.status, 200);
  });
});

describe('categories', () => {
  const validCategory = { name: 'Transport', icon: 'tag', color: '#4f8a8b', spending_cap: 800000 };

  test('a non-text name is rejected instead of crashing', async () => {
    await expectRejected(await api.request('POST', '/categories', { ...validCategory, name: 123 }), 'INVALID_NAME');
  });

  test('a color that is not a hex code is rejected', async () => {
    const before = writesTo('categories');
    await expectRejected(
      await api.request('POST', '/categories', { ...validCategory, color: 'red; background:url(x)' }),
      'INVALID_COLOR'
    );
    assert.equal(writesTo('categories'), before);
  });

  test('a fractional spending cap is rejected', async () => {
    await expectRejected(await api.request('POST', '/categories', { ...validCategory, spending_cap: 10.5 }), 'INVALID_SPENDING_CAP');
  });

  test('a valid category is still accepted', async () => {
    const res = await api.request('POST', '/categories', validCategory);
    assert.equal(res.status, 201);
  });

  test('is_active must be a boolean', async () => {
    await expectRejected(await api.request('PUT', `/categories/${CAT_A}`, { is_active: 'yes' }), 'INVALID_IS_ACTIVE');
  });

  test('an id that is not a UUID is rejected', async () => {
    await expectRejected(await api.request('DELETE', '/categories/123'), 'INVALID_ID');
  });
});

describe('alerts', () => {
  test('burn rate with month 0 is rejected', async () => {
    await expectRejected(await api.request('GET', '/alerts/burn-rate?month=0&year=2026'), 'INVALID_PERIOD');
  });

  test('marking an alert read with a non-UUID id is rejected', async () => {
    await expectRejected(await api.request('PUT', '/alerts/abc/read'), 'INVALID_ID');
  });
});
