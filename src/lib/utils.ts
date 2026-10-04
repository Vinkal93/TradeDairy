import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency: 'INR' | 'USD' | 'EUR' | 'GBP' = 'INR',
  showPlusSign: boolean = false
): string {
  const symbolMap: Record<string, string> = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
  };

  const symbol = symbolMap[currency] || '₹';
  const isPositive = amount > 0;
  const isNegative = amount < 0;
  const absVal = Math.abs(amount);

  // Format with commas according to Indian or international standards
  let formattedNumber = '';
  if (currency === 'INR') {
    formattedNumber = absVal.toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: absVal % 1 === 0 ? 0 : 2,
    });
  } else {
    formattedNumber = absVal.toLocaleString('en-US', {
      maximumFractionDigits: 2,
      minimumFractionDigits: absVal % 1 === 0 ? 0 : 2,
    });
  }

  if (isNegative) {
    return `-${symbol}${formattedNumber}`;
  }
  if (isPositive && showPlusSign) {
    return `+${symbol}${formattedNumber}`;
  }
  return `${symbol}${formattedNumber}`;
}

export function formatPercent(value: number, showPlusSign: boolean = false): string {
  const isPositive = value > 0;
  const isNegative = value < 0;
  const absVal = Math.abs(value);
  const formatted = absVal.toFixed(1) + '%';

  if (isNegative) return `-${formatted}`;
  if (isPositive && showPlusSign) return `+${formatted}`;
  return formatted;
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}
