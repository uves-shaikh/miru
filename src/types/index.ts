export type ScheduleType = 'interval' | 'fixed';

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday

export interface TimeValue {
  hour: number;
  minute: number;
}

export interface IntervalSchedule {
  type: 'interval';
  intervalMinutes: number;
  startTime: TimeValue;
  endTime: TimeValue;
}

export interface FixedSchedule {
  type: 'fixed';
  times: TimeValue[];
}

export type Schedule = IntervalSchedule | FixedSchedule;

export interface Reminder {
  id: string;
  title: string;
  description: string;
  schedule: Schedule;
  activeDays: DayOfWeek[];
  isActive: boolean;
  notificationIds: string[];
  createdAt: number;
  updatedAt: number;
}

export type ReminderFilter = 'all' | 'active' | 'paused';

export interface AppState {
  reminders: Reminder[];
  isLoading: boolean;
  permissionGranted: boolean;
  permissionChecked: boolean;
}

export type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_REMINDERS'; payload: Reminder[] }
  | { type: 'ADD_REMINDER'; payload: Reminder }
  | { type: 'UPDATE_REMINDER'; payload: Reminder }
  | { type: 'DELETE_REMINDER'; payload: string }
  | { type: 'TOGGLE_REMINDER'; payload: string }
  | { type: 'SET_PERMISSION'; payload: boolean }
  | { type: 'SET_PERMISSION_CHECKED'; payload: boolean };
