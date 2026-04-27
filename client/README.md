# Kantong - React + TypeScript + Vite

Aplikasi pencatatan keuangan pribadi dengan fitur burn rate tracking.

## Deploy to Vercel

### Prerequisites
1. Vercel account
2. Supabase project

### Environment Variables

Set these in Vercel dashboard (Project Settings > Environment Variables):

| Name | Value |
|-------|-------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |

### Frontend project

Deploy the `/client` folder as its own Vercel project.

This repo includes `client/vercel.json` so React routes like `/dashboard` are rewritten to `index.html` and reloads do not 404.

Set this environment variable in the frontend project:

| Name | Value |
|-------|-------|
| `VITE_API_BASE_URL` | Your backend Vercel URL, for example `https://kantong-api.vercel.app` |

### Backend project

Deploy the `/server` folder as its own Vercel project.

This repo includes a catch-all Vercel function entrypoint at `server/api/[...path].ts` so routes like `/api/health` and `/api/transactions` work correctly in production.

Set these environment variables in the backend project:

| Name | Value |
|-------|-------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
| `CLIENT_ORIGIN` | Your frontend Vercel URL, or a comma-separated list of allowed origins |

### Deployment Steps

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. For production:
```bash
vercel --prod
```

## Local Development

1. Copy `client/.env.example` to `client/.env` and `server/.env.example` to `server/.env`
2. Run the server:
```bash
cd server && npm run dev
```
3. Run the client:
```bash
cd client && npm run dev
```

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **State Management**: Zustand, TanStack Query
- **Charts**: Recharts
