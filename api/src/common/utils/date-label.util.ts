const MONTH_LABELS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function normalizeDate(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function getDayDifference(date: Date, baseDate: Date): number {
  const normalizedDate = normalizeDate(date).getTime();
  const normalizedBaseDate = normalizeDate(baseDate).getTime();

  return Math.round((normalizedDate - normalizedBaseDate) / (1000 * 60 * 60 * 24));
}

export function formatDayLabel(date: Date, baseDate: Date = new Date()): string {
  const difference = getDayDifference(date, baseDate);

  if (difference === 0) {
    return 'Hoje';
  }

  if (difference === 1) {
    return 'Amanhã';
  }

  return ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][date.getUTCDay()];
}

export function formatShortDate(date: Date): string {
  return `${date.getUTCDate()} ${MONTH_LABELS[date.getUTCMonth()]}`;
}

export function formatRelativeDateLabel(date: Date, baseDate: Date = new Date()): string {
  return `${formatDayLabel(date, baseDate)}, ${formatShortDate(date)}`;
}

export function formatTime(date: Date): string {
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
}

export function formatTimeRequestLabel(date: Date): string {
  return `Solicitado às ${formatTime(date)}`;
}

export function formatGreetingPeriod(date: Date = new Date()): string {
  const hours = date.getHours();

  if (hours < 12) {
    return 'Bom dia';
  }

  if (hours < 18) {
    return 'Boa tarde';
  }

  return 'Boa noite';
}
