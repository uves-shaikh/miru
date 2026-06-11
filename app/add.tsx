import * as Haptics from "expo-haptics";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { ErrorBoundary } from "../src/components/error-boundary";
import { Step1BasicInfo } from "../src/components/form-step1";
import { Step2ScheduleType } from "../src/components/form-step2";
import { Step3Configure } from "../src/components/form-step3";
import { Step4Days } from "../src/components/form-step4";
import { InfoModal } from "../src/components/info-modal";
import { PreviewPanel } from "../src/components/preview-panel";
import { Strings } from "../src/constants/strings";
import {
  Colors,
  FontSize,
  Radius,
  Shadow,
  Spacing,
} from "../src/constants/theme";
import { useReminderActions } from "../src/context/app-context";
import { useToast } from "../src/context/toast-context";
import { useNotifications } from "../src/hooks/use-notifications";
import type { DayOfWeek, Schedule } from "../src/types";
import { allDays, createReminder } from "../src/utils";

const STEPS = [
  Strings.step1Title,
  Strings.step2Title,
  Strings.step3Title,
  Strings.step4Title,
];

const DEFAULT_SCHEDULE: Schedule = {
  type: "interval",
  intervalMinutes: 60,
  startTime: { hour: 9, minute: 0 },
  endTime: { hour: 21, minute: 0 },
};

function AddContent() {
  const router = useRouter();
  const { addReminder } = useReminderActions();
  const { scheduleForReminder } = useNotifications();
  const { showToast } = useToast();

  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [schedule, setSchedule] = useState<Schedule>(DEFAULT_SCHEDULE);
  const [activeDays, setActiveDays] = useState<DayOfWeek[]>(allDays());
  const [saving, setSaving] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const buttonScale = useSharedValue(1);
  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  // Reset form every time this screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setStep(0);
      setTitle("");
      setDescription("");
      setSchedule(DEFAULT_SCHEDULE);
      setActiveDays(allDays());
      setSaving(false);
    }, []),
  );

  const handleNext = useCallback(() => {
    // Validate step 1
    if (step === 0 && !title.trim()) {
      setInfoMessage(Strings.validationTitle);
      return;
    }
    // Validate step 3 fixed
    if (
      step === 2 &&
      schedule.type === "fixed" &&
      schedule.times.length === 0
    ) {
      setInfoMessage(Strings.validationTimes);
      return;
    }
    // Validate step 4
    if (step === 3 && activeDays.length === 0) {
      setInfoMessage(Strings.validationDays);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    }
  }, [step, title, schedule, activeDays]);

  const handleBack = useCallback(() => {
    if (step > 0) {
      Haptics.selectionAsync();
      setStep((s) => s - 1);
    } else {
      router.back();
    }
  }, [step, router]);

  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      setInfoMessage(Strings.validationTitle);
      return;
    }
    if (activeDays.length === 0) {
      setInfoMessage(Strings.validationDays);
      return;
    }

    buttonScale.value = withSpring(0.95, {}, () => {
      buttonScale.value = withSpring(1);
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSaving(true);

    try {
      const partial = { title, description, schedule, activeDays };
      const reminder = createReminder(partial);
      const scheduled = await scheduleForReminder(reminder);
      addReminder(scheduled);
      showToast("success", "Reminder saved!", `"${title}" is all set.`);
      router.replace("/(tabs)");
    } catch {
      showToast("error", Strings.errorTitle, Strings.errorSave);
    } finally {
      setSaving(false);
    }
  }, [
    title,
    description,
    schedule,
    activeDays,
    scheduleForReminder,
    addReminder,
    router,
    buttonScale,
    showToast,
  ]);

  const isLastStep = step === STEPS.length - 1;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{Strings.addReminder}</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Step progress */}
      <View style={styles.progress}>
        {STEPS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.progressDot,
              i === step && styles.progressDotActive,
              i < step && styles.progressDotDone,
            ]}
          />
        ))}
      </View>

      {/* Step title */}
      <Text style={styles.stepTitle}>{STEPS[step]}</Text>

      {/* Step content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {step === 0 && (
          <Step1BasicInfo
            title={title}
            description={description}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
          />
        )}
        {step === 1 && (
          <Step2ScheduleType
            scheduleType={schedule.type}
            onScheduleTypeChange={(type) => {
              if (type === "interval") setSchedule(DEFAULT_SCHEDULE);
              else
                setSchedule({ type: "fixed", times: [{ hour: 9, minute: 0 }] });
            }}
          />
        )}
        {step === 2 && (
          <Step3Configure schedule={schedule} onScheduleChange={setSchedule} />
        )}
        {step === 3 && (
          <>
            <Step4Days
              activeDays={activeDays}
              onActiveDaysChange={setActiveDays}
            />
            <View style={{ height: Spacing.lg }} />
            <PreviewPanel
              title={title}
              description={description}
              schedule={schedule}
              activeDays={activeDays}
            />
          </>
        )}

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      {/* Actions */}
      <View style={styles.actions}>
        {isLastStep ? (
          <Animated.View style={[styles.saveBtn, buttonStyle]}>
            <TouchableOpacity
              style={styles.saveBtnInner}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveBtnText}>
                {saving ? "Saving..." : Strings.saveButton}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
            <Text style={styles.nextBtnText}>{Strings.nextButton}</Text>
          </TouchableOpacity>
        )}
      </View>

      <InfoModal
        visible={infoMessage !== null}
        message={infoMessage ?? ""}
        variant="warning"
        onDismiss={() => setInfoMessage(null)}
      />
    </KeyboardAvoidingView>
  );
}

export default function AddScreen() {
  return (
    <ErrorBoundary>
      <AddContent />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnText: {
    fontSize: FontSize.xl,
    color: Colors.text,
    fontFamily: "Inter_400Regular",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: FontSize.lg,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
  headerRight: {
    width: 40,
  },
  progress: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.border,
  },
  progressDotActive: {
    backgroundColor: Colors.accent,
    width: 24,
  },
  progressDotDone: {
    backgroundColor: Colors.accentSoft,
  },
  stepTitle: {
    fontSize: FontSize.xxl,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  actions: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  nextBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    alignItems: "center",
    ...Shadow.md,
  },
  nextBtnText: {
    fontSize: FontSize.md,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
  saveBtn: {
    borderRadius: Radius.lg,
    overflow: "hidden",
    ...Shadow.lg,
  },
  saveBtnInner: {
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.md,
    alignItems: "center",
  },
  saveBtnText: {
    fontSize: FontSize.md,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
});
