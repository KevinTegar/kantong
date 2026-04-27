import { Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import type { AuthenticatedRequest } from '../middleware/auth';
import type { CategoryFormData } from '../types';

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
    const { name, icon, color, spending_cap } = req.body as CategoryFormData;

    if (!name || name.trim().length === 0) {
      res.status(400).json({ error: 'Category name is required', code: 'INVALID_NAME' });
      return;
    }

    if (spending_cap < 0) {
      res.status(400).json({ error: 'Spending cap cannot be negative', code: 'INVALID_SPENDING_CAP' });
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
    const { name, icon, color, spending_cap, is_active } = req.body;

    if (name !== undefined && name.trim().length === 0) {
      res.status(400).json({ error: 'Category name cannot be empty', code: 'INVALID_NAME' });
      return;
    }

    if (spending_cap !== undefined && spending_cap < 0) {
      res.status(400).json({ error: 'Spending cap cannot be negative', code: 'INVALID_SPENDING_CAP' });
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