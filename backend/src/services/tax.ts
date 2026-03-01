export function getQuarterBounds(date = new Date()) {
  const quarter = Math.floor(date.getUTCMonth() / 3);
  const start = new Date(Date.UTC(date.getUTCFullYear(), quarter * 3, 1));
  const end = new Date(Date.UTC(date.getUTCFullYear(), quarter * 3 + 3, 0, 23, 59, 59));
  return { start, end };
}

export function weeksRemainingInQuarter(date = new Date()) {
  const { end } = getQuarterBounds(date);
  const ms = end.getTime() - date.getTime();
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24 * 7)));
}

export function monthsRemainingInQuarter(date = new Date()) {
  const { end } = getQuarterBounds(date);
  const months = (end.getUTCFullYear() - date.getUTCFullYear()) * 12 + end.getUTCMonth() - date.getUTCMonth() + 1;
  return Math.max(1, months);
}
