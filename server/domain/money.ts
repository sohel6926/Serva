export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

export function paiseToRupees(paise: number): number {
  return paise / 100;
}

/**
 * Compute percentage in rupees and round half-up to a whole rupee,
 * returning integer paise (divisible by 100).
 * Example: worker_price = ₹250 (25000p), 7% => 17.50 => rounds half-up to ₹18 (1800p).
 */
export function roundPercentHalfUpInRupees(basePaise: number, percent: number): number {
  const baseRupees = basePaise / 100;
  const rawRupees = (baseRupees * percent) / 100;
  const roundedRupees = Math.floor(rawRupees + 0.5 + 1e-9);
  return roundedRupees * 100;
}

export function formatINR(paise: number): string {
  const rupees = Math.round(paise / 100);
  const sign = rupees < 0 ? '-' : '';
  const formatted = Math.abs(rupees).toLocaleString('en-IN');
  return `${sign}₹${formatted}`;
}
