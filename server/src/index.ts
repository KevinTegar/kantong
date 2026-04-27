// IMPORTANT: Load dotenv FIRST before any other imports
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import alertsRouter from './routes/alerts';
import transactionsRouter from './routes/transactions';
import categoriesRouter from './routes/categories';

const app = express();
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

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

// Export for Vercel serverless
module.exports = app;