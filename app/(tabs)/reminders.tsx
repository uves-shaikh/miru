import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from "react-native-reanimated";
import { ConfirmDeleteModal } from "../../src/components/confirm-delete-modal";
import { EmptyState } from "../../src/components/empty-state";
import { ErrorBoundary } from "../../src/components/error-boundary";
import { CARD_HEIGHT, ReminderCard } from "../../src/components/reminder-card";
import { Strings } from "../../src/constants/strings";
import { Colors, FontSize, Radius, Spacing } from "../../src/constants/theme";
import { useAppState, useReminderActions } from "../../src/context/app-context";
import { useToast } from "../../src/context/toast-context";
import {
  cancelReminderNotifications,
  useNotifications,
} from "../../src/hooks/use-notifications";
import type { Reminder, ReminderFilter } from "../../src/types";

const FILTERS: Array<{ key: ReminderFilter; label: string }> = [
  { key: "all", label: Strings.filterAll },
  { key: "active", label: Strings.filterActive },
  { key: "paused", label: Strings.filterPaused },
];

function RemindersContent() {
  const router = useRouter();
  const { reminders } = useAppState();
  const { deleteReminder, updateReminder } = useReminderActions();
  const { scheduleForReminder } = useNotifications();
  const { showToast } = useToast();
  const [filter, setFilter] = useState<ReminderFilter>("all");
  const [search, setSearch] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const fabScale = useSharedValue(0);
  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  useEffect(() => {
    fabScale.value = withDelay(200, withSpring(1, { damping: 12 }));
  }, [fabScale]);

  const handleFAB = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/add");
  }, [router]);

  const filtered = useMemo(() => {
    let list = reminders;
    if (filter === "active") list = list.filter((r) => r.isActive);
    if (filter === "paused") list = list.filter((r) => !r.isActive);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) => r.title.toLowerCase().includes(q));
    }
    return list;
  }, [reminders, filter, search]);

  const handleDelete = useCallback(
    async (id: string) => {
      const reminder = reminders.find((r) => r.id === id);
      if (!reminder) return;
      try {
        await cancelReminderNotifications(reminder.notificationIds);
        deleteReminder(id);
      } catch {
        showToast("error", Strings.errorTitle, Strings.errorNotification);
      }
    },
    [reminders, deleteReminder],
  );

  const handleToggle = useCallback(
    async (id: string) => {
      const reminder = reminders.find((r) => r.id === id);
      if (!reminder) return;
      try {
        const toggled = {
          ...reminder,
          isActive: !reminder.isActive,
          updatedAt: Date.now(),
        };
        const scheduled = await scheduleForReminder(toggled);
        updateReminder(scheduled);
      } catch {
        showToast("error", Strings.errorTitle, Strings.errorNotification);
      }
    },
    [reminders, scheduleForReminder, updateReminder],
  );

  const handleDeleteRequest = useCallback((id: string) => {
    setPendingDeleteId(id);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    setPendingDeleteId(null);
    await handleDelete(id);
  }, [pendingDeleteId, handleDelete]);

  const handleDeleteCancel = useCallback(() => {
    setPendingDeleteId(null);
  }, []);

  const handlePress = useCallback(
    (id: string) => {
      router.push(`/reminder/${id}`);
    },
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: Reminder }) => (
      <ReminderCard
        reminder={item}
        onToggle={handleToggle}
        onDelete={handleDelete}
        onDeleteRequest={handleDeleteRequest}
        onPress={handlePress}
      />
    ),
    [handleToggle, handleDelete, handleDeleteRequest, handlePress],
  );

  const keyExtractor = useCallback((item: Reminder) => item.id, []);

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: CARD_HEIGHT + Spacing.sm,
      offset: (CARD_HEIGHT + Spacing.sm) * index,
      index,
    }),
    [],
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{Strings.allReminders}</Text>
        <Text style={styles.count}>{reminders.length} total</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder={Strings.searchPlaceholder}
          placeholderTextColor={Colors.textMuted}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      {/* Filter chips */}
      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterChip,
              filter === f.key && styles.filterChipActive,
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              setFilter(f.key);
            }}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === f.key && styles.filterChipTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        ListEmptyComponent={
          <EmptyState
            title={Strings.noResults}
            subtitle={
              search
                ? `No reminders matching "${search}"`
                : Strings.noRemindersSubtitle
            }
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Delete confirmation modal */}
      <ConfirmDeleteModal
        visible={pendingDeleteId !== null}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      {/* FAB */}
      <Animated.View style={[styles.fab, fabStyle]}>
        <TouchableOpacity
          onPress={handleFAB}
          style={styles.fabInner}
          accessibilityRole="button"
          accessibilityLabel="Add new reminder"
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

export default function RemindersScreen() {
  return (
    <ErrorBoundary>
      <RemindersContent />
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
    alignItems: "baseline",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  title: {
    fontSize: FontSize.xxl,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
  count: {
    fontSize: FontSize.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  searchIcon: {
    fontSize: FontSize.md,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    color: Colors.text,
    fontFamily: "Inter_400Regular",
    fontSize: FontSize.md,
  },
  filters: {
    flexDirection: "row",
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  filterChipText: {
    fontSize: FontSize.sm,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.text,
  },
  listContent: {
    paddingTop: Spacing.xs,
    paddingBottom: 160,
  },
  fab: {
    position: "absolute",
    bottom: 110,
    right: Spacing.lg,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  fabInner: {
    width: 60,
    height: 60,
    borderRadius: Radius.full,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  fabIcon: {
    fontSize: 30,
    color: Colors.text,
    fontFamily: "Inter_700Bold",
    lineHeight: 30,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
});
