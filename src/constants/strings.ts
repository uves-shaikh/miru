export const Strings = {
  appName: 'Miru',
  appTagline: 'Your smart reminder companion',

  // Greetings
  greetingMorning: 'Good morning ☀️',
  greetingAfternoon: 'Good afternoon 🌤',
  greetingEvening: 'Good evening 🌙',

  // Nav tabs
  tabHome: 'Home',
  tabReminders: 'Reminders',
  tabAdd: 'New',

  // Home screen
  todaySchedule: "Today's Schedule",
  activeReminders: 'Active Reminders',
  noScheduleToday: 'Nothing scheduled for today',
  noRemindersYet: 'No reminders yet',
  noRemindersSubtitle: 'Tap + to create your first reminder',
  pullToRefresh: 'Pull to refresh',

  // Reminders screen
  allReminders: 'All Reminders',
  filterAll: 'All',
  filterActive: 'Active',
  filterPaused: 'Paused',
  searchPlaceholder: 'Search reminders...',
  noResults: 'No reminders found',
  swipeHint: 'Swipe left to delete, right to toggle',

  // Add / Edit
  addReminder: 'New Reminder',
  editReminder: 'Edit Reminder',
  step1Title: 'What to remind?',
  step2Title: 'How often?',
  step3Title: 'Configure schedule',
  step4Title: 'Which days?',
  titleLabel: 'Title',
  titlePlaceholder: 'e.g. Drink water',
  descriptionLabel: 'Description (optional)',
  descriptionPlaceholder: 'Add a note...',
  scheduleInterval: '🔁 Interval',
  scheduleIntervalDesc: 'Every X minutes/hours in a time range',
  scheduleFixed: '📌 Specific Times',
  scheduleFixedDesc: 'Fire at one or more times you choose',
  everyLabel: 'Every',
  minutes: 'minutes',
  hours: 'hours',
  between: 'Between',
  and: 'and',
  addTime: '+ Add time',
  removeTime: 'Remove',
  atLabel: 'At',
  daysLabel: 'Active days',
  previewTitle: "You'll receive",
  previewNotifications: 'notifications today',
  previewTimes: 'Scheduled times',
  saveButton: 'Save Reminder',
  updateButton: 'Update Reminder',
  nextButton: 'Continue',
  backButton: 'Back',
  cancelButton: 'Cancel',

  // Days
  dayMon: 'Mon',
  dayTue: 'Tue',
  dayWed: 'Wed',
  dayThu: 'Thu',
  dayFri: 'Fri',
  daySat: 'Sat',
  daySun: 'Sun',

  // Errors
  errorTitle: 'Something went wrong',
  errorSave: 'Failed to save reminder. Please try again.',
  errorLoad: 'Failed to load reminders.',
  errorNotification: 'Failed to schedule notifications.',
  errorPermissionDenied: 'Notification permission denied',
  errorPermissionDesc: 'Enable notifications in Settings to receive reminders.',
  validationTitle: 'Please add a title',
  validationDays: 'Please select at least one day',
  validationTimes: 'Please add at least one time',

  // Notifications
  notificationChannelName: 'Reminders',
  notificationChannelId: 'reminders',
  notificationTimePrefix: 'Time to',

  // Actions
  deleteConfirmTitle: 'Delete Reminder',
  deleteConfirmMessage: 'This reminder and all its notifications will be removed.',
  deleteConfirmOk: 'Delete',
  deleteConfirmCancel: 'Cancel',

  // States
  active: 'Active',
  paused: 'Paused',
  next: 'Next',
  today: 'Today',
} as const;
