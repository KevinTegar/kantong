// IMPORTANT: Load dotenv FIRST before any other imports
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import alertsRouter from './routes/alerts';
import transactionsRouter from './routes/transactions';
import categoriesRouter from './routes/categories';

const app = express();
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const PORT = Number(process.env.PORT || 3001);

function parseAllowedOrigins(value: string): string[] {
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const allowedOrigins = parseAllowedOrigins(CLIENT_ORIGIN);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true,
}));

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/alerts', alertsRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/categories', categoriesRouter);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`API server listening on port ${PORT}`);
  });
}

export default app;
