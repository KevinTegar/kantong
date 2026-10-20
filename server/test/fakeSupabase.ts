import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import type { AddressInfo } from 'node:net';

type Row = Record<string, unknown>;

export interface FakeSupabase {
  url: string;
  tables: Record<string, Row[]>;
  writes: { method: string; table: string; body: unknown }[];
  close: () => Promise<void>;
}

// Bearer token -> user id, as returned by GET /auth/v1/user
const USERS_BY_TOKEN: Record<string, string> = {
  'token-a': 'aaaaaaaa-0000-4000-8000-000000000001',
  'token-b': 'bbbbbbbb-0000-4000-8000-000000000002',
};

async function readJson(req: http.IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const text = Buffer.concat(chunks).toString('utf8');
  return text ? JSON.parse(text) : undefined;
}

/**
 * Minimal in-memory stand-in for Supabase Auth + PostgREST, enough for the controllers'
 * queries: `eq.` filters, single-object responses, insert and update.
 */
export async function startFakeSupabase(tables: Record<string, Row[]>): Promise<FakeSupabase> {
  const writes: FakeSupabase['writes'] = [];

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const body = await readJson(req);
    const send = (status: number, data: unknown) => {
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    };

    if (url.pathname === '/auth/v1/user') {
      const token = (req.headers.authorization ?? '').replace('Bearer ', '');
      const id = USERS_BY_TOKEN[token];
      send(id ? 200 : 401, id ? { id, aud: 'authenticated', role: 'authenticated' } : { message: 'invalid token' });
      return;
    }

    const match = url.pathname.match(/^\/rest\/v1\/(\w+)$/);
    if (!match) {
      send(404, { message: 'not found' });
      return;
    }

    const table = match[1];
    const rows = tables[table] ?? (tables[table] = []);
    const filters = [...url.searchParams]
      .filter(([, value]) => value.startsWith('eq.'))
      .map(([key, value]) => [key, value.slice(3)] as const);
    const matching = rows.filter((row) => filters.every(([key, value]) => String(row[key]) === value));

    const respond = (list: Row[], status = 200) => {
      if (!String(req.headers.accept ?? '').includes('vnd.pgrst.object')) {
        send(status, list);
      } else if (list.length === 1) {
        send(status, list[0]);
      } else {
        send(406, { code: 'PGRST116', message: 'JSON object requested, multiple (or no) rows returned', details: '', hint: '' });
      }
    };

    if (req.method === 'GET') {
      respond(matching);
    } else if (req.method === 'POST') {
      const row = { id: randomUUID(), ...(body as Row) };
      rows.push(row);
      writes.push({ method: 'POST', table, body });
      respond([row], 201);
    } else if (req.method === 'PATCH') {
      matching.forEach((row) => Object.assign(row, body));
      writes.push({ method: 'PATCH', table, body });
      respond(matching);
    } else {
      send(405, { message: 'method not supported by fake' });
    }
  });

  server.listen(0);
  await once(server, 'listening');
  const { port } = server.address() as AddressInfo;

  return {
    url: `http://127.0.0.1:${port}`,
    tables,
    writes,
    close: () => new Promise((resolve) => server.close(() => resolve())),
  };
}
