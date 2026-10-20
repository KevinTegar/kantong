import { Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import type { AuthenticatedRequest } from '../middleware/auth';
import {
  MAX_ICON_LENGTH,
  MAX_NAME_LENGTH,
  isCategoryName,
  isHexColor,
  isNonNegativeRupiah,
  isTextUpTo,
  isUuid,
  sendInvalid,
} from '../lib/validation';

export async function getCategories(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;

    const { data, error } = await supabaseAdmin()
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    res.json({ data });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories', code: 'INTERNAL_ERROR' });
  }
}

export async function createCategory(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    // Body bisa kosong atau berisi tipe apa saja dari client; jangan percaya bentuknya
    const { name, icon, color, spending_cap } = (req.body ?? {}) as Record<string, unknown>;

    if (!isCategoryName(name)) {
      sendInvalid(res, 'INVALID_NAME', `Category name is required (max ${MAX_NAME_LENGTH} characters)`);
      return;
    }

    if (icon !== undefined && !isTextUpTo(icon, MAX_ICON_LENGTH)) {
      sendInvalid(res, 'INVALID_ICON', `Icon must be text up to ${MAX_ICON_LENGTH} characters`);
      return;
    }

    if (color !== undefined && !isHexColor(color)) {
      sendInvalid(res, 'INVALID_COLOR', 'Color must be a hex code like #f4c63d');
      return;
    }

    if (spending_cap !== undefined && !isNonNegativeRupiah(spending_cap)) {
      sendInvalid(res, 'INVALID_SPENDING_CAP', 'Spending cap must be a whole number of Rupiah, 0 or more');
      return;
    }

    const { data, error } = await supabaseAdmin()
      .from('categories')
      .insert({
        user_id: userId,
        name: name.trim(),
        icon: icon || 'tag',
        color: color || '#6366f1',
        spending_cap: spending_cap || 0,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ data });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category', code: 'INTERNAL_ERROR' });
  }
}

export async function updateCategory(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { name, icon, color, spending_cap, is_active } = (req.body ?? {}) as Record<string, unknown>;

    if (!isUuid(id)) {
      sendInvalid(res, 'INVALID_ID', 'Invalid category id');
      return;
    }

    if (name !== undefined && !isCategoryName(name)) {
      sendInvalid(res, 'INVALID_NAME', `Category name cannot be empty (max ${MAX_NAME_LENGTH} characters)`);
      return;
    }

    if (icon !== undefined && !isTextUpTo(icon, MAX_ICON_LENGTH)) {
      sendInvalid(res, 'INVALID_ICON', `Icon must be text up to ${MAX_ICON_LENGTH} characters`);
      return;
    }

    if (color !== undefined && !isHexColor(color)) {
      sendInvalid(res, 'INVALID_COLOR', 'Color must be a hex code like #f4c63d');
      return;
    }

    if (spending_cap !== undefined && !isNonNegativeRupiah(spending_cap)) {
      sendInvalid(res, 'INVALID_SPENDING_CAP', 'Spending cap must be a whole number of Rupiah, 0 or more');
      return;
    }

    if (is_active !== undefined && typeof is_active !== 'boolean') {
      sendInvalid(res, 'INVALID_IS_ACTIVE', 'is_active must be true or false');
      return;
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (icon !== undefined) updateData.icon = icon;
    if (color !== undefined) updateData.color = color;
    if (spending_cap !== undefined) updateData.spending_cap = spending_cap;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data, error } = await supabaseAdmin()
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    res.json({ data });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category', code: 'INTERNAL_ERROR' });
  }
}

export async function deleteCategory(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    if (!isUuid(id)) {
      sendInvalid(res, 'INVALID_ID', 'Invalid category id');
      return;
    }

    const { error } = await supabaseAdmin()
      .from('categories')
      .update({ is_active: false })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category', code: 'INTERNAL_ERROR' });
  }
}
