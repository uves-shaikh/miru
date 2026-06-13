import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { memo, useCallback } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Strings } from "../constants/strings";
import { Colors, FontSize, Radius, Shadow, Spacing } from "../constants/theme";
import { getNextFireTime } from "../hooks/use-notifications";
import type { Reminder } from "../types";
import { describeSchedule, formatActiveDays, formatTimeDate } from "../utils";

interface ReminderCardProps {
  reminder: Reminder;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onDeleteRequest: (id: string) => void;
  onPress: (id: string) => void;
}

const SWIPE_THRESHOLD = 80;
const CARD_HEIGHT = 96;

export const ReminderCard = memo(function ReminderCard({
  reminder,
  onToggle,
  onDelete,
  onDeleteRequest,
  onPress,
}: ReminderCardProps) {
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);
  const triggerToggle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onToggle(reminder.id);
  }, [onToggle, reminder.id]);

  const triggerDelete = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onDeleteRequest(reminder.id);
  }, [onDeleteRequest, reminder.id]);

  const pan = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-10, 10])
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (e.translationX < -SWIPE_THRESHOLD) {
        // Swipe left → delete
        runOnJS(triggerDelete)();
        translateX.value = withSpring(0);
      } else if (e.translationX > SWIPE_THRESHOLD) {
        // Swipe right → toggle
        runOnJS(triggerToggle)();
        translateX.value = withSpring(0);
      } else {
        translateX.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { scale: scale.value }],
  }));

  const deleteRevealStyle = useAnimatedStyle(() => ({
    opacity: Math.max(0, -translateX.value / SWIPE_THRESHOLD),
  }));

  const toggleRevealStyle = useAnimatedStyle(() => ({
    opacity: Math.max(0, translateX.value / SWIPE_THRESHOLD),
  }));

  const handlePress = useCallback(() => {
    scale.value = withSpring(0.97, {}, () => {
      scale.value = withSpring(1);
    });
    Haptics.selectionAsync();
    onPress(reminder.id);
  }, [scale, onPress, reminder.id]);

  const nextFire = getNextFireTime(reminder);

  return (
    <View style={styles.wrapper}>
      {/* Background actions */}
      <Animated.View style={[styles.deleteReveal, deleteRevealStyle]}>
        <View style={styles.deleteAction}>
          <Feather name="trash-2" size={22} color={Colors.danger} />
          <Text style={styles.actionLabel}>Delete</Text>
        </View>
      </Animated.View>

      <Animated.View style={[styles.toggleReveal, toggleRevealStyle]}>
        <View style={styles.toggleAction}>
          <Text style={styles.actionIcon}>
            {reminder.isActive ? "⏸" : "▶️"}
          </Text>
          <Text style={styles.actionLabel}>
            {reminder.isActive ? "Pause" : "Resume"}
          </Text>
        </View>
      </Animated.View>

      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.cardContainer, cardStyle]}>
          <TouchableOpacity onPress={handlePress} activeOpacity={0.85}>
            <LinearGradient
              colors={
                reminder.isActive
                  ? ["rgba(99,102,241,0.08)", "rgba(99,102,241,0.02)"]
                  : ["rgba(255,255,255,0.03)", "rgba(255,255,255,0.01)"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.card, !reminder.isActive && styles.cardPaused]}
            >
              {/* Initial avatar */}
              <View style={styles.initialAvatar}>
                <Text style={styles.initialText}>
                  {reminder.title.charAt(0).toUpperCase()}
                </Text>
              </View>

              {/* Content */}
              <View style={styles.content}>
                <View style={styles.topRow}>
                  <Text style={styles.title} numberOfLines={1}>
                    {reminder.title}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: reminder.isActive
                          ? Colors.success + "22"
                          : Colors.textMuted + "33",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color: reminder.isActive
                            ? Colors.success
                            : Colors.textMuted,
                        },
                      ]}
                    >
                      {reminder.isActive ? Strings.active : Strings.paused}
                    </Text>
                  </View>
                </View>

                <Text style={styles.schedule} numberOfLines={1}>
                  {describeSchedule(reminder.schedule)}
                </Text>

                <View style={styles.bottomRow}>
                  <Text style={styles.days}>
                    {formatActiveDays(reminder.activeDays)}
                  </Text>
                  {nextFire && (
                    <Text style={styles.nextFire}>
                      {Strings.next}: {formatTimeDate(nextFire)}
                    </Text>
                  )}
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    height: CARD_HEIGHT,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    position: "relative",
  },
  cardContainer: {
    ...Shadow.sm,
    borderRadius: Radius.lg,
    overflow: "hidden",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    height: CARD_HEIGHT,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  cardPaused: {
    opacity: 0.6,
  },
  initialAvatar: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.accentMuted,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.accent + "44",
  },
  initialText: {
    fontSize: FontSize.lg,
    fontFamily: "Inter_700Bold",
    color: Colors.accent,
    includeFontPadding: false,
  },
  content: {
    flex: 1,
    gap: 3,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: FontSize.md,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontFamily: "Inter_600SemiBold",
  },
  schedule: {
    fontSize: FontSize.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  days: {
    fontSize: FontSize.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
  },
  nextFire: {
    fontSize: FontSize.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.accent,
  },
  deleteReveal: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: Spacing.md,
  },
  toggleReveal: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "flex-start",
    paddingLeft: Spacing.md,
  },
  deleteAction: {
    alignItems: "center",
    backgroundColor: Colors.danger + "22",
    padding: Spacing.sm,
    borderRadius: Radius.md,
  },
  toggleAction: {
    alignItems: "center",
    backgroundColor: Colors.success + "22",
    padding: Spacing.sm,
    borderRadius: Radius.md,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionLabel: {
    fontSize: FontSize.xs,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
    marginTop: 2,
  },
});

export { CARD_HEIGHT };
