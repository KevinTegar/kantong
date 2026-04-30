import { Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import { calculateBurnRate, saveAlerts } from '../lib/burnRateEngine';
import type { AuthenticatedRequest } from '../middleware/auth';
import type { AvailableMonth, TransactionFormData } from '../types';

export async function getTransactions(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const { month, year, category_id, type } = req.query;

    const now = new Date();
    const queryYear = year ? Number(year) : now.getFullYear();
    const queryMonth = month ? Number(month) : now.getMonth() + 1;

    const startDate = `${queryYear}-${String(queryMonth).padStart(2, '0')}-01`;
    const daysInMonth = new Date(queryYear, queryMonth, 0).getDate();
    const endDate = `${queryYear}-${String(queryMonth).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

    let query = supabaseAdmin()
      .from('transactions')
      .select('*, category:categories(*)')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (category_id) {
      query = query.eq('category_id', category_id);
    }

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) throw error;
    res.json({ data });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions', code: 'INTERNAL_ERROR' });
  }
}

export async function getAvailableTransactionMonths(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;

    const { data, error } = await supabaseAdmin()
      .from('transactions')
      .select('date')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;

    const monthMap = new Map<string, AvailableMonth>();

    for (const transaction of data ?? []) {
      const [yearString, monthString] = transaction.date.split('-');
      const year = Number(yearString);
      const month = Number(monthString);
      const key = `${year}-${month}`;

      const existing = monthMap.get(key);

      if (existing) {
        existing.transaction_count += 1;
        continue;
      }

      monthMap.set(key, {
        year,
        month,
        transaction_count: 1,
      });
    }

    const months = Array.from(monthMap.values()).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });

    res.json({ data: months });
  } catch (error) {
    console.error('Error fetching available transaction months:', error);
    res.status(500).json({ error: 'Failed to fetch available months', code: 'INTERNAL_ERROR' });
  }
}

export async function createTransaction(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const { category_id, amount, type, description, date } = req.body as TransactionFormData;

    if (!amount || amount <= 0) {
      res.status(400).json({ error: 'Amount must be greater than 0', code: 'INVALID_AMOUNT' });
      return;
    }

    if (!['income', 'expense'].includes(type)) {
      res.status(400).json({ error: 'Invalid transaction type', code: 'INVALID_TYPE' });
      return;
    }

    const { data, error } = await supabaseAdmin()
      .from('transactions')
      .insert({
        user_id: userId,
        category_id: category_id || null,
        amount,
        type,
        description: description || null,
        date: date || new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) throw error;

    if (type === 'expense') {
      const now = new Date();
      const results = await calculateBurnRate(userId, now.getFullYear(), now.getMonth() + 1);
      await saveAlerts(userId, results);
    }

    res.status(201).json({ data });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction', code: 'INTERNAL_ERROR' });
  }
}

export async function updateTransaction(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { amount, description, date, category_id } = req.body;

    if (amount !== undefined && amount <= 0) {
      res.status(400).json({ error: 'Amount must be greater than 0', code: 'INVALID_AMOUNT' });
      return;
    }

    const { data: existing } = await supabaseAdmin()
      .from('transactions')
      .select('type')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!existing) {
      res.status(404).json({ error: 'Transaction not found', code: 'NOT_FOUND' });
      return;
    }

    const updateData: Record<string, unknown> = {};
    if (amount !== undefined) updateData.amount = amount;
    if (description !== undefined) updateData.description = description;
    if (date !== undefined) updateData.date = date;
    if (category_id !== undefined) updateData.category_id = category_id;

    const { data, error } = await supabaseAdmin()
      .from('transactions')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    if (existing.type === 'expense') {
      const now = new Date();
      const results = await calculateBurnRate(userId, now.getFullYear(), now.getMonth() + 1);
      await saveAlerts(userId, results);
    }

    res.json({ data });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction', code: 'INTERNAL_ERROR' });
  }
}

export async function deleteTransaction(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const { data: existing } = await supabaseAdmin()
      .from('transactions')
      .select('type')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!existing) {
      res.status(404).json({ error: 'Transaction not found', code: 'NOT_FOUND' });
      return;
    }

    const { error } = await supabaseAdmin()
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    if (existing.type === 'expense') {
      const now = new Date();
      const results = await calculateBurnRate(userId, now.getFullYear(), now.getMonth() + 1);
      await saveAlerts(userId, results);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction', code: 'INTERNAL_ERROR' });
  }
}
