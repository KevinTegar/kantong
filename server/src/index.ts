// IMPORTANT: Load dotenv FIRST before any other imports
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import alertsRouter from './routes/alerts';
import transactionsRouter from './routes/transactions';
import categoriesRouter from './routes/categories';

const app = express();
const PORT = process.env.PORT || 3001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

console.log('[index] SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'NOT SET');
console.log('[index] SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');

app.use(cors({
  origin: CLIENT_ORIGIN,
  credentials: true,
}));

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/alerts', alertsRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/categories', categoriesRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});