import * as Haptics from "expo-haptics";
import React, { memo, useCallback } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors, FontSize, Radius, Spacing } from "../constants/theme";
import type { DayOfWeek } from "../types";
import { allDays, getDayLabel } from "../utils";

interface Step4Props {
  activeDays: DayOfWeek[];
  onActiveDaysChange: (days: DayOfWeek[]) => void;
}

export const Step4Days = memo(function Step4Days({
  activeDays,
  onActiveDaysChange,
}: Step4Props) {
  const toggleDay = useCallback(
    (day: DayOfWeek) => {
      Haptics.selectionAsync();
      if (activeDays.includes(day)) {
        // Don't allow removing last day
        if (activeDays.length === 1) return;
        onActiveDaysChange(activeDays.filter((d) => d !== day));
      } else {
        onActiveDaysChange(
          [...activeDays, day].sort((a, b) => a - b) as DayOfWeek[],
        );
      }
    },
    [activeDays, onActiveDaysChange],
  );

  const selectAll = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onActiveDaysChange(allDays());
  }, [onActiveDaysChange]);

  const days = allDays();

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {days.map((day) => {
          const isSelected = activeDays.includes(day);
          return (
            <TouchableOpacity
              key={day}
              style={[styles.dayBtn, isSelected && styles.dayBtnSelected]}
              onPress={() => toggleDay(day)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected }}
            >
              <Text
                style={[styles.dayText, isSelected && styles.dayTextSelected]}
              >
                {getDayLabel(day)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {activeDays.length < 7 && (
        <TouchableOpacity style={styles.selectAllBtn} onPress={selectAll}>
          <Text style={styles.selectAllText}>Select all days</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  dayBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceHigh,
  },
  dayBtnSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  dayText: {
    fontSize: FontSize.sm,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textSecondary,
  },
  dayTextSelected: {
    color: Colors.text,
  },
  selectAllBtn: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  selectAllText: {
    fontSize: FontSize.sm,
    fontFamily: "Inter_600SemiBold",
    color: Colors.accent,
  },
});
