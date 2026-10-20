import { Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import { calculateBurnRate, saveAlerts } from '../lib/burnRateEngine';
import type { AuthenticatedRequest } from '../middleware/auth';
import { isUuid, parsePeriod, sendInvalid } from '../lib/validation';

export async function getBurnRate(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const period = parsePeriod(req.query);

    if (!period) {
      sendInvalid(res, 'INVALID_PERIOD', 'Month must be 1-12 and year 2000-2100');
      return;
    }

    const now = new Date();
    const { year: queryYear, month: queryMonth } = period;

    const results = await calculateBurnRate(userId, queryYear, queryMonth);

    if (queryYear === now.getFullYear() && queryMonth === now.getMonth() + 1) {
      await saveAlerts(userId, results);
    }

    res.json({ data: results });
  } catch (error) {
    console.error('Error calculating burn rate:', error);
    res.status(500).json({ error: 'Failed to calculate burn rate', code: 'INTERNAL_ERROR' });
  }
}

export async function getAlerts(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const isRead = req.query.is_read;

    let query = supabaseAdmin()
      .from('alerts')
      .select('*, category:categories(*)')
      .eq('user_id', userId);

    if (isRead === 'false') {
      query = query.eq('is_read', false);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ data });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts', code: 'INTERNAL_ERROR' });
  }
}

export async function markAlertRead(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const alertId = req.params.id;

    if (!isUuid(alertId)) {
      sendInvalid(res, 'INVALID_ID', 'Invalid alert id');
      return;
    }

    const { error } = await supabaseAdmin()
      .from('alerts')
      .update({ is_read: true })
      .eq('id', alertId)
      .eq('user_id', userId);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking alert as read:', error);
    res.status(500).json({ error: 'Failed to update alert', code: 'INTERNAL_ERROR' });
  }
}

export async function markAllAlertsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const { error } = await supabaseAdmin()
      .from('alerts')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('month', month)
      .eq('year', year)
      .eq('is_read', false);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking all alerts as read:', error);
    res.status(500).json({ error: 'Failed to update alerts', code: 'INTERNAL_ERROR' });
  }
}
