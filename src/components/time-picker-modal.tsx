import * as Haptics from "expo-haptics";
import React, { memo, useCallback, useEffect, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors, FontSize, Radius, Spacing } from "../constants/theme";
import type { TimeValue } from "../types";
import { ScrollPicker } from "./scroll-picker";

interface TimePickerModalProps {
  visible: boolean;
  value: TimeValue;
  onConfirm: (value: TimeValue) => void;
  onCancel: () => void;
  title?: string;
}

// 1 – 12
const HOURS_12 = Array.from({ length: 12 }, (_, i) =>
  (i + 1).toString().padStart(2, "0"),
);
const MINUTES = Array.from({ length: 60 }, (_, i) =>
  i.toString().padStart(2, "0"),
);
const AMPM = ["AM", "PM"];

/** Convert a 24h hour to a 12h index (0-based, 0 = '01', 11 = '12') */
function to12hIndex(hour24: number): { hourIdx: number; ampmIdx: number } {
  const ampmIdx = hour24 < 12 ? 0 : 1;
  const h12 = hour24 % 12; // 0 for midnight/noon → maps to 12 = index 11
  const hourIdx = h12 === 0 ? 11 : h12 - 1; // index 0 = '01', index 11 = '12'
  return { hourIdx, ampmIdx };
}

/** Convert 12h picker state back to a 24h hour */
function to24h(hourIdx: number, ampmIdx: number): number {
  const h12 = hourIdx + 1; // index 0 → 1, index 11 → 12
  if (ampmIdx === 0) {
    // AM
    return h12 === 12 ? 0 : h12; // 12 AM → 0
  } else {
    // PM
    return h12 === 12 ? 12 : h12 + 12; // 12 PM → 12, 1 PM → 13
  }
}

export const TimePickerModal = memo(function TimePickerModal({
  visible,
  value,
  onConfirm,
  onCancel,
  title = "Select Time",
}: TimePickerModalProps) {
  const { hourIdx: initHourIdx, ampmIdx: initAmpmIdx } = to12hIndex(value.hour);
  const [selectedHourIdx, setSelectedHourIdx] = useState(initHourIdx);
  const [selectedMinute, setSelectedMinute] = useState(value.minute);
  const [selectedAmpm, setSelectedAmpm] = useState(initAmpmIdx);

  useEffect(() => {
    if (visible) {
      const { hourIdx, ampmIdx } = to12hIndex(value.hour);
      setSelectedHourIdx(hourIdx);
      setSelectedMinute(value.minute);
      setSelectedAmpm(ampmIdx);
    }
  }, [visible, value]);

  const handleConfirm = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onConfirm({
      hour: to24h(selectedHourIdx, selectedAmpm),
      minute: selectedMinute,
    });
  }, [selectedHourIdx, selectedMinute, selectedAmpm, onConfirm]);

  const handleHourSelect = useCallback((idx: number) => {
    setSelectedHourIdx(idx);
    Haptics.selectionAsync();
  }, []);

  const handleMinuteSelect = useCallback((idx: number) => {
    setSelectedMinute(idx);
    Haptics.selectionAsync();
  }, []);

  const handleAmpmSelect = useCallback((idx: number) => {
    setSelectedAmpm(idx);
    Haptics.selectionAsync();
  }, []);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onCancel}
        />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <Text style={styles.title}>{title}</Text>

          <View style={styles.pickerRow}>
            <ScrollPicker
              data={HOURS_12}
              selectedIndex={selectedHourIdx}
              onSelect={handleHourSelect}
            />
            <Text style={styles.colon}>:</Text>
            <ScrollPicker
              data={MINUTES}
              selectedIndex={selectedMinute}
              onSelect={handleMinuteSelect}
            />
            <View style={styles.ampmSpacer} />
            <ScrollPicker
              data={AMPM}
              selectedIndex={selectedAmpm}
              onSelect={handleAmpmSelect}
            />
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
              <Text style={styles.confirmText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: Radius.full,
    alignSelf: "center",
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.lg,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  colon: {
    fontSize: FontSize.hero,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
    marginHorizontal: Spacing.xs,
  },
  ampmSpacer: {
    width: Spacing.sm,
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  cancelText: {
    fontSize: FontSize.md,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textSecondary,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.accent,
    alignItems: "center",
  },
  confirmText: {
    fontSize: FontSize.md,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
});
