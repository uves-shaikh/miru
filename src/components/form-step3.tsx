import * as Haptics from "expo-haptics";
import React, { memo, useCallback, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MAX_FIXED_TIMES } from "../constants";
import { Strings } from "../constants/strings";
import { Colors, FontSize, Radius, Spacing } from "../constants/theme";
import type { Schedule, TimeValue } from "../types";
import { formatTime } from "../utils";
import { TimePickerModal } from "./time-picker-modal";

interface Step3Props {
  schedule: Schedule;
  onScheduleChange: (schedule: Schedule) => void;
}

// ─── Interval Config ──────────────────────────────────────────────────────────

const IntervalConfig = memo(function IntervalConfig({
  schedule,
  onChange,
}: {
  schedule: Extract<Schedule, { type: "interval" }>;
  onChange: (s: Schedule) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState<"start" | "end" | null>(null);

  const setIntervalMinutes = useCallback(
    (minutes: number) => {
      onChange({ ...schedule, intervalMinutes: minutes });
    },
    [schedule, onChange],
  );

  const isHours = schedule.intervalMinutes >= 60;
  const value = isHours
    ? schedule.intervalMinutes / 60
    : schedule.intervalMinutes;

  const increment = useCallback(() => {
    Haptics.selectionAsync();
    const next = isHours
      ? Math.min(schedule.intervalMinutes + 60, 1440)
      : Math.min(schedule.intervalMinutes + 15, 55);
    setIntervalMinutes(next);
  }, [isHours, schedule.intervalMinutes, setIntervalMinutes]);

  const decrement = useCallback(() => {
    Haptics.selectionAsync();
    const next = isHours
      ? Math.max(schedule.intervalMinutes - 60, 60)
      : Math.max(schedule.intervalMinutes - 15, 15);
    setIntervalMinutes(next);
  }, [isHours, schedule.intervalMinutes, setIntervalMinutes]);

  const toggleUnit = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isHours) {
      onChange({ ...schedule, intervalMinutes: 30 });
    } else {
      onChange({ ...schedule, intervalMinutes: 60 });
    }
  }, [isHours, schedule, onChange]);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{Strings.everyLabel}</Text>
      <View style={styles.stepper}>
        <TouchableOpacity style={styles.stepBtn} onPress={decrement}>
          <Text style={styles.stepBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.stepValue}>{value}</Text>
        <TouchableOpacity style={styles.stepBtn} onPress={increment}>
          <Text style={styles.stepBtnText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.unitBtn} onPress={toggleUnit}>
          <Text style={styles.unitText}>
            {isHours ? Strings.hours : Strings.minutes}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionLabel, { marginTop: Spacing.md }]}>
        {Strings.between}
      </Text>
      <View style={styles.timeRange}>
        <TouchableOpacity
          style={styles.timeBtn}
          onPress={() => setPickerOpen("start")}
        >
          <Text style={styles.timeBtnText}>
            {formatTime(schedule.startTime)}
          </Text>
        </TouchableOpacity>
        <Text style={styles.timeSep}>{Strings.and}</Text>
        <TouchableOpacity
          style={styles.timeBtn}
          onPress={() => setPickerOpen("end")}
        >
          <Text style={styles.timeBtnText}>{formatTime(schedule.endTime)}</Text>
        </TouchableOpacity>
      </View>

      <TimePickerModal
        visible={pickerOpen === "start"}
        value={schedule.startTime}
        onConfirm={(v) => {
          onChange({ ...schedule, startTime: v });
          setPickerOpen(null);
        }}
        onCancel={() => setPickerOpen(null)}
        title="Start time"
      />
      <TimePickerModal
        visible={pickerOpen === "end"}
        value={schedule.endTime}
        onConfirm={(v) => {
          onChange({ ...schedule, endTime: v });
          setPickerOpen(null);
        }}
        onCancel={() => setPickerOpen(null)}
        title="End time"
      />
    </View>
  );
});

