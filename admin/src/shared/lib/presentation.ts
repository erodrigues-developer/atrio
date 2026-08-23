import type { AdminStay } from '@/shared/api/atrio-api';

export type StayWorkflowAction = 'resend' | 'check-in' | 'check-out' | 'cancel';

export function formatMoney(amountCents: number, currency: string) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(amountCents / 100);
}

export function formatDecimalInput(amountCents: number) {
  return (amountCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function parseCurrencyInput(value: string) {
  const digits = value.replace(/\D/g, '');
  return digits ? Number(digits) : 0;
}

export function formatStayPeriod(checkInDate: string, checkOutDate: string) {
  const start = new Date(`${checkInDate}T00:00:00`);
  const end = new Date(`${checkOutDate}T00:00:00`);
  const currentYear = new Date().getFullYear();
  const sameYear = start.getFullYear() === end.getFullYear() && start.getFullYear() === currentYear;
  const options: Intl.DateTimeFormatOptions = sameYear
    ? { day: '2-digit', month: 'short' }
    : { day: '2-digit', month: 'short', year: 'numeric' };
  const formatter = new Intl.DateTimeFormat('pt-BR', options);

  return `${formatter.format(start).replace('.', '')} → ${formatter.format(end).replace('.', '')}`;
}

export function formatStayDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  const currentYear = new Date().getFullYear();
  const options: Intl.DateTimeFormatOptions = date.getFullYear() === currentYear
    ? { day: '2-digit', month: 'short' }
    : { day: '2-digit', month: 'short', year: 'numeric' };
  return new Intl.DateTimeFormat('pt-BR', options).format(date).replace('.', '');
}

export function requestStatusLabel(status: string) {
  const labels: Record<string, string> = {
    accepted: 'aceita', received: 'recebida', in_progress: 'em atendimento', on_the_way: 'a caminho',
    completed: 'concluída', cancelled: 'cancelada', rejected: 'recusada',
  };
  return labels[status] ?? status;
}

export function nextRequestAction(status?: string) {
  const actions: Record<string, { label: string; status: string }> = {
    received: { label: 'Aceitar', status: 'accepted' }, accepted: { label: 'A caminho', status: 'on_the_way' },
    in_progress: { label: 'A caminho', status: 'on_the_way' }, on_the_way: { label: 'Concluir', status: 'completed' },
  };
  return status ? actions[status] : actions.received;
}

export function canCancelRequest(status?: string) {
  return !['cancelled', 'completed', 'rejected'].includes(status ?? '');
}

export function requestActionConfirmLabel(status: string) {
  const labels: Record<string, string> = {
    accepted: 'Aceitar solicitação', on_the_way: 'Marcar como a caminho',
    completed: 'Concluir solicitação', cancelled: 'Cancelar solicitação',
  };
  return labels[status] ?? `Marcar como ${requestStatusLabel(status)}`;
}

export function requestActionTitle(status: string) {
  const titles: Record<string, string> = {
    accepted: 'Aceitar solicitação?', on_the_way: 'Marcar como a caminho?',
    completed: 'Concluir solicitação?', cancelled: 'Cancelar solicitação?',
  };
  return titles[status] ?? 'Atualizar solicitação?';
}

export function reservationStatusLabel(status: string) {
  const labels: Record<string, string> = {
    confirmed: 'confirmada', completed: 'concluída', cancelled: 'cancelada', rejected: 'recusada',
  };
  return labels[status] ?? status;
}

export function stayWorkflowTitle(action: StayWorkflowAction) {
  return { resend: 'Reenviar acesso?', 'check-in': 'Realizar check-in?', 'check-out': 'Encerrar estadia?', cancel: 'Cancelar estadia?' }[action];
}

export function stayWorkflowConfirmLabel(action: StayWorkflowAction) {
  return { resend: 'Reenviar acesso', 'check-in': 'Realizar check-in', 'check-out': 'Encerrar estadia', cancel: 'Cancelar estadia' }[action];
}

export function stayWorkflowMessage(action: StayWorkflowAction, stay: AdminStay) {
  const guestName = `${stay.guest.firstName} ${stay.guest.lastName}`;
  if (action === 'resend') return `Um novo acesso será enviado para ${guestName}.`;
  if (action === 'check-in') return `A estadia do quarto ${stay.roomNumber} será marcada como ativa.`;
  if (action === 'check-out') return 'O hóspede perderá o acesso aos recursos vinculados a esta estadia.';
  return 'A estadia será marcada como cancelada e sairá da operação ativa.';
}

export function shortStayStatus(status: string) {
  return ({ active: 'Ativa', scheduled: 'Agendada', checked_out: 'Encerrada', cancelled: 'Cancelada' } as Record<string, string>)[status] ?? status;
}

export function stayStatusColor(status: string) {
  return ({ active: 'success', scheduled: 'processing', checked_out: 'default', cancelled: 'error' } as Record<string, string>)[status] ?? 'default';
}

export function formatDateInput(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function getCurrentMonthDateRange() {
  const today = new Date();
  return {
    start: formatDateInput(new Date(today.getFullYear(), today.getMonth(), 1)),
    end: formatDateInput(new Date(today.getFullYear(), today.getMonth() + 1, 0)),
  };
}

export function formatDate(value?: string) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

export function formatTodayLabel() {
  const label = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', weekday: 'long' }).format(new Date());
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatDuration(minutes?: number) {
  if (minutes === undefined || Number.isNaN(minutes)) return '-';
  const safeMinutes = Math.max(0, Math.floor(minutes));
  if (safeMinutes < 60) return `${safeMinutes} min`;
  const hours = Math.floor(safeMinutes / 60);
  if (hours < 24) return safeMinutes % 60 ? `${hours}h ${safeMinutes % 60}min` : `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days >= 7) return `${days} ${days === 1 ? 'dia' : 'dias'}`;
  const remainingHours = hours % 24;
  return remainingHours ? `${days} ${days === 1 ? 'dia' : 'dias'} ${remainingHours}h` : `${days} ${days === 1 ? 'dia' : 'dias'}`;
}

export function formatShortSchedule(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', hour: '2-digit', minute: '2-digit', month: '2-digit' }).format(new Date(value)).replace(',', ' ·');
}

export function statusToneClass(item: { status?: string; statusLabel?: string; priority?: string }) {
  if (item.priority === 'critical' || item.statusLabel === 'Atrasada') return 'danger';
  if (item.status === 'in_progress' || item.status === 'on_the_way' || item.statusLabel === 'Em atendimento') return 'info';
  if (item.status === 'completed' || item.statusLabel === 'Concluída') return 'success';
  return 'warning';
}

export function movementLabel(type: string) {
  return ({ 'check-in': 'Check-in', 'check-out': 'Check-out', experience: 'Experiência' } as Record<string, string>)[type] ?? type;
}
