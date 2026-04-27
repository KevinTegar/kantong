import { Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import { calculateBurnRate, saveAlerts } from '../lib/burnRateEngine';
import type { AuthenticatedRequest } from '../middleware/auth';

export async function getBurnRate(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const results = await calculateBurnRate(userId, year, month);
    await saveAlerts(userId, results);

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