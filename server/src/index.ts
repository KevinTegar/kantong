// IMPORTANT: Load dotenv FIRST before any other imports
import 'dotenv/config';

import express, { type ErrorRequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import alertsRouter from './routes/alerts';
import transactionsRouter from './routes/transactions';
import categoriesRouter from './routes/categories';

const app = express();
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const PORT = Number(process.env.PORT || 3001);
const RATE_LIMIT_PER_MINUTE = Number(process.env.RATE_LIMIT_PER_MINUTE || 120);

function parseAllowedOrigins(value: string): string[] {
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const allowedOrigins = parseAllowedOrigins(CLIENT_ORIGIN);

class CorsOriginError extends Error {}

// On Vercel requests arrive through one proxy hop; trust it so rate limiting sees the real client IP
app.set('trust proxy', process.env.VERCEL ? 1 : false);

// The client lives on another origin, so allow cross-origin reads of API responses
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new CorsOriginError(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true,
}));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Batasi jumlah request per IP supaya API tidak mudah dibanjiri (health check dikecualikan)
app.use('/api', rateLimit({
  windowMs: 60_000,
  limit: RATE_LIMIT_PER_MINUTE,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({ error: 'Too many requests, please slow down', code: 'RATE_LIMITED' });
  },
}));

app.use(express.json({ limit: '10kb' }));

app.use('/api/alerts', alertsRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/categories', categoriesRouter);

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Endpoint not found', code: 'NOT_FOUND' });
});

// Every error leaves as JSON in the standard { error, code } shape, never as an HTML stack trace
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof CorsOriginError) {
    res.status(403).json({ error: 'Origin not allowed', code: 'CORS_FORBIDDEN' });
    return;
  }

  if (err?.type === 'entity.parse.failed') {
    res.status(400).json({ error: 'Request body is not valid JSON', code: 'INVALID_JSON' });
    return;
  }

  if (err?.type === 'entity.too.large') {
    res.status(413).json({ error: 'Request body is too large', code: 'PAYLOAD_TOO_LARGE' });
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
};

app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`API server listening on port ${PORT}`);
  });
}

export default app;
