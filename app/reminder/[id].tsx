import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
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
import { ConfirmDeleteModal } from "../../src/components/confirm-delete-modal";
import { ErrorBoundary } from "../../src/components/error-boundary";
import { Step1BasicInfo } from "../../src/components/form-step1";
import { Step2ScheduleType } from "../../src/components/form-step2";
import { Step3Configure } from "../../src/components/form-step3";
import { Step4Days } from "../../src/components/form-step4";
import { InfoModal } from "../../src/components/info-modal";
import { PreviewPanel } from "../../src/components/preview-panel";
import { Strings } from "../../src/constants/strings";
import {
  Colors,
  FontSize,
  Radius,
  Shadow,
  Spacing,
} from "../../src/constants/theme";
import { useAppState, useReminderActions } from "../../src/context/app-context";
import { useToast } from "../../src/context/toast-context";
import {
  cancelReminderNotifications,
  useNotifications,
} from "../../src/hooks/use-notifications";
import type { DayOfWeek, Schedule } from "../../src/types";

const STEPS = [
  Strings.step1Title,
  Strings.step2Title,
  Strings.step3Title,
  Strings.step4Title,
];

function EditContent() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { reminders } = useAppState();
  const { updateReminder, deleteReminder } = useReminderActions();
  const { scheduleForReminder } = useNotifications();
  const { showToast } = useToast();

  const reminder = reminders.find((r) => r.id === id);

  const [step, setStep] = useState(0);
  const [title, setTitle] = useState(reminder?.title ?? "");
  const [description, setDescription] = useState(reminder?.description ?? "");
  const [schedule, setSchedule] = useState<Schedule>(
    reminder?.schedule ?? {
      type: "interval",
      intervalMinutes: 60,
      startTime: { hour: 9, minute: 0 },
      endTime: { hour: 21, minute: 0 },
    },
  );
  const [activeDays, setActiveDays] = useState<DayOfWeek[]>(
    reminder?.activeDays ?? [1, 2, 3, 4, 5],
  );
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const buttonScale = useSharedValue(1);
  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleNext = useCallback(() => {
    if (step === 0 && !title.trim()) {
      setInfoMessage(Strings.validationTitle);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < STEPS.length - 1) setStep((s) => s + 1);
  }, [step, title]);

  const handleBack = useCallback(() => {
    if (step > 0) {
      Haptics.selectionAsync();
      setStep((s) => s - 1);
    } else {
      router.back();
    }
  }, [step, router]);

  const handleDelete = useCallback(() => {
    if (!reminder) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowDeleteModal(true);
  }, [reminder]);

  const handleConfirmDelete = useCallback(async () => {
    if (!reminder) return;
    setShowDeleteModal(false);
    await cancelReminderNotifications(reminder.notificationIds);
    deleteReminder(reminder.id);
    showToast("info", "Reminder deleted", `"${reminder.title}" was removed.`);
    router.replace("/(tabs)/reminders");
  }, [reminder, deleteReminder, showToast, router]);

  const handleSave = useCallback(async () => {
    if (!reminder) return;
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
      const updated = {
        ...reminder,
        title,
        description,
        schedule,
        activeDays,
        updatedAt: Date.now(),
      };
      const scheduled = await scheduleForReminder(updated);
      updateReminder(scheduled);
      showToast("success", "Reminder updated!", `"${title}" has been updated.`);
      router.back();
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
    reminder,
    scheduleForReminder,
    updateReminder,
    router,
    buttonScale,
    showToast,
  ]);

  const isLastStep = step === STEPS.length - 1;

  // ── Early return AFTER all hooks are called ──────────────────────────────────
  if (!reminder) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Reminder not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>← Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>{Strings.editReminder}</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
          <Feather name="trash-2" size={20} color={Colors.danger} />
        </TouchableOpacity>
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

      <Text style={styles.stepTitle}>{STEPS[step]}</Text>

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
              if (type === "interval")
                setSchedule({
                  type: "interval",
                  intervalMinutes: 60,
                  startTime: { hour: 9, minute: 0 },
                  endTime: { hour: 21, minute: 0 },
                });
              else if (type === "fixed")
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

      <View style={styles.actions}>
        {isLastStep ? (
          <Animated.View style={[styles.saveBtn, buttonStyle]}>
            <TouchableOpacity
              style={styles.saveBtnInner}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveBtnText}>
                {saving ? "Saving..." : Strings.updateButton}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
            <Text style={styles.nextBtnText}>{Strings.nextButton}</Text>
          </TouchableOpacity>
        )}
      </View>

      <ConfirmDeleteModal
        visible={showDeleteModal}
        title={`Delete "${reminder.title}"?`}
        message="This reminder and all its scheduled notifications will be permanently removed. This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      <InfoModal
        visible={infoMessage !== null}
        message={infoMessage ?? ""}
        variant="warning"
        onDismiss={() => setInfoMessage(null)}
      />
    </KeyboardAvoidingView>
  );
}

export default function EditReminderScreen() {
  return (
    <ErrorBoundary>
      <EditContent />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    paddingTop: 60,
  },
  notFound: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
  },
  notFoundText: {
    fontSize: FontSize.lg,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textSecondary,
  },
  backLink: {
    fontSize: FontSize.md,
    fontFamily: "Inter_600SemiBold",
    color: Colors.accent,
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
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: FontSize.lg,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
  deleteBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: "rgba(239,68,68,0.12)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtnText: {
    fontSize: FontSize.md,
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
