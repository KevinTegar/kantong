import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin, isSupabaseConfigured } from '../lib/supabase';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!isSupabaseConfigured()) {
      res.status(503).json({
        error: 'Supabase is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env',
        code: 'NOT_CONFIGURED'
      });
      return;
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authorization header missing or invalid', code: 'UNAUTHORIZED' });
      return;
    }

    const token = authHeader.substring(7);

    const { data: { user }, error } = await supabaseAdmin().auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ error: 'Invalid or expired token', code: 'INVALID_TOKEN' });
      return;
    }

    req.userId = user.id;
    next();
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
}