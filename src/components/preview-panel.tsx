import React, { memo, useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Strings } from "../constants/strings";
import { Colors, FontSize, Radius, Spacing } from "../constants/theme";
import { calculateFireDates } from "../hooks/use-notifications";
import type { DayOfWeek, Reminder, Schedule } from "../types";
import { formatTimeDate } from "../utils";

interface PreviewPanelProps {
  title: string;
  description: string;
  schedule: Schedule;
  activeDays: DayOfWeek[];
}

export const PreviewPanel = memo(function PreviewPanel({
  title,
  description,
  schedule,
  activeDays,
}: PreviewPanelProps) {
  // Create a temporary reminder to calculate fire times
  const tempReminder: Reminder = useMemo(
    () => ({
      id: "preview",
      title: title || "My Reminder",
      description,
      schedule,
      activeDays,
      isActive: true,
      notificationIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }),
    [title, description, schedule, activeDays],
  );

  const todayFires = useMemo(() => {
    const all = calculateFireDates(tempReminder);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return all.filter((d) => d >= today && d < tomorrow);
  }, [tempReminder]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>📋</Text>
        <Text style={styles.headerText}>{Strings.previewTitle}</Text>
        <Text style={styles.count}>{todayFires.length}</Text>
        <Text style={styles.headerText}>{Strings.previewNotifications}</Text>
      </View>

      {todayFires.length > 0 ? (
        <ScrollView
          style={styles.timeList}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {todayFires.slice(0, 8).map((date, i) => (
            <View key={i} style={styles.timePill}>
              <Text style={styles.timePillText}>{formatTimeDate(date)}</Text>
            </View>
          ))}
          {todayFires.length > 8 && (
            <View style={styles.timePill}>
              <Text style={styles.timePillText}>
                +{todayFires.length - 8} more
              </Text>
            </View>
          )}
        </ScrollView>
      ) : (
        <Text style={styles.noFires}>No notifications scheduled for today</Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfaceHigh,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    flexWrap: "wrap",
  },
  headerEmoji: {
    fontSize: FontSize.md,
  },
  headerText: {
    fontSize: FontSize.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  count: {
    fontSize: FontSize.md,
    fontFamily: "Inter_700Bold",
    color: Colors.accent,
  },
  timeList: {
    flexGrow: 0,
  },
  timePill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    backgroundColor: Colors.accentMuted,
    borderWidth: 1,
    borderColor: Colors.accent + "33",
    marginRight: Spacing.xs,
  },
  timePillText: {
    fontSize: FontSize.xs,
    fontFamily: "Inter_600SemiBold",
    color: Colors.accentSoft,
  },
  noFires: {
    fontSize: FontSize.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
    fontStyle: "italic",
  },
});
