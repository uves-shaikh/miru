import { Feather } from "@expo/vector-icons";
import React, { useEffect } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Colors, FontSize, Radius, Spacing } from "../constants/theme";

interface ConfirmDeleteModalProps {
  visible: boolean;
  title?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDeleteModal({
  visible,
  title = "Delete Reminder",
  message = "This reminder and all its scheduled notifications will be permanently removed.",
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  const scale = useSharedValue(0.88);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 18, stiffness: 260 });
      opacity.value = withTiming(1, { duration: 180 });
    } else {
      scale.value = withSpring(0.88, { damping: 18, stiffness: 260 });
      opacity.value = withTiming(0, { duration: 150 });
    }
  }, [visible, scale, opacity]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <Animated.View style={[styles.sheet, sheetStyle]}>
              {/* Icon */}
              <View style={styles.iconWrap}>
                <Feather name="trash-2" size={28} color={Colors.danger} />
              </View>

              {/* Title */}
              <Text style={styles.title}>{title}</Text>

              {/* Message */}
              <Text style={styles.message}>{message}</Text>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={onCancel}
                  activeOpacity={0.75}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <View style={styles.actionDivider} />

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={onConfirm}
                  activeOpacity={0.75}
                >
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.72)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  sheet: {
    width: "100%",
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    // shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 16,
  },
  iconWrap: {
    alignItems: "center",
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  iconEmoji: {
    fontSize: 44,
  },
  title: {
    fontSize: FontSize.lg,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
    textAlign: "center",
    paddingHorizontal: Spacing.lg,
  },
  message: {
    fontSize: FontSize.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  actions: {
    flexDirection: "row",
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontSize: FontSize.md,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textSecondary,
  },
  actionDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  deleteBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteText: {
    fontSize: FontSize.md,
    fontFamily: "Inter_700Bold",
    color: Colors.danger,
  },
});
