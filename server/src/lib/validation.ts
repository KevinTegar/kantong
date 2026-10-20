import type { Response } from 'express';
import type { TransactionType } from '../types';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;
const TRANSACTION_TYPES: readonly string[] = ['income', 'expense'];

export const MAX_DESCRIPTION_LENGTH = 500;
export const MAX_NAME_LENGTH = 60;
export const MAX_ICON_LENGTH = 50;

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_PATTERN.test(value);
}

// Nilai uang selalu Rupiah bulat (integer), tidak boleh float
export function isPositiveRupiah(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) > 0;
}

export function isNonNegativeRupiah(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) >= 0;
}

export function isTransactionType(value: unknown): value is TransactionType {
  return typeof value === 'string' && TRANSACTION_TYPES.includes(value);
}

// 'YYYY-MM-DD' that exists on the calendar (rejects e.g. 2026-02-30)
export function isIsoDate(value: unknown): value is string {
  if (typeof value !== 'string') return false;

  const match = DATE_PATTERN.exec(value);
  if (!match) return false;

  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && HEX_COLOR_PATTERN.test(value);
}

export function isTextUpTo(value: unknown, maxLength: number): value is string {
  return typeof value === 'string' && value.length <= maxLength;
}

export function isCategoryName(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= MAX_NAME_LENGTH;
}

/**
 * Optional `month`/`year` query params. Missing values default to the current period;
 * values that are present but invalid yield null.
 */
export function parsePeriod(query: Record<string, unknown>): { month: number; year: number } | null {
  const now = new Date();
  const month = query.month === undefined ? now.getMonth() + 1 : Number(query.month);
  const year = query.year === undefined ? now.getFullYear() : Number(query.year);

  if (!Number.isInteger(month) || month < 1 || month > 12) return null;
  if (!Number.isInteger(year) || year < 2000 || year > 2100) return null;
  return { month, year };
}

export function sendInvalid(res: Response, code: string, message: string): void {
  res.status(400).json({ error: message, code });
}
