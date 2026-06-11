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

type InfoModalVariant = "warning" | "info" | "error";

interface InfoModalProps {
  visible: boolean;
  title?: string;
  message: string;
  onDismiss: () => void;
  variant?: InfoModalVariant;
  buttonLabel?: string;
}

const VARIANT_CONFIG: Record<
  InfoModalVariant,
  { emoji: string; color: string }
> = {
  warning: { emoji: "⚠️", color: Colors.warning },
  info: { emoji: "ℹ️", color: Colors.accent },
  error: { emoji: "✕", color: Colors.danger },
};

export function InfoModal({
  visible,
  title,
  message,
  onDismiss,
  variant = "warning",
  buttonLabel = "Got it",
}: InfoModalProps) {
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

  const { emoji, color } = VARIANT_CONFIG[variant];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <Animated.View style={[styles.sheet, sheetStyle]}>
              {/* Icon */}
              <View
                style={[styles.iconWrap, { backgroundColor: color + "18" }]}
              >
                <Text style={styles.iconEmoji}>{emoji}</Text>
              </View>

              {/* Title */}
              {title && <Text style={styles.title}>{title}</Text>}

              {/* Message */}
              <Text style={[styles.message, !title && styles.messageNoTitle]}>
                {message}
              </Text>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Action */}
              <TouchableOpacity
                style={styles.btn}
                onPress={onDismiss}
                activeOpacity={0.75}
              >
                <Text style={[styles.btnText, { color }]}>{buttonLabel}</Text>
              </TouchableOpacity>
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 16,
  },
  iconWrap: {
    alignItems: "center",
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
    marginHorizontal: "auto",
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    justifyContent: "center",
    alignSelf: "center",
  },
  iconEmoji: {
    fontSize: 30,
  },
  title: {
    fontSize: FontSize.lg,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
    textAlign: "center",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  message: {
    fontSize: FontSize.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  messageNoTitle: {
    fontSize: FontSize.md,
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  btn: {
    paddingVertical: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    fontSize: FontSize.md,
    fontFamily: "Inter_700Bold",
  },
});
