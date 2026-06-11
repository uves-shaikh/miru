import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Colors, FontSize, Radius, Spacing } from "../constants/theme";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "info";

interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextValue {
  showToast: (type: ToastType, title: string, description?: string) => void;
}

// ─── Context ───────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}

// ─── Single Toast Item ─────────────────────────────────────────────────────────

const TOAST_COLORS: Record<
  ToastType,
  { bg: string; tint: string; border: string; icon: string }
> = {
  success: {
    bg: "#1A2820",
    tint: "rgba(16,185,129,0.10)",
    border: "rgba(16,185,129,0.5)",
    icon: "✓",
  },
  error: {
    bg: "#271A1A",
    tint: "rgba(239,68,68,0.10)",
    border: "rgba(239,68,68,0.5)",
    icon: "✕",
  },
  info: {
    bg: "#1A1A2E",
    tint: "rgba(99,102,241,0.10)",
    border: "rgba(99,102,241,0.5)",
    icon: "i",
  },
};

const ACCENT: Record<ToastType, string> = {
  success: Colors.success,
  error: Colors.danger,
  info: Colors.accent,
};

interface ToastItemProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.92);

  const dismiss = useCallback(() => {
    "worklet";
    translateY.value = withTiming(-100, {
      duration: 300,
      easing: Easing.in(Easing.quad),
    });
    opacity.value = withTiming(0, { duration: 300 }, () => {
      runOnJS(onDismiss)(toast.id);
    });
    scale.value = withTiming(0.92, { duration: 300 });
  }, [toast.id, onDismiss, translateY, opacity, scale]);

  // Animate in
  React.useEffect(() => {
    translateY.value = withSpring(0, { damping: 18, stiffness: 200 });
    opacity.value = withTiming(1, { duration: 200 });
    scale.value = withSpring(1, { damping: 16, stiffness: 220 });

    const timer = setTimeout(() => {
      dismiss();
    }, 3500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  const c = TOAST_COLORS[toast.type];
  const accent = ACCENT[toast.type];

  return (
    <Animated.View style={[styles.toastWrapper, animStyle]}>
      <Pressable
        onPress={() => dismiss()}
        style={[styles.toast, { backgroundColor: c.bg, borderColor: c.border }]}
      >
        {/* Tint overlay */}
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: c.tint, borderRadius: Radius.lg },
          ]}
          pointerEvents="none"
        />
        {/* Left accent bar */}
        <View style={[styles.accentBar, { backgroundColor: accent }]} />

        {/* Icon circle */}
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: accent + "22", borderColor: accent + "55" },
          ]}
        >
          <Text style={[styles.iconText, { color: accent }]}>{c.icon}</Text>
        </View>

        {/* Text */}
        <View style={styles.textBlock}>
          <Text style={styles.toastTitle} numberOfLines={1}>
            {toast.title}
          </Text>
          {toast.description ? (
            <Text style={styles.toastDesc} numberOfLines={2}>
              {toast.description}
            </Text>
          ) : null}
        </View>

        {/* Dismiss X */}
        <Text style={styles.dismissX}>×</Text>
      </Pressable>
    </Animated.View>
  );
}

// ─── Provider ──────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const idRef = useRef(0);

  const showToast = useCallback(
    (type: ToastType, title: string, description?: string) => {
      const id = (++idRef.current).toString();
      setToasts((prev) => [...prev, { id, type, title, description }]);
    },
    [],
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast overlay — rendered on top of everything */}
      <View style={styles.container} pointerEvents="box-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 48,
    left: Spacing.md,
    right: Spacing.md,
    zIndex: 9999,
    gap: Spacing.sm,
  },
  toastWrapper: {
    width: "100%",
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingVertical: Spacing.md,
    paddingRight: Spacing.md,
    gap: Spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 14,
  },
  accentBar: {
    width: 4,
    alignSelf: "stretch",
    borderRadius: Radius.full,
    marginLeft: -1, // flush with border
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: FontSize.sm,
    fontFamily: "Inter_700Bold",
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  toastTitle: {
    fontSize: FontSize.md,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  toastDesc: {
    fontSize: FontSize.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  dismissX: {
    fontSize: FontSize.xl,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
});