// ─── Fixed Times Config ───────────────────────────────────────────────────────

const FixedConfig = memo(function FixedConfig({
  schedule,
  onChange,
}: {
  schedule: Extract<Schedule, { type: "fixed" }>;
  onChange: (s: Schedule) => void;
}) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const addTime = useCallback(() => {
    if (schedule.times.length >= MAX_FIXED_TIMES) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newTimes = [...schedule.times, { hour: 9, minute: 0 }];
    onChange({ ...schedule, times: newTimes });
    setEditingIndex(newTimes.length - 1);
  }, [schedule, onChange]);

  const removeTime = useCallback(
    (idx: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onChange({
        ...schedule,
        times: schedule.times.filter((_, i) => i !== idx),
      });
    },
    [schedule, onChange],
  );

  const updateTime = useCallback(
    (idx: number, time: TimeValue) => {
      const newTimes = [...schedule.times];
      newTimes[idx] = time;
      onChange({ ...schedule, times: newTimes });
    },
    [schedule, onChange],
  );

  return (
    <View style={styles.section}>
      {schedule.times.map((time, idx) => (
        <View key={idx} style={styles.fixedTimeRow}>
          <TouchableOpacity
            style={styles.timeBtn}
            onPress={() => setEditingIndex(idx)}
          >
            <Text style={styles.timeBtnText}>{formatTime(time)}</Text>
          </TouchableOpacity>
          {schedule.times.length > 1 && (
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => removeTime(idx)}
            >
              <Text style={styles.removeBtnText}>×</Text>
            </TouchableOpacity>
          )}
          <TimePickerModal
            visible={editingIndex === idx}
            value={time}
            onConfirm={(v) => {
              updateTime(idx, v);
              setEditingIndex(null);
            }}
            onCancel={() => setEditingIndex(null)}
            title={`Time ${idx + 1}`}
          />
        </View>
      ))}
      {schedule.times.length < MAX_FIXED_TIMES && (
        <TouchableOpacity style={styles.addTimeBtn} onPress={addTime}>
          <Text style={styles.addTimeBtnText}>{Strings.addTime}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

// ─── Main Step 3 ─────────────────────────────────────────────────────────────

export const Step3Configure = memo(function Step3Configure({
  schedule,
  onScheduleChange,
}: Step3Props) {
  if (schedule.type === "interval") {
    return <IntervalConfig schedule={schedule} onChange={onScheduleChange} />;
  }
  return <FixedConfig schedule={schedule} onChange={onScheduleChange} />;
});

const styles = StyleSheet.create({
  section: {
    gap: Spacing.sm,
  },
  sectionLabel: {
    fontSize: FontSize.sm,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textSecondary,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceHigh,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepBtnText: {
    fontSize: FontSize.xl,
    color: Colors.text,
    fontFamily: "Inter_600SemiBold",
  },
  stepValue: {
    fontSize: FontSize.xxl,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
    minWidth: 50,
    textAlign: "center",
  },
  unitBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.accentMuted,
    borderWidth: 1,
    borderColor: Colors.accent + "44",
  },
  unitText: {
    fontSize: FontSize.sm,
    fontFamily: "Inter_600SemiBold",
    color: Colors.accent,
  },
  timeRange: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  timeBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceHigh,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeBtnText: {
    fontSize: FontSize.xl,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
    letterSpacing: 1,
  },
  timeSep: {
    fontSize: FontSize.md,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  fixedTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  removeBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: "rgba(239,68,68,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  removeBtnText: {
    fontSize: FontSize.xl,
    color: Colors.danger,
    fontFamily: "Inter_700Bold",
  },
  addTimeBtn: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: Colors.accent,
    alignItems: "center",
  },
  addTimeBtnText: {
    fontSize: FontSize.md,
    fontFamily: "Inter_600SemiBold",
    color: Colors.accent,
  },
});
