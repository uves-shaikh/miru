import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from "react-native-reanimated";
import { EmptyState } from "../../src/components/empty-state";
import { ErrorBoundary } from "../../src/components/error-boundary";
import { PermissionBanner } from "../../src/components/permission-banner";
import { Strings } from "../../src/constants/strings";
import {
  Colors,
  FontSize,
  Radius,
  Shadow,
  Spacing,
} from "../../src/constants/theme";
import {
  useAppDispatch,
  useAppState,
  useReminderActions,
} from "../../src/context/app-context";
import {
  getNextFireTime,
  getTodayFireTimes,
  requestNotificationPermission,
  rescheduleAll,
} from "../../src/hooks/use-notifications";
import { formatDate, formatTimeDate, getGreeting } from "../../src/utils";

function HomeContent() {
  const router = useRouter();
  const { reminders, permissionGranted, permissionChecked } = useAppState();
  const dispatch = useAppDispatch();
  const { setReminders } = useReminderActions();
  const [refreshing, setRefreshing] = useState(false);

  // Animated FAB scale
  const fabScale = useSharedValue(0);
  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  useEffect(() => {
    fabScale.value = withDelay(300, withSpring(1, { damping: 12 }));
  }, []);

  // Check permission status on mount
  useEffect(() => {
    async function checkPerm() {
      const granted = await requestNotificationPermission();
      dispatch({ type: "SET_PERMISSION", payload: granted });
      dispatch({ type: "SET_PERMISSION_CHECKED", payload: true });
    }
    checkPerm();
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const updated = await rescheduleAll(reminders);
      setReminders(updated);
    } catch {
      // Silently fail on refresh
    }
    setRefreshing(false);
  }, [reminders, setReminders]);

  const handleFAB = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/add");
  }, [router]);

  const handleReminderPress = useCallback(
    (id: string) => {
      router.push(`/reminder/${id}`);
    },
    [router],
  );

  const activeReminders = useMemo(
    () => reminders.filter((r) => r.isActive),
    [reminders],
  );

  const todayFires = useMemo(() => getTodayFireTimes(reminders), [reminders]);

  const greeting = getGreeting();
  const today = formatDate(new Date());

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.accent}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Permission Banner */}
        {permissionChecked && !permissionGranted && (
          <PermissionBanner onPress={() => Linking.openSettings()} />
        )}

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.date}>{today}</Text>
        </View>

        {/* Today's Schedule */}
        <Text style={styles.sectionTitle}>{Strings.todaySchedule}</Text>
        {todayFires.length > 0 ? (
          <FlatList
            data={todayFires}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item }) => (
              <View style={styles.scheduleChip}>
                <Text style={styles.scheduleChipText}>
                  {formatTimeDate(item)}
                </Text>
              </View>
            )}
            contentContainerStyle={styles.scheduleList}
            style={styles.scheduleFlatList}
          />
        ) : (
          <View style={styles.emptySchedule}>
            <Text style={styles.emptyScheduleText}>
              {Strings.noScheduleToday}
            </Text>
          </View>
        )}

        {/* Active Reminders */}
        <Text style={styles.sectionTitle}>{Strings.activeReminders}</Text>
        {activeReminders.length === 0 ? (
          <EmptyState
            title={Strings.noRemindersYet}
            subtitle={Strings.noRemindersSubtitle}
          />
        ) : (
          activeReminders.map((reminder) => {
            const nextFire = getNextFireTime(reminder);
            return (
              <TouchableOpacity
                key={reminder.id}
                style={styles.reminderRow}
                onPress={() => handleReminderPress(reminder.id)}
                activeOpacity={0.8}
              >
                <View style={styles.initialAvatar}>
                  <Text style={styles.initialText}>
                    {reminder.title.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.reminderContent}>
                  <Text style={styles.reminderTitle}>{reminder.title}</Text>
                  {nextFire && (
                    <Text style={styles.reminderNext}>
                      {Strings.next}: {formatTimeDate(nextFire)}
                    </Text>
                  )}
                </View>
                <View style={styles.activeDot} />
              </TouchableOpacity>
            );
          })
        )}

        {/* Bottom spacing for FAB */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* FAB */}
      <Animated.View style={[styles.fab, fabStyle]}>
        <TouchableOpacity
          onPress={handleFAB}
          style={styles.fabInner}
          accessibilityRole="button"
          accessibilityLabel="Add new reminder"
        >
          <Feather
            name="plus"
            size={32}
            color="#FFFFFF"
            style={{ marginLeft: 1, marginTop: 1 }}
          />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

export default function HomeScreen() {
  return (
    <ErrorBoundary>
      <HomeContent />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: Spacing.xxl,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: FontSize.hero,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
  date: {
    fontSize: FontSize.md,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  scheduleList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  scheduleFlatList: {
    marginBottom: Spacing.lg,
  },
  scheduleChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.accentMuted,
    borderWidth: 1,
    borderColor: Colors.accent + "33",
    marginRight: Spacing.sm,
  },
  scheduleChipText: {
    fontSize: FontSize.sm,
    fontFamily: "Inter_600SemiBold",
    color: Colors.accentSoft,
  },
  emptySchedule: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyScheduleText: {
    fontSize: FontSize.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
    textAlign: "center",
  },
  reminderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
    ...Shadow.sm,
  },
  initialAvatar: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.accentMuted,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.accent + "44",
  },
  initialText: {
    fontSize: FontSize.lg,
    fontFamily: "Inter_700Bold",
    color: Colors.accent,
    includeFontPadding: false,
  },
  reminderContent: {
    flex: 1,
    gap: 3,
  },
  reminderTitle: {
    fontSize: FontSize.md,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  reminderNext: {
    fontSize: FontSize.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.success,
  },
  fab: {
    position: "absolute",
    bottom: 110,
    right: Spacing.lg,
    ...Shadow.lg,
  },
  fabInner: {
    width: 60,
    height: 60,
    borderRadius: Radius.full,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
    ...Shadow.md,
  },
});
