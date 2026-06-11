import { Strings } from '../constants/strings';
import type { DayOfWeek, Reminder, Schedule, TimeValue } from '../types';

// ─── Time formatting ──────────────────────────────────────────────────────────

export function formatTime(time: TimeValue): string {
  const ampm = time.hour < 12 ? 'AM' : 'PM';
  const h12 = time.hour % 12 === 0 ? 12 : time.hour % 12;
  const m = time.minute.toString().padStart(2, '0');
  return `${h12}:${m} ${ampm}`;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatTimeDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = date.getTime() - now.getTime();

  if (diff < 0) return 'passed';

  const minutes = Math.round(diff / 60_000);
  if (minutes < 60) return `in ${minutes}m`;

  const hours = Math.round(diff / 3_600_000);
  if (hours < 24) return `in ${hours}h`;

  const days = Math.round(diff / 86_400_000);
  return `in ${days}d`;
}

// ─── Greeting ─────────────────────────────────────────────────────────────────

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return Strings.greetingMorning;
  if (hour < 17) return Strings.greetingAfternoon;
  return Strings.greetingEvening;
}

// ─── Day helpers ──────────────────────────────────────────────────────────────

const DAY_LABELS: Record<DayOfWeek, string> = {
  0: Strings.daySun,
  1: Strings.dayMon,
  2: Strings.dayTue,
  3: Strings.dayWed,
  4: Strings.dayThu,
  5: Strings.dayFri,
  6: Strings.daySat,
};

export function getDayLabel(day: DayOfWeek): string {
  return DAY_LABELS[day];
}

export function allDays(): DayOfWeek[] {
  return [0, 1, 2, 3, 4, 5, 6];
}

// ─── Schedule description ─────────────────────────────────────────────────────

export function describeSchedule(schedule: Schedule): string {
  if (schedule.type === 'interval') {
    const unit = schedule.intervalMinutes >= 60 ? 'hr' : 'min';
    const value =
      schedule.intervalMinutes >= 60
        ? schedule.intervalMinutes / 60
        : schedule.intervalMinutes;
    return `Every ${value}${unit} · ${formatTime(schedule.startTime)}–${formatTime(schedule.endTime)}`;
  }
  // fixed — one or more specific times
  return schedule.times.map(formatTime).join(', ');
}

// ─── UUID ─────────────────────────────────────────────────────────────────────

export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// ─── Reminder factory ─────────────────────────────────────────────────────────

export function createReminder(
  partial: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt' | 'notificationIds' | 'isActive'>,
): Reminder {
  const now = Date.now();
  return {
    ...partial,
    id: generateId(),
    isActive: true,
    notificationIds: [],
    createdAt: now,
    updatedAt: now,
  };
}

// ─── Active days display ──────────────────────────────────────────────────────

export function formatActiveDays(days: DayOfWeek[]): string {
  if (days.length === 7) return 'Every day';
  if (days.length === 0) return 'No days';

  // Weekdays / Weekend shortcuts
  const weekdays: DayOfWeek[] = [1, 2, 3, 4, 5];
  const weekend: DayOfWeek[] = [0, 6];

  const isWeekdays =
    weekdays.every((d) => days.includes(d)) && !days.some((d) => weekend.includes(d));
  const isWeekend =
    weekend.every((d) => days.includes(d)) && !days.some((d) => weekdays.includes(d));

  if (isWeekdays) return 'Weekdays';
  if (isWeekend) return 'Weekends';

  return days.map(getDayLabel).join(', ');
}
