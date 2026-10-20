import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { CAT_A, CAT_A_ARCHIVED, CAT_B, TX_A, errorCode, startTestApi, type TestApi } from './helpers';

let api: TestApi;

before(async () => {
  api = await startTestApi();
});

after(async () => {
  await api.close();
});

const transactionWrites = () => api.fake.writes.filter((write) => write.table === 'transactions');

// Income keeps the Burn Rate Engine out of these requests
const newIncome = { amount: 50000, type: 'income', description: 'Test', date: '2026-10-02' };

test('creating a transaction with another user\'s category is rejected', async () => {
  const writesBefore = transactionWrites().length;

  const res = await api.request('POST', '/transactions', { ...newIncome, category_id: CAT_B });

  assert.equal(res.status, 400);
  assert.equal(await errorCode(res), 'INVALID_CATEGORY');
  assert.equal(transactionWrites().length, writesBefore, 'no insert may reach the database');
});

test('creating a transaction with the user\'s own category succeeds', async () => {
  const res = await api.request('POST', '/transactions', { ...newIncome, category_id: CAT_A });

  assert.equal(res.status, 201);
});

test('creating a transaction without a category succeeds', async () => {
  const res = await api.request('POST', '/transactions', { ...newIncome, category_id: null });

  assert.equal(res.status, 201);
});

test('moving a transaction to another user\'s category is rejected', async () => {
  const writesBefore = transactionWrites().length;

  const res = await api.request('PUT', `/transactions/${TX_A}`, { amount: 2000, category_id: CAT_B });

  assert.equal(res.status, 400);
  assert.equal(await errorCode(res), 'INVALID_CATEGORY');
  assert.equal(transactionWrites().length, writesBefore, 'no update may reach the database');
});

test('editing a transaction that keeps the user\'s archived category still works', async () => {
  const res = await api.request('PUT', `/transactions/${TX_A}`, { amount: 3000, category_id: CAT_A_ARCHIVED });

  assert.equal(res.status, 200);
});
