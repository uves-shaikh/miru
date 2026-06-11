import type { Reminder } from '../types';

export const STORAGE_KEY = '@reminders/list';

export const BACKGROUND_FETCH_TASK = 'BACKGROUND_REMINDER_SYNC';

// iOS max scheduled notifications across all apps
export const IOS_NOTIFICATION_BUDGET = 64;

// Schedule next N days of notifications
export const SCHEDULE_DAYS_AHEAD = 7;

// Max fixed times per reminder
export const MAX_FIXED_TIMES = 10;

const NOW = Date.now();

export const DEFAULT_REMINDERS: Reminder[] = [
  {
    id: `default-hydrate-${NOW}`,
    title: 'Hydration Routine',
    description: 'Drink a glass of water to stay energized.',
    schedule: {
      type: 'interval',
      intervalMinutes: 120, // 2 hours
      startTime: { hour: 9, minute: 0 },
      endTime: { hour: 19, minute: 0 },
    },
    activeDays: [0, 1, 2, 3, 4, 5, 6], // Everyday
    isActive: false,
    notificationIds: [],
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: `default-eyes-${NOW}`,
    title: '20-20-20 Eye Rest',
    description: 'Look at something 20 feet away for 20 seconds to prevent eye strain.',
    schedule: {
      type: 'interval',
      intervalMinutes: 60, // 1 hour
      startTime: { hour: 9, minute: 0 },
      endTime: { hour: 18, minute: 0 },
    },
    activeDays: [1, 2, 3, 4, 5], // Mon-Fri
    isActive: false,
    notificationIds: [],
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: `default-posture-${NOW}`,
    title: 'Posture Check & Stretch',
    description: 'Stand up, stretch your back, and reset your posture.',
    schedule: {
      type: 'interval',
      intervalMinutes: 180, // 3 hours
      startTime: { hour: 10, minute: 0 },
      endTime: { hour: 17, minute: 0 },
    },
    activeDays: [1, 2, 3, 4, 5], // Mon-Fri
    isActive: false,
    notificationIds: [],
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: `default-meds-${NOW}`,
    title: 'Morning Supplements',
    description: "Don't forget your daily vitamins or medication.",
    schedule: {
      type: 'fixed',
      times: [{ hour: 8, minute: 30 }],
    },
    activeDays: [0, 1, 2, 3, 4, 5, 6], // Everyday
    isActive: false,
    notificationIds: [],
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: `default-gym-${NOW}`,
    title: 'Gym & Fitness',
    description: 'Time to hit the gym and crush your workout goals.',
    schedule: {
      type: 'fixed',
      times: [{ hour: 18, minute: 0 }],
    },
    activeDays: [1, 3, 5], // Mon, Wed, Fri
    isActive: false,
    notificationIds: [],
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: `default-weekly-${NOW}`,
    title: 'Weekly Review',
    description: 'Review the past week and outline goals for the next one.',
    schedule: {
      type: 'fixed',
      times: [{ hour: 17, minute: 0 }],
    },
    activeDays: [0], // Sunday
    isActive: false,
    notificationIds: [],
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: `default-winddown-${NOW}`,
    title: 'Evening Wind Down',
    description: "Disconnect from screens and prepare for a good night's rest.",
    schedule: {
      type: 'fixed',
      times: [{ hour: 21, minute: 30 }],
    },
    activeDays: [0, 1, 2, 3, 4, 5, 6], // Everyday
    isActive: false,
    notificationIds: [],
    createdAt: NOW,
    updatedAt: NOW,
  },
];
