import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  BorderRadius,
  Colors,
  Layout,
  Spacing,
  Typography,
  getCategoryColor,
} from "@/constants/design";
import { useApp } from "@/context/AppContext";
import type { Task, TaskFrequency, TimeOfDay } from "@/types";

type FilterType = "all" | TaskFrequency;

const FILTER_OPTIONS: {
  key: FilterType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: "all", label: "All", icon: "apps-outline" },
  { key: "daily", label: "Daily", icon: "today-outline" },
  { key: "weekly", label: "Weekly", icon: "calendar-outline" },
  { key: "monthly", label: "Monthly", icon: "calendar-number-outline" },
];

const TIME_SECTIONS: {
  key: TimeOfDay;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: "morning", label: "Morning", icon: "sunny-outline" },
  { key: "afternoon", label: "Afternoon", icon: "partly-sunny-outline" },
  { key: "evening", label: "Evening", icon: "moon-outline" },
  { key: "anytime", label: "Anytime", icon: "time-outline" },
];

export default function TasksScreen() {
  const {
    tasks,
    completions,
    currentStreak,
    todayCompletionRate,
    completeTask,
    uncompleteTask,
    deleteTask,
    refreshData,
    getCompletionsForDate,
  } = useApp();

  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const today = new Date().toISOString().split("T")[0];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  const todaysCompletions = useMemo(
    () => getCompletionsForDate(today),
    [getCompletionsForDate, today],
  );

  const isTaskCompleted = useCallback(
    (taskId: string) => todaysCompletions.some((c) => c.taskId === taskId),
    [todaysCompletions],
  );

  const handleToggleTask = useCallback(
    async (task: Task) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (isTaskCompleted(task.id)) {
        await uncompleteTask(task.id);
      } else {
        await completeTask(task.id);
      }
    },
    [isTaskCompleted, completeTask, uncompleteTask],
  );

  const handleDeleteTask = useCallback(
    (task: Task) => {
      Alert.alert(
        "Delete Habit",
        `Are you sure you want to delete "${task.name}"? This action cannot be undone.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Warning,
              );
              await deleteTask(task.id);
              setExpandedTaskId(null);
            },
          },
        ],
      );
    },
    [deleteTask],
  );

  const handleTaskOptions = useCallback(
    (task: Task) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setExpandedTaskId(expandedTaskId === task.id ? null : task.id);
    },
    [expandedTaskId],
  );

  // Filter tasks by frequency
  const filteredTasks = useMemo(() => {
    if (activeFilter === "all") return tasks;
    return tasks.filter((t) => t.frequency === activeFilter);
  }, [tasks, activeFilter]);

  // Group tasks by time of day
  const groupedTasks = useMemo(() => {
    const groups: Record<TimeOfDay, Task[]> = {
      morning: [],
      afternoon: [],
      evening: [],
      anytime: [],
    };

    filteredTasks.forEach((task) => {
      groups[task.timeOfDay].push(task);
    });

    return groups;
  }, [filteredTasks]);

  // Calculate progress for filtered tasks
  const filteredProgress = useMemo(() => {
    if (filteredTasks.length === 0) return 0;
    const completed = filteredTasks.filter((t) => isTaskCompleted(t.id)).length;
    return Math.round((completed / filteredTasks.length) * 100);
  }, [filteredTasks, isTaskCompleted]);

  const completedCount = filteredTasks.filter((t) =>
    isTaskCompleted(t.id),
  ).length;

  const TAB_BAR_HEIGHT = Layout.tabBarHeight;
  const bottomPadding = TAB_BAR_HEIGHT + (Platform.OS === "ios" ? 24 : 16) + 20;

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.surface, Colors.background]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerSubtitle}>Today's</Text>
            <Text style={styles.headerTitle}>Habits</Text>
          </View>
          <Pressable
            style={styles.addButton}
            onPress={() => router.push("/add-task")}
          >
            <LinearGradient
              colors={[Colors.cyberLime, "#B8E600"]}
              style={styles.addButtonGradient}
            >
              <Ionicons name="add" size={22} color={Colors.background} />
            </LinearGradient>
          </Pressable>
        </View>
      </LinearGradient>

      {/* Filter Pills */}
      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
        >
          {FILTER_OPTIONS.map((filter) => (
            <Pressable
              key={filter.key}
              style={[
                styles.filterPill,
                activeFilter === filter.key && styles.filterPillActive,
              ]}
              onPress={() => {
                setActiveFilter(filter.key);
                Haptics.selectionAsync();
              }}
            >
              <Ionicons
                name={filter.icon}
                size={14}
                color={
                  activeFilter === filter.key
                    ? Colors.background
                    : Colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.filterText,
                  activeFilter === filter.key && styles.filterTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: bottomPadding },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.cyberLime}
          />
        }
      >
        {/* Progress Card */}
        <Animated.View entering={FadeInDown.delay(50)}>
          <LinearGradient
            colors={["rgba(205, 255, 0, 0.1)", "rgba(205, 255, 0, 0.02)"]}
            style={styles.progressCard}
          >
            <View style={styles.progressHeader}>
              <View style={styles.progressInfo}>
                <Text style={styles.progressLabel}>Daily Progress</Text>
                <Text style={styles.progressValue}>
                  {completedCount}/{filteredTasks.length} completed
                </Text>
              </View>
              <View style={styles.streakBadge}>
                <Ionicons name="flame" size={14} color={Colors.warning} />
                <Text style={styles.streakText}>{currentStreak}</Text>
              </View>
            </View>
            <View style={styles.progressBarBg}>
              <LinearGradient
                colors={[Colors.cyberLime, "#B8E600"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.progressBarFill,
                  { width: `${Math.max(filteredProgress, 2)}%` },
                ]}
              />
            </View>
            <Text style={styles.progressPercent}>{filteredProgress}%</Text>
          </LinearGradient>
        </Animated.View>

        {/* Task Sections */}
        {filteredTasks.length === 0 ? (
          <Animated.View
            entering={FadeInDown.delay(100)}
            style={styles.emptyState}
          >
            <LinearGradient
              colors={[`${Colors.cyberLime}15`, "transparent"]}
              style={styles.emptyStateGradient}
            >
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="checkbox-outline"
                  size={48}
                  color={Colors.cyberLime}
                />
              </View>
              <Text style={styles.emptyTitle}>No habits yet!</Text>
              <Text style={styles.emptySubtitle}>
                Create your first habit to start building better routines
              </Text>
              <Pressable
                style={styles.addFirstButton}
                onPress={() => router.push("/add-task")}
              >
                <LinearGradient
                  colors={[Colors.cyberLime, "#B8E600"]}
                  style={styles.addFirstButtonGradient}
                >
                  <Ionicons name="add" size={18} color={Colors.background} />
                  <Text style={styles.addFirstText}>Create Habit</Text>
                </LinearGradient>
              </Pressable>
            </LinearGradient>
          </Animated.View>
        ) : (
          TIME_SECTIONS.map((section, sectionIndex) => {
            const sectionTasks = groupedTasks[section.key];
            if (sectionTasks.length === 0) return null;

            return (
              <Animated.View
                key={section.key}
                entering={FadeInDown.delay(100 + sectionIndex * 50)}
                style={styles.section}
              >
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconContainer}>
                    <Ionicons
                      name={section.icon}
                      size={16}
                      color={Colors.cyberLime}
                    />
                  </View>
                  <Text style={styles.sectionTitle}>{section.label}</Text>
                  <Text style={styles.sectionCount}>
                    {sectionTasks.filter((t) => isTaskCompleted(t.id)).length}/
                    {sectionTasks.length}
                  </Text>
                </View>

                <View style={styles.tasksList}>
                  {sectionTasks.map((task, index) => {
                    const completed = isTaskCompleted(task.id);
                    const categoryColor = getCategoryColor(task.category);
                    const isExpanded = expandedTaskId === task.id;

                    return (
                      <View key={task.id}>
                        <Pressable
                          style={[
                            styles.taskCard,
                            completed && styles.taskCardCompleted,
                          ]}
                          onPress={() => handleToggleTask(task)}
                          onLongPress={() => handleTaskOptions(task)}
                        >
                          <View
                            style={[
                              styles.checkbox,
                              completed && styles.checkboxCompleted,
                            ]}
                          >
                            {completed && (
                              <Ionicons
                                name="checkmark"
                                size={14}
                                color={Colors.background}
                              />
                            )}
                          </View>
                          <View style={styles.taskContent}>
                            <View style={styles.taskNameRow}>
                              <Text
                                style={[
                                  styles.taskName,
                                  completed && styles.taskNameCompleted,
                                ]}
                                numberOfLines={1}
                              >
                                {task.name}
                              </Text>
                              {task.priority && task.priority !== "low" && (
                                <View
                                  style={[
                                    styles.priorityTag,
                                    {
                                      backgroundColor:
                                        task.priority === "high"
                                          ? `${Colors.error}20`
                                          : `${Colors.warning}20`,
                                    },
                                  ]}
                                >
                                  <Ionicons
                                    name="flag"
                                    size={10}
                                    color={
                                      task.priority === "high"
                                        ? Colors.error
                                        : Colors.warning
                                    }
                                  />
                                  <Text
                                    style={[
                                      styles.priorityTagText,
                                      {
                                        color:
                                          task.priority === "high"
                                            ? Colors.error
                                            : Colors.warning,
                                      },
                                    ]}
                                  >
                                    {task.priority.toUpperCase()}
                                  </Text>
                                </View>
                              )}
                            </View>
                            <View style={styles.taskMeta}>
                              <View
                                style={[
                                  styles.categoryDot,
                                  { backgroundColor: categoryColor },
                                ]}
                              />
                              <Text style={styles.taskCategory}>
                                {task.category}
                              </Text>
                              {task.frequency !== "daily" && (
                                <View style={styles.frequencyBadge}>
                                  <Text style={styles.frequencyText}>
                                    {task.frequency}
                                  </Text>
                                </View>
                              )}
                            </View>
                          </View>
                          <Pressable
                            style={styles.moreButton}
                            onPress={() => handleTaskOptions(task)}
                          >
                            <Ionicons
                              name="ellipsis-vertical"
                              size={18}
                              color={Colors.textMuted}
                            />
                          </Pressable>
                        </Pressable>

                        {/* Expanded Options */}
                        {isExpanded && (
                          <Animated.View
                            entering={FadeInRight.duration(200)}
                            style={styles.taskActions}
                          >
                            <Pressable
                              style={styles.actionButton}
                              onPress={() => {
                                setExpandedTaskId(null);
                                router.push({
                                  pathname: "/add-task",
                                  params: { id: task.id },
                                });
                              }}
                            >
                              <Ionicons
                                name="pencil-outline"
                                size={18}
                                color={Colors.info}
                              />
                              <Text
                                style={[
                                  styles.actionText,
                                  { color: Colors.info },
                                ]}
                              >
                                Edit
                              </Text>
                            </Pressable>
                            <View style={styles.actionDivider} />
                            <Pressable
                              style={styles.actionButton}
                              onPress={() => handleDeleteTask(task)}
                            >
                              <Ionicons
                                name="trash-outline"
                                size={18}
                                color={Colors.error}
                              />
                              <Text
                                style={[
                                  styles.actionText,
                                  { color: Colors.error },
                                ]}
                              >
                                Delete
                              </Text>
                            </Pressable>
                          </Animated.View>
                        )}
                      </View>
                    );
                  })}
                </View>
              </Animated.View>
            );
          })
        )}

        {/* Add More Button */}
        {filteredTasks.length > 0 && (
          <Animated.View entering={FadeInDown.delay(400)}>
            <Pressable
              style={styles.addMoreCard}
              onPress={() => router.push("/add-task")}
            >
              <View style={styles.addMoreIcon}>
                <Ionicons name="add" size={20} color={Colors.background} />
              </View>
              <Text style={styles.addMoreText}>Add New Habit</Text>
            </Pressable>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerGradient: {
    paddingBottom: Spacing.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  headerSubtitle: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
  },
  headerTitle: {
    fontSize: Typography.sizes["2xl"],
    fontFamily: Typography.fonts.heading,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  addButton: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  addButtonGradient: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  filtersContainer: {
    marginBottom: Spacing.md,
  },
  filtersScroll: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  filterPillActive: {
    backgroundColor: Colors.cyberLime,
    borderColor: Colors.cyberLime,
  },
  filterText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.bodySemibold,
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  progressCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.cyberLime,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  progressInfo: {
    flex: 1,
  },
  progressLabel: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fonts.heading,
    color: Colors.textPrimary,
  },
  progressValue: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  streakText: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.number,
    color: Colors.textPrimary,
  },
  progressBarBg: {
    height: 10,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
    marginBottom: Spacing.sm,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: BorderRadius.full,
  },
  progressPercent: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.number,
    color: Colors.cyberLime,
    textAlign: "right",
  },
  emptyState: {
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
  },
  emptyStateGradient: {
    alignItems: "center",
    paddingVertical: Spacing["4xl"],
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  emptyIcon: {
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fonts.heading,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: Spacing["2xl"],
    paddingHorizontal: Spacing.xl,
  },
  addFirstButton: {
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  addFirstButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing["2xl"],
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  addFirstText: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.bodySemibold,
    color: Colors.background,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionIconContainer: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.cyberLimeLight,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    flex: 1,
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.heading,
    color: Colors.textPrimary,
  },
  sectionCount: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.number,
    color: Colors.textSecondary,
  },
  tasksList: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderDefault,
    gap: Spacing.md,
  },
  taskCardCompleted: {
    opacity: 0.7,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    borderColor: Colors.borderDefault,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxCompleted: {
    backgroundColor: Colors.cyberLime,
    borderColor: Colors.cyberLime,
  },
  taskContent: {
    flex: 1,
  },
  taskNameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
    gap: Spacing.sm,
  },
  taskName: {
    flex: 1,
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.bodyMedium,
    color: Colors.textPrimary,
  },
  taskNameCompleted: {
    textDecorationLine: "line-through",
    color: Colors.textSecondary,
  },
  priorityTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityTagText: {
    fontSize: 9,
    fontFamily: Typography.fonts.bodyBold,
  },
  taskMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: BorderRadius.full,
  },
  taskCategory: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
    textTransform: "capitalize",
  },
  frequencyBadge: {
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  frequencyText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: Colors.textMuted,
    textTransform: "capitalize",
  },
  moreButton: {
    padding: Spacing.xs,
  },
  taskActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    backgroundColor: Colors.surfaceElevated,
    padding: Spacing.sm,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderDefault,
  },
  actionDivider: {
    width: 1,
    height: 16,
    backgroundColor: Colors.borderDefault,
    alignSelf: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
  },
  actionDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.borderDefault,
    marginHorizontal: Spacing.xs,
  },
  actionText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.bodySemibold,
  },
  addMoreCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    borderStyle: "dashed",
  },
  addMoreIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.cyberLime,
    justifyContent: "center",
    alignItems: "center",
  },
  addMoreText: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.bodySemibold,
    color: Colors.textSecondary,
  },
});
