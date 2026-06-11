import React, { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  Path,
  RadialGradient,
  Stop,
} from "react-native-svg";
import { Colors, FontSize, Spacing } from "../constants/theme";

interface EmptyStateProps {
  title: string;
  subtitle?: string;
}

export const EmptyState = memo(function EmptyState({
  title,
  subtitle,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {/* SVG illustration — no PNG/JPG assets */}
      <Svg width={200} height={180} viewBox="0 0 200 180">
        <Defs>
          <RadialGradient id="grad" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#6366F1" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Background glow */}
        <Circle cx={100} cy={90} r={80} fill="url(#grad)" />

        {/* Bell body */}
        <Path
          d="M100 30 C75 30 60 50 60 72 L55 110 C55 114 58 117 62 117 L138 117 C142 117 145 114 145 110 L140 72 C140 50 125 30 100 30Z"
          fill={Colors.surface}
          stroke={Colors.accent}
          strokeWidth={2}
        />

        {/* Bell clapper */}
        <Circle cx={100} cy={124} r={8} fill={Colors.accent} />

        {/* Bell top */}
        <Path
          d="M94 24 Q100 18 106 24"
          fill="none"
          stroke={Colors.accent}
          strokeWidth={2.5}
          strokeLinecap="round"
        />

        {/* Sound waves */}
        <Path
          d="M50 70 Q44 80 50 90"
          fill="none"
          stroke={Colors.accentSoft}
          strokeWidth={2}
          strokeOpacity={0.6}
          strokeLinecap="round"
        />
        <Path
          d="M40 60 Q30 80 40 100"
          fill="none"
          stroke={Colors.accentSoft}
          strokeWidth={2}
          strokeOpacity={0.4}
          strokeLinecap="round"
        />
        <Path
          d="M150 70 Q156 80 150 90"
          fill="none"
          stroke={Colors.accentSoft}
          strokeWidth={2}
          strokeOpacity={0.6}
          strokeLinecap="round"
        />
        <Path
          d="M160 60 Q170 80 160 100"
          fill="none"
          stroke={Colors.accentSoft}
          strokeWidth={2}
          strokeOpacity={0.4}
          strokeLinecap="round"
        />

        {/* Stars / sparkles */}
        <Path
          d="M72 42 L73.5 38 L75 42 L79 43.5 L75 45 L73.5 49 L72 45 L68 43.5Z"
          fill={Colors.accentSoft}
          opacity={0.7}
        />
        <Path
          d="M128 50 L129 47 L130 50 L133 51 L130 52 L129 55 L128 52 L125 51Z"
          fill={Colors.accentSoft}
          opacity={0.5}
        />
      </Svg>

      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
  title: {
    fontSize: FontSize.lg,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
    marginTop: Spacing.md,
    textAlign: "center",
  },
  subtitle: {
    fontSize: FontSize.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: "center",
  },
});
