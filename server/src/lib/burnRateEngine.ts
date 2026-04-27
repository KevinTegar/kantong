import { supabaseAdmin } from './supabase';
import type { BurnRateResult, AlertLevel, Category } from '../types';

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function getAlertLevel(
  projectedTotal: number,
  spendingCap: number,
  spentSoFar: number
): AlertLevel | null {
  if (spendingCap === 0) return null;

  if (spentSoFar >= spendingCap) {
    return 'DANGER';
  }

  const ratio = projectedTotal / spendingCap;

  if (ratio >= 1.0) return 'DANGER';
  if (ratio >= 0.85) return 'WARNING';
  if (ratio >= 0.7) return 'WATCH';

  return null;
}

export async function calculateBurnRate(
  userId: string,
  year: number,
  month: number
): Promise<BurnRateResult[]> {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (year !== currentYear || month !== currentMonth) {
    return [];
  }

  const dayOfMonth = now.getDate();
  const totalDaysInMonth = getDaysInMonth(year, month);

  const weeksElapsed = Math.max(1, Math.ceil(dayOfMonth / 7));
  const weeksInMonth = Math.ceil(totalDaysInMonth / 7);
  const weeksRemaining = Math.max(0, weeksInMonth - weeksElapsed);

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(totalDaysInMonth).padStart(2, '0')}`;

  const { data: categories, error: categoriesError } = await supabaseAdmin()
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true);

  if (categoriesError) throw categoriesError;
  if (!categories || categories.length === 0) return [];

  const categoryMap = new Map<string, Category>(categories.map((c: Category) => [c.id, c]));

  const { data: expenses, error: expensesError } = await supabaseAdmin()
    .from('transactions')
    .select('category_id, amount')
    .eq('user_id', userId)
    .eq('type', 'expense')
    .gte('date', startDate)
    .lte('date', endDate);

  if (expensesError) throw expensesError;

  const spentByCategory = new Map<string, number>();
  for (const tx of expenses ?? []) {
    if (tx.category_id) {
      const current = spentByCategory.get(tx.category_id) || 0;
      spentByCategory.set(tx.category_id, current + Number(tx.amount));
    }
  }

  const results: BurnRateResult[] = [];

  for (const category of categories) {
    if (category.spending_cap === 0) continue;

    const spentSoFar = spentByCategory.get(category.id) || 0;
    const weeklyAverage = weeksElapsed > 0 ? spentSoFar / weeksElapsed : 0;
    const projectedTotal = spentSoFar + (weeklyAverage * weeksRemaining);
    const remainingBudget = Math.max(0, category.spending_cap - spentSoFar);

    const percentageUsed = category.spending_cap > 0
      ? (spentSoFar / category.spending_cap) * 100
      : 0;
    const percentageProjected = category.spending_cap > 0
      ? (projectedTotal / category.spending_cap) * 100
      : 0;

    const alertLevel = getAlertLevel(projectedTotal, category.spending_cap, spentSoFar);

    results.push({
      category_id: category.id,
      category_name: category.name,
      spending_cap: Number(category.spending_cap),
      spent_so_far: spentSoFar,
      weekly_average: Math.round(weeklyAverage),
      projected_total: Math.round(projectedTotal),
      remaining_budget: remainingBudget,
      weeksElapsed,
      weeksRemaining,
      alert_level: alertLevel,
      percentage_used: Math.round(percentageUsed * 10) / 10,
      percentage_projected: Math.round(percentageProjected * 10) / 10,
    });
  }

  return results;
}

export async function saveAlerts(
  userId: string,
  burnRateResults: BurnRateResult[]
): Promise<void> {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const newAlerts = burnRateResults.filter(r => r.alert_level !== null);

  if (newAlerts.length === 0) return;

  const alertRecords = newAlerts.map(result => ({
    user_id: userId,
    category_id: result.category_id,
    month,
    year,
    level: result.alert_level,
    projected_amount: result.projected_total,
    is_read: false,
  }));

  for (const alert of alertRecords) {
    await supabaseAdmin()
      .from('alerts')
      .upsert(alert, {
        onConflict: 'user_id,category_id,month,year,level',
      });
  }
}