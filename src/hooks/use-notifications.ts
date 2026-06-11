import * as BackgroundTask from 'expo-background-task';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { useCallback, useEffect, useRef } from 'react';
import { Platform, AppState as RNAppState } from 'react-native';
import {
  BACKGROUND_FETCH_TASK,
  IOS_NOTIFICATION_BUDGET,
  SCHEDULE_DAYS_AHEAD,
} from '../constants';
import { Strings } from '../constants/strings';
import { useAppDispatch, useAppState } from '../context/app-context';
import type {
  DayOfWeek,
  IntervalSchedule,
  Reminder,
  Schedule,
  TimeValue,
} from '../types';

// ─── Android Notification Channel ────────────────────────────────────────────

export async function setupNotificationChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(
      Strings.notificationChannelId,
      {
        name: Strings.notificationChannelName,
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6366F1',
      },
    );
  }
}

// ─── Permission ───────────────────────────────────────────────────────────────

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// ─── Fire Date Calculation ────────────────────────────────────────────────────

function timeValueToDate(date: Date, time: TimeValue): Date {
  const d = new Date(date);
  d.setHours(time.hour, time.minute, 0, 0);
  return d;
}

/**
 * Calculate all fire dates for a reminder over the next SCHEDULE_DAYS_AHEAD days.
 * Returns dates sorted ascending.
 */
export function calculateFireDates(reminder: Reminder): Date[] {
  const now = new Date();
  const fireDates: Date[] = [];

  for (let i = 0; i < SCHEDULE_DAYS_AHEAD; i++) {
    const day = new Date(now);
    day.setDate(now.getDate() + i);
    day.setHours(0, 0, 0, 0);

    // 0=Sun,1=Mon...6=Sat — map to our DayOfWeek
    const dayOfWeek = day.getDay() as DayOfWeek;
    if (!reminder.activeDays.includes(dayOfWeek)) continue;

    const schedule: Schedule = reminder.schedule;

    if (schedule.type === 'interval') {
      const s = schedule as IntervalSchedule;
      let current = timeValueToDate(day, s.startTime);
      const end = timeValueToDate(day, s.endTime);

      // Skip past times on today
      while (current <= now && i === 0) {
        current = new Date(current.getTime() + s.intervalMinutes * 60_000);
      }

      while (current <= end) {
        fireDates.push(new Date(current));
        current = new Date(current.getTime() + s.intervalMinutes * 60_000);
      }
    } else {
      // fixed — one or more specific times
      for (const time of schedule.times) {
        const fire = timeValueToDate(day, time);
        if (fire > now || i > 0) {
          fireDates.push(fire);
        }
      }
    }
  }

  return fireDates.sort((a, b) => a.getTime() - b.getTime());
}

// ─── Schedule a single reminder ───────────────────────────────────────────────

export async function scheduleReminder(
  reminder: Reminder,
  budget: number,
): Promise<string[]> {
  const fireDates = calculateFireDates(reminder);
  const ids: string[] = [];

  for (const date of fireDates.slice(0, budget)) {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: reminder.title,
          body:
            reminder.description.trim() ||
            `${Strings.notificationTimePrefix} ${reminder.title}`,
          data: { reminderId: reminder.id },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date,
        },
      });
      ids.push(id);
    } catch {
      // Continue scheduling remaining notifications even if one fails
    }
  }

  return ids;
}

// ─── Cancel a reminder's notifications ───────────────────────────────────────

export async function cancelReminderNotifications(ids: string[]): Promise<void> {
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
}

// ─── Full reschedule of all active reminders ──────────────────────────────────

export async function rescheduleAll(reminders: Reminder[]): Promise<Reminder[]> {
  // Cancel every existing notification
  await Notifications.cancelAllScheduledNotificationsAsync();

  const activeReminders = reminders.filter((r) => r.isActive);
  if (activeReminders.length === 0) return reminders;

  // Distribute iOS budget proportionally
  const budgetPerReminder = Math.floor(IOS_NOTIFICATION_BUDGET / activeReminders.length);

  const updated: Reminder[] = [...reminders];

  for (const reminder of activeReminders) {
    const ids = await scheduleReminder(reminder, Math.max(budgetPerReminder, 1));
    const idx = updated.findIndex((r) => r.id === reminder.id);
    if (idx >= 0) {
      updated[idx] = { ...updated[idx], notificationIds: ids };
    }
  }

  return updated;
}

// ─── Background Task Definition ───────────────────────────────────────────────

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    const raw = await AsyncStorage.getItem('@reminders/list');
    if (!raw) return BackgroundTask.BackgroundTaskResult.Success;
    const reminders: Reminder[] = JSON.parse(raw);
    const updated = await rescheduleAll(reminders);
    await AsyncStorage.setItem('@reminders/list', JSON.stringify(updated));
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch {
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

// ─── Register background fetch ────────────────────────────────────────────────

export async function registerBackgroundFetch() {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
    if (!isRegistered) {
      await BackgroundTask.registerTaskAsync(BACKGROUND_FETCH_TASK, {
        minimumInterval: 24 * 60, // 24 hours in minutes
      });
    }
  } catch {
    // Background fetch may not be available on all devices
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useNotifications() {
  const { reminders } = useAppState();
  const dispatch = useAppDispatch();
  const appState = useRef(RNAppState.currentState);
  // Keep a ref so the AppState listener always reads latest reminders
  // without needing to re-register itself on every reminders change.
  const remindersRef = useRef(reminders);
  useEffect(() => {
    remindersRef.current = reminders;
  }, [reminders]);

  // Re-schedule when the app comes to the foreground
  useEffect(() => {
    const sub = RNAppState.addEventListener('change', async (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        try {
          const updated = await rescheduleAll(remindersRef.current);
          dispatch({ type: 'SET_REMINDERS', payload: updated });
        } catch {
          // Non-critical — notifications may simply not reschedule
        }
      }
      appState.current = nextState;
    });
    return () => sub.remove();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]); // intentionally omit reminders — we use remindersRef instead

  const scheduleForReminder = useCallback(
    async (reminder: Reminder): Promise<Reminder> => {
      await cancelReminderNotifications(reminder.notificationIds);
      const active = remindersRef.current.filter((r) => r.isActive && r.id !== reminder.id);
      const totalActive = reminder.isActive ? active.length + 1 : active.length;
      const budget = totalActive > 0
        ? Math.floor(IOS_NOTIFICATION_BUDGET / totalActive)
        : IOS_NOTIFICATION_BUDGET;
      const ids = reminder.isActive ? await scheduleReminder(reminder, budget) : [];
      return { ...reminder, notificationIds: ids };
    },
    [], // remindersRef is stable — no deps needed
  );

  return { scheduleForReminder };
}

// ─── Today's fire times (for home screen) ────────────────────────────────────

export function getTodayFireTimes(reminders: Reminder[]): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  return reminders
    .filter((r) => r.isActive)
    .flatMap((r) => calculateFireDates(r))
    .filter((d) => d >= today && d < tomorrow)
    .sort((a, b) => a.getTime() - b.getTime());
}

// ─── Next fire time for a reminder ───────────────────────────────────────────

export function getNextFireTime(reminder: Reminder): Date | null {
  const dates = calculateFireDates(reminder);
  return dates.length > 0 ? dates[0] : null;
}
