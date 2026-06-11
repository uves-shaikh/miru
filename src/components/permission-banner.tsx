import React, { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Strings } from "../constants/strings";
import { Colors, FontSize, Radius, Spacing } from "../constants/theme";

interface PermissionBannerProps {
  onPress?: () => void;
}

export const PermissionBanner = memo(function PermissionBanner({
  onPress,
}: PermissionBannerProps) {
  return (
    <View style={styles.banner}>
      <Text style={styles.icon}>🔕</Text>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{Strings.errorPermissionDenied}</Text>
        <Text style={styles.desc}>{Strings.errorPermissionDesc}</Text>
      </View>
      {onPress && (
        <TouchableOpacity onPress={onPress} style={styles.action}>
          <Text style={styles.actionText}>Open</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239,68,68,0.12)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.25)",
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  icon: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.sm,
    fontFamily: "Inter_600SemiBold",
    color: Colors.danger,
  },
  desc: {
    fontSize: FontSize.xs,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    marginTop: 2,
  },
  action: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.danger,
    borderRadius: Radius.sm,
  },
  actionText: {
    color: Colors.text,
    fontSize: FontSize.xs,
    fontFamily: "Inter_600SemiBold",
  },
});
