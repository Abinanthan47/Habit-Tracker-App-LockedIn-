import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { getToday } from "@/lib/dates";
import type { Task } from "@/types";

// Neo-Brutalism Vibrant Colors
const COLORS = {
  bg: "#FDFD96",
  pastelGreen: "#C1FF72",
  pastelPurple: "#C5B4E3",
  pastelPink: "#FFB1D8",
  pastelBlue: "#A0D7FF",
  white: "#FFFFFF",
  black: "#000000",
  darkCard: "#1a1a2e",
  muted: "rgba(0,0,0,0.5)",
  orange: "#ff7b00",
};

export default function TasksScreen() {
  const {
    tasks,
    completions,
    completeTask,
    uncompleteTask,
    refreshData,
    currentStreak,
  } = useApp();

  const [refreshing, setRefreshing] = useState(false);
  const today = getToday();

  // Get completions for today
  const todayCompletions = useMemo(() => {
    return completions.filter((c) => c.date === today);
  }, [completions, today]);

  const completedTaskIds = useMemo(() => {
    return new Set(todayCompletions.map((c) => c.taskId));
  }, [todayCompletions]);

  // Group tasks by time of day
  const groupedTasks = useMemo(() => {
    const groups: Record<string, Task[]> = {
      morning: [],
      afternoon: [],
      evening: [],
    };

    tasks.forEach((task) => {
      const time = task.timeOfDay === "anytime" ? "morning" : task.timeOfDay;
      if (groups[time]) {
        groups[time].push(task);
      } else {
        groups.morning.push(task);
      }
    });

    return groups;
  }, [tasks]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  const handleToggleTask = useCallback(
    async (task: Task) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const isCompleted = completedTaskIds.has(task.id);
      if (isCompleted) {
        await uncompleteTask(task.id);
      } else {
        await completeTask(task.id);
      }
    },
    [completedTaskIds, completeTask, uncompleteTask]
  );

  // Calculate progress
  const totalTasks = tasks.length;
  const completedCount = todayCompletions.length;
  const progressPercent =
    totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Get day info
  const dayNames = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];
  const monthNames = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  const now = new Date();
  const dayName = dayNames[now.getDay()];
  const monthName = monthNames[now.getMonth()];

  // Calculate task streak from real completion data
  const getTaskStreak = useCallback(
    (taskId: string): number => {
      let streak = 0;
      const todayDate = new Date();

      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(todayDate);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split("T")[0];

        const hasCompletion = completions.some(
          (c) => c.taskId === taskId && c.date === dateStr
        );

        if (hasCompletion) {
          streak++;
        } else if (i > 0) {
          // Break if not completed (allow today to be incomplete)
          break;
        }
      }

      return streak;
    },
    [completions]
  );

  // Tab bar dimensions
  const TAB_BAR_HEIGHT = 64;
  const BOTTOM_MARGIN = Platform.OS === "ios" ? 24 : 12;
  const bottomPadding = TAB_BAR_HEIGHT + BOTTOM_MARGIN + 80;

  const TIME_SECTIONS = [
    {
      key: "morning",
      icon: "sunny" as const,
      label: "MORNING RITUALS",
      color: "#ffd33d",
    },
    {
      key: "afternoon",
      icon: "partly-sunny" as const,
      label: "MIDDAY HUSTLE",
      color: "#ff9500",
    },
    {
      key: "evening",
      icon: "moon" as const,
      label: "EVENING WIND DOWN",
      color: "#6366f1",
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.dateLabel}>
            {dayName}, {monthName} {now.getDate()}
          </Text>
          <Text style={styles.headerTitle}>Daily Tasks</Text>
        </View>
        <Pressable
          style={styles.avatar}
          onPress={() => router.push("/(tabs)/profile")}
        >
          <Ionicons name="person" size={18} color={COLORS.black} />
        </Pressable>
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
            tintColor={COLORS.black}
          />
        }
      >
        {/* Progress Card */}
        <Animated.View
          entering={FadeInDown.delay(100)}
          style={styles.progressCard}
        >
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressLabel}>
                {progressPercent >= 100
                  ? "All Done! 🎉"
                  : progressPercent >= 50
                  ? "Keep it up!"
                  : "Let's go!"}
              </Text>
              <View style={styles.streakRow}>
                <Ionicons name="flame" size={14} color={COLORS.orange} />
                <Text style={styles.streakText}>
                  {currentStreak} DAY STREAK
                </Text>
              </View>
            </View>
            <Text style={styles.progressPercent}>{progressPercent}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.min(progressPercent, 100)}%` },
              ]}
            />
          </View>
        </Animated.View>

        {/* Task Sections */}
        {tasks.length === 0 ? (
          <Animated.View
            entering={FadeInDown.delay(200)}
            style={styles.emptyState}
          >
            <View style={styles.emptyIcon}>
              <Ionicons name="add-circle" size={44} color={COLORS.black} />
            </View>
            <Text style={styles.emptyTitle}>No habits yet!</Text>
            <Text style={styles.emptySubtitle}>
              Tap the + button to create your first habit
            </Text>
            <Pressable
              style={styles.addFirstButton}
              onPress={() => router.push("/add-task")}
            >
              <Ionicons name="add" size={20} color={COLORS.black} />
              <Text style={styles.addFirstText}>ADD HABIT</Text>
            </Pressable>
          </Animated.View>
        ) : (
          TIME_SECTIONS.map((section, sectionIndex) => {
            const sectionTasks = groupedTasks[section.key] || [];
            if (sectionTasks.length === 0) return null;

            return (
              <Animated.View
                key={section.key}
                entering={FadeInDown.delay(200 + sectionIndex * 100)}
                style={styles.section}
              >
                <View style={styles.sectionHeader}>
                  <Ionicons
                    name={section.icon}
                    size={16}
                    color={section.color}
                  />
                  <Text style={styles.sectionTitle}>{section.label}</Text>
                </View>

                {sectionTasks.map((task) => {
                  const isCompleted = completedTaskIds.has(task.id);
                  const taskStreak = getTaskStreak(task.id);

                  return (
                    <Pressable
                      key={task.id}
                      style={[
                        styles.taskCard,
                        isCompleted && styles.taskCardCompleted,
                      ]}
                      onPress={() => handleToggleTask(task)}
                    >
                      <View style={styles.taskLeft}>
                        <View
                          style={[
                            styles.checkbox,
                            isCompleted && styles.checkboxDone,
                          ]}
                        >
                          {isCompleted && (
                            <Ionicons
                              name="checkmark"
                              size={16}
                              color={COLORS.black}
                            />
                          )}
                        </View>
                        <View style={styles.taskInfo}>
                          <Text
                            style={[
                              styles.taskName,
                              isCompleted && styles.taskNameDone,
                            ]}
                          >
                            {task.name}
                          </Text>
                          {taskStreak > 0 ? (
                            <View style={styles.streakBadge}>
                              <Ionicons
                                name="flame"
                                size={10}
                                color={COLORS.orange}
                              />
                              <Text style={styles.streakBadgeText}>
                                {taskStreak} STREAK
                              </Text>
                            </View>
                          ) : (
                            <Text style={styles.categoryText}>
                              {task.category.charAt(0).toUpperCase() +
                                task.category.slice(1)}
                            </Text>
                          )}
                        </View>
                      </View>
                      <Ionicons
                        name={
                          task.category === "fitness"
                            ? "barbell"
                            : task.category === "health"
                            ? "water"
                            : task.category === "mindfulness"
                            ? "leaf"
                            : task.category === "learning"
                            ? "book"
                            : "document-text"
                        }
                        size={22}
                        color={isCompleted ? COLORS.pastelGreen : COLORS.muted}
                      />
                    </Pressable>
                  );
                })}
              </Animated.View>
            );
          })
        )}

        {/* Add Task Button */}
        {tasks.length > 0 && (
          <Animated.View entering={FadeInDown.delay(500)}>
            <Pressable
              style={styles.addTaskButton}
              onPress={() => router.push("/add-task")}
            >
              <Ionicons name="add" size={22} color={COLORS.white} />
              <Text style={styles.addTaskText}>ADD TASK</Text>
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
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.muted,
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.black,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.pastelPink,
    borderWidth: 2,
    borderColor: COLORS.black,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  progressCard: {
    backgroundColor: COLORS.pastelGreen,
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    borderWidth: 3,
    borderColor: COLORS.black,
    shadowColor: COLORS.black,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.black,
    marginBottom: 4,
  },
  streakRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  streakText: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.black,
    letterSpacing: 0.5,
  },
  progressPercent: {
    fontSize: 26,
    fontWeight: "900",
    color: COLORS.black,
  },
  progressBarBg: {
    height: 20,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.black,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.darkCard,
    borderRadius: 8,
  },
  section: {
    marginBottom: 18,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.black,
    letterSpacing: 0.5,
  },
  taskCard: {
    backgroundColor: COLORS.pastelGreen,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 3,
    borderColor: COLORS.black,
    shadowColor: COLORS.black,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskCardCompleted: {
    backgroundColor: "rgba(193,255,114,0.5)",
  },
  taskLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  taskInfo: {
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.black,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxDone: {
    backgroundColor: COLORS.pastelGreen,
  },
  taskName: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.black,
  },
  taskNameDone: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
  },
  streakBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.orange,
    letterSpacing: 0.5,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.muted,
    marginTop: 2,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 3,
    borderColor: COLORS.black,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    shadowColor: COLORS.black,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.black,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.muted,
    textAlign: "center",
    marginBottom: 18,
  },
  addFirstButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.pastelGreen,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: COLORS.black,
    gap: 6,
    shadowColor: COLORS.black,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  addFirstText: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.black,
  },
  addTaskButton: {
    backgroundColor: COLORS.black,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    borderWidth: 3,
    borderColor: COLORS.black,
    shadowColor: COLORS.black,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  addTaskText: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.white,
    letterSpacing: 0.5,
  },
});
