import { once } from 'node:events';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { startFakeSupabase, type FakeSupabase } from './fakeSupabase';

export const USER_A = 'aaaaaaaa-0000-4000-8000-000000000001';
export const USER_B = 'bbbbbbbb-0000-4000-8000-000000000002';
export const CAT_A = 'aaaaaaaa-1111-4000-8000-000000000001';
export const CAT_A_ARCHIVED = 'aaaaaaaa-1111-4000-8000-000000000002';
export const CAT_B = 'bbbbbbbb-1111-4000-8000-000000000001';
export const TX_A = 'aaaaaaaa-2222-4000-8000-000000000001';

export interface TestApi {
  baseUrl: string;
  fake: FakeSupabase;
  request: (method: string, path: string, body?: unknown, headers?: Record<string, string>) => Promise<Response>;
  close: () => Promise<void>;
}

export function defaultTables() {
  return {
    categories: [
      { id: CAT_A, user_id: USER_A, is_active: true, spending_cap: 0, name: 'Makan' },
      { id: CAT_A_ARCHIVED, user_id: USER_A, is_active: false, spending_cap: 0, name: 'Lama' },
      { id: CAT_B, user_id: USER_B, is_active: true, spending_cap: 0, name: 'Milik B' },
    ],
    transactions: [
      { id: TX_A, user_id: USER_A, type: 'income', amount: 1000, category_id: null, date: '2026-10-01' },
    ],
  };
}

/**
 * Boots the real Express app against an in-memory fake Supabase.
 * Each test file runs in its own process, so env set here is isolated per file.
 */
export async function startTestApi(env: Record<string, string> = {}): Promise<TestApi> {
  const fake = await startFakeSupabase(defaultTables());

  // Set before the app loads; dotenv never overrides variables that already exist
  Object.assign(process.env, {
    SUPABASE_URL: fake.url,
    SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
    CLIENT_ORIGIN: 'http://localhost:5173',
    ...env,
  });
  const { default: app } = await import('../src/index');

  const server: Server = app.listen(0);
  await once(server, 'listening');
  const baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api`;

  return {
    baseUrl,
    fake,
    request: (method, path, body, headers = {}) =>
      fetch(`${baseUrl}${path}`, {
        method,
        headers: { Authorization: 'Bearer token-a', 'Content-Type': 'application/json', ...headers },
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
    close: async () => {
      await new Promise((resolve) => server.close(resolve));
      await fake.close();
    },
  };
}

export async function errorCode(res: Response) {
  return ((await res.json()) as { code?: string }).code;
}
