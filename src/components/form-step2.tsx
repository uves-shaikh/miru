import * as Haptics from "expo-haptics";
import React, { memo, useCallback } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Strings } from "../constants/strings";
import { Colors, FontSize, Radius, Spacing } from "../constants/theme";
import type { ScheduleType } from "../types";

interface Step2Props {
  scheduleType: ScheduleType;
  onScheduleTypeChange: (type: ScheduleType) => void;
}

const OPTIONS: Array<{
  id: ScheduleType;
  emoji: string;
  title: string;
  description: string;
  example: string;
}> = [
  {
    id: "interval",
    emoji: "🔁",
    title: Strings.scheduleInterval.replace("🔁 ", ""),
    description: "Repeats every X minutes or hours within a time window",
    example: "e.g. every 30 min, 9 AM – 6 PM",
  },
  {
    id: "fixed",
    emoji: "📌",
    title: Strings.scheduleFixed.replace("📌 ", ""),
    description: "Fires at one or more exact times you choose",
    example: "e.g. 8:00 AM, 1:00 PM, 9:00 PM",
  },
];

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const OptionCard = memo(function OptionCard({
  option,
  isSelected,
  onSelect,
}: {
  option: (typeof OPTIONS)[0];
  isSelected: boolean;
  onSelect: () => void;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = useCallback(() => {
    scale.value = withSpring(0.96, { damping: 14 }, () => {
      scale.value = withSpring(1, { damping: 14 });
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect();
  }, [scale, onSelect]);

  return (
    <AnimatedTouchable
      style={[styles.card, isSelected && styles.cardSelected, animStyle]}
      onPress={handlePress}
      activeOpacity={1}
    >
      {/* Top row: emoji + check */}
      <View style={styles.cardTop}>
        <View
          style={[styles.iconBadge, isSelected && styles.iconBadgeSelected]}
        >
          <Text style={styles.emoji}>{option.emoji}</Text>
        </View>
        <View style={[styles.check, isSelected && styles.checkSelected]}>
          {isSelected && <Text style={styles.checkText}>✓</Text>}
        </View>
      </View>

      {/* Text */}
      <View style={styles.cardBody}>
        <Text
          style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}
        >
          {option.title}
        </Text>
        <Text style={styles.cardDescription}>{option.description}</Text>
        <Text style={styles.cardExample}>{option.example}</Text>
      </View>
    </AnimatedTouchable>
  );
});

export const Step2ScheduleType = memo(function Step2ScheduleType({
  scheduleType,
  onScheduleTypeChange,
}: Step2Props) {
  return (
    <View style={styles.container}>
      {OPTIONS.map((opt) => (
        <OptionCard
          key={opt.id}
          option={opt}
          isSelected={scheduleType === opt.id}
          onSelect={() => onScheduleTypeChange(opt.id)}
        />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  card: {
    backgroundColor: Colors.surfaceHigh,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  cardSelected: {
    borderColor: Colors.accent,
    backgroundColor: "rgba(99,102,241,0.08)",
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBadgeSelected: {
    backgroundColor: Colors.accentMuted,
    borderColor: Colors.accent + "55",
  },
  emoji: {
    fontSize: 24,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: Radius.full,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  checkText: {
    fontSize: FontSize.xs,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
    lineHeight: 14,
  },
  cardBody: {
    gap: 4,
  },
  cardTitle: {
    fontSize: FontSize.lg,
    fontFamily: "Inter_700Bold",
    color: Colors.textSecondary,
  },
  cardTitleSelected: {
    color: Colors.text,
  },
  cardDescription: {
    fontSize: FontSize.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  cardExample: {
    fontSize: FontSize.xs,
    fontFamily: "Inter_600SemiBold",
    color: Colors.accentSoft,
    marginTop: 2,
  },
});
