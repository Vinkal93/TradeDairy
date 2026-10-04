/** Calendar dates use the browser's local timezone, without UTC day shifts. */
export function localDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function matchesTimeframe(date: string, timeframe: string, now = new Date()): boolean {
  const today = localDate(now);
  if (timeframe === 'All Time') return true;
  if (date > today) return false;
  if (timeframe === 'Today') return date === today;
  if (timeframe === 'This Month') return date.startsWith(today.slice(0, 7));
  if (timeframe === 'This Year') return date.startsWith(today.slice(0, 4));
  const monday = new Date(now);
  monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
  return date >= localDate(monday);
}
