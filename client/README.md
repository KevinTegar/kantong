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

### Backend API

The frontend requires a backend API. Options:

#### Option 1: Deploy to Railway/Render
1. Deploy the `/server` folder to Railway or Render
2. Set environment variables on that platform:
   - `PORT=3001`
   - `SUPABASE_URL` = Your Supabase URL
   - `SUPABASE_SERVICE_ROLE_KEY` = Your Supabase service role key
   - `CLIENT_ORIGIN` = Your Vercel URL (e.g., `https://kantong.vercel.app`)

#### Option 2: Convert to Vercel Serverless Functions
Move server endpoints to Vercel serverless functions.

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

1. Copy `.env.example` to `.env` and fill in your values
2. Run the server:
```bash
cd server && npm run dev
```
3. Run the client:
```bash
npm run dev
```

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **State Management**: Zustand, TanStack Query
- **Charts**: Recharts
