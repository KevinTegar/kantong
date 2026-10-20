import { Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import { calculateBurnRate, saveAlerts } from '../lib/burnRateEngine';
import type { AuthenticatedRequest } from '../middleware/auth';
import type { AvailableMonth } from '../types';
import {
  MAX_DESCRIPTION_LENGTH,
  isIsoDate,
  isPositiveRupiah,
  isTextUpTo,
  isTransactionType,
  isUuid,
  parsePeriod,
  sendInvalid,
} from '../lib/validation';

// service_role melewati RLS, jadi kepemilikan kategori harus dicek eksplisit.
// Kategori yang sudah di-soft-delete tetap sah supaya transaksi lama masih bisa diedit.
async function isOwnCategory(userId: string, categoryId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin()
    .from('categories')
    .select('id')
    .eq('id', categoryId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data !== null;
}

export async function getTransactions(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const { category_id, type } = req.query;
    const period = parsePeriod(req.query);

    if (!period) {
      sendInvalid(res, 'INVALID_PERIOD', 'Month must be 1-12 and year 2000-2100');
      return;
    }

    if (category_id !== undefined && !isUuid(category_id)) {
      sendInvalid(res, 'INVALID_CATEGORY', 'Invalid category id');
      return;
    }

    if (type !== undefined && !isTransactionType(type)) {
      sendInvalid(res, 'INVALID_TYPE', 'Invalid transaction type');
      return;
    }

    const { year: queryYear, month: queryMonth } = period;

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
    // Body bisa kosong atau berisi tipe apa saja dari client; jangan percaya bentuknya
    const { category_id, amount, type, description, date } = (req.body ?? {}) as Record<string, unknown>;

    if (!isPositiveRupiah(amount)) {
      sendInvalid(res, 'INVALID_AMOUNT', 'Amount must be a positive whole number of Rupiah');
      return;
    }

    if (!isTransactionType(type)) {
      sendInvalid(res, 'INVALID_TYPE', 'Invalid transaction type');
      return;
    }

    if (date !== undefined && date !== null && !isIsoDate(date)) {
      sendInvalid(res, 'INVALID_DATE', 'Date must be a valid YYYY-MM-DD date');
      return;
    }

    if (description !== undefined && description !== null && !isTextUpTo(description, MAX_DESCRIPTION_LENGTH)) {
      sendInvalid(res, 'INVALID_DESCRIPTION', `Description must be text up to ${MAX_DESCRIPTION_LENGTH} characters`);
      return;
    }

    if (category_id && !(isUuid(category_id) && await isOwnCategory(userId, category_id))) {
      sendInvalid(res, 'INVALID_CATEGORY', 'Category not found');
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
    const { amount, description, date, category_id } = (req.body ?? {}) as Record<string, unknown>;

    if (!isUuid(id)) {
      sendInvalid(res, 'INVALID_ID', 'Invalid transaction id');
      return;
    }

    if (amount !== undefined && !isPositiveRupiah(amount)) {
      sendInvalid(res, 'INVALID_AMOUNT', 'Amount must be a positive whole number of Rupiah');
      return;
    }

    if (date !== undefined && !isIsoDate(date)) {
      sendInvalid(res, 'INVALID_DATE', 'Date must be a valid YYYY-MM-DD date');
      return;
    }

    if (description !== undefined && description !== null && !isTextUpTo(description, MAX_DESCRIPTION_LENGTH)) {
      sendInvalid(res, 'INVALID_DESCRIPTION', `Description must be text up to ${MAX_DESCRIPTION_LENGTH} characters`);
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

    if (category_id && !(isUuid(category_id) && await isOwnCategory(userId, category_id))) {
      sendInvalid(res, 'INVALID_CATEGORY', 'Category not found');
      return;
    }

    const updateData: Record<string, unknown> = {};
    if (amount !== undefined) updateData.amount = amount;
    if (description !== undefined) updateData.description = description;
    if (date !== undefined) updateData.date = date;
    if (category_id !== undefined) updateData.category_id = category_id || null;

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

    if (!isUuid(id)) {
      sendInvalid(res, 'INVALID_ID', 'Invalid transaction id');
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
