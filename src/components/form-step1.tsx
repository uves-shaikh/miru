import React, { memo } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Strings } from "../constants/strings";
import { Colors, FontSize, Radius, Spacing } from "../constants/theme";

interface Step1Props {
  title: string;
  description: string;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (desc: string) => void;
}

export const Step1BasicInfo = memo(function Step1BasicInfo({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
}: Step1Props) {
  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.label}>{Strings.titleLabel}</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={onTitleChange}
        placeholder={Strings.titlePlaceholder}
        placeholderTextColor={Colors.textMuted}
        maxLength={50}
        returnKeyType="next"
        autoFocus
      />

      {/* Description */}
      <Text style={styles.label}>{Strings.descriptionLabel}</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={description}
        onChangeText={onDescriptionChange}
        placeholder={Strings.descriptionPlaceholder}
        placeholderTextColor={Colors.textMuted}
        maxLength={200}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  label: {
    fontSize: FontSize.sm,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.surfaceHigh,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    color: Colors.text,
    fontFamily: "Inter_400Regular",
    fontSize: FontSize.md,
  },
  multiline: {
    minHeight: 80,
  },
});
