import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from "react";
import { DEFAULT_REMINDERS, STORAGE_KEY } from "../constants";
import type { AppAction, AppState, Reminder } from "../types";

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: AppState = {
  reminders: [],
  isLoading: true,
  permissionGranted: false,
  permissionChecked: false,
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_REMINDERS":
      return { ...state, reminders: action.payload, isLoading: false };

    case "ADD_REMINDER":
      return {
        ...state,
        reminders: [...state.reminders, action.payload],
      };

    case "UPDATE_REMINDER":
      return {
        ...state,
        reminders: state.reminders.map((r) =>
          r.id === action.payload.id ? action.payload : r,
        ),
      };

    case "DELETE_REMINDER":
      return {
        ...state,
        reminders: state.reminders.filter((r) => r.id !== action.payload),
      };

    case "TOGGLE_REMINDER":
      return {
        ...state,
        reminders: state.reminders.map((r) =>
          r.id === action.payload ? { ...r, isActive: !r.isActive } : r,
        ),
      };

    case "SET_PERMISSION":
      return { ...state, permissionGranted: action.payload };

    case "SET_PERMISSION_CHECKED":
      return { ...state, permissionChecked: action.payload };

    default:
      return state;
  }
}

// ─── Contexts ─────────────────────────────────────────────────────────────────

// Split into state + dispatch contexts to prevent unnecessary re-renders
const StateContext = createContext<AppState | null>(null);
const DispatchContext = createContext<React.Dispatch<AppAction> | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load persisted reminders on mount
  useEffect(() => {
    async function loadReminders() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        // If raw is null, it's the very first time launching the app
        const reminders: Reminder[] = raw ? JSON.parse(raw) : DEFAULT_REMINDERS;
        dispatch({ type: "SET_REMINDERS", payload: reminders });
      } catch {
        dispatch({ type: "SET_REMINDERS", payload: DEFAULT_REMINDERS });
      }
    }
    loadReminders();
  }, []);

  // Persist whenever reminders change
  useEffect(() => {
    if (!state.isLoading) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.reminders)).catch(
        () => null,
      );
    }
  }, [state.reminders, state.isLoading]);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useAppState(): AppState {
  const ctx = useContext(StateContext);
  if (!ctx) throw new Error("useAppState must be inside AppProvider");
  return ctx;
}

export function useAppDispatch(): React.Dispatch<AppAction> {
  const ctx = useContext(DispatchContext);
  if (!ctx) throw new Error("useAppDispatch must be inside AppProvider");
  return ctx;
}

// Convenient selector hook
export function useReminders() {
  return useAppState().reminders;
}

// Callback that adds + persists a reminder
export function useReminderActions() {
  const dispatch = useAppDispatch();

  const addReminder = useCallback(
    (reminder: Reminder) => {
      dispatch({ type: "ADD_REMINDER", payload: reminder });
    },
    [dispatch],
  );

  const updateReminder = useCallback(
    (reminder: Reminder) => {
      dispatch({ type: "UPDATE_REMINDER", payload: reminder });
    },
    [dispatch],
  );

  const deleteReminder = useCallback(
    (id: string) => {
      dispatch({ type: "DELETE_REMINDER", payload: id });
    },
    [dispatch],
  );

  const toggleReminder = useCallback(
    (id: string) => {
      dispatch({ type: "TOGGLE_REMINDER", payload: id });
    },
    [dispatch],
  );

  const setReminders = useCallback(
    (reminders: Reminder[]) => {
      dispatch({ type: "SET_REMINDERS", payload: reminders });
    },
    [dispatch],
  );

  return {
    addReminder,
    updateReminder,
    deleteReminder,
    toggleReminder,
    setReminders,
  };
}
