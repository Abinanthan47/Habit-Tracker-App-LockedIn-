import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dimensions,
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

import { AchievementScreen } from "@/app/achievements";
import { DailyStreakPopup } from "@/components/DailyStreakPopup";
import { StreakWidget } from "@/components/StreakWidget";

import {
  BorderRadius,
  Colors,
  Layout,
  Spacing,
  Typography,
  getCategoryColor,
  getHeatmapColor,
} from "@/constants/design";
import { useApp } from "@/context/AppContext";
import { formatDate } from "@/lib/dates";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Calendar heatmap configuration for monthly view
const CELL_SIZE = 36;
const CELL_GAP = 4;
const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function HomeScreen() {
  const {
    profile,
    tasks,
    completions,
    goals,
    activities,
    currentStreak,
    longestStreak,
    todayCompletionRate,
    refreshData,
    getTasksForToday,
    getCompletionsForDate,
  } = useApp();

  const [refreshing, setRefreshing] = useState(false);
  const [showDailyPopup, setShowDailyPopup] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  // Use local timezone date format
  const today = formatDate(now);

  // Show daily streak popup on first app launch of the day
  useEffect(() => {
    const checkFirstLaunchToday = async () => {
      const lastLaunchDate = await AsyncStorage.getItem("lastLaunchDate");
      if (lastLaunchDate !== today) {
        await AsyncStorage.setItem("lastLaunchDate", today);
        // Small delay to let the screen render first
        setTimeout(() => setShowDailyPopup(true), 500);
      }
    };
    checkFirstLaunchToday();
  }, [today]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  // Get greeting based on time of day
  const greeting = useMemo(() => {
    const hour = now.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, [now]);

  // Today's tasks
  const todaysTasks = useMemo(() => getTasksForToday(), [getTasksForToday]);
  const todaysCompletions = useMemo(
    () => getCompletionsForDate(today),
    [getCompletionsForDate, today],
  );
  const completedToday = todaysCompletions.length;
  const totalToday = todaysTasks.length;

  // Calculate active days this month
  const activeDaysThisMonth = useMemo(() => {
    return activities.filter((a) => {
      const date = new Date(a.date);
      return (
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear &&
        a.completionRate >= 50
      );
    }).length;
  }, [activities, currentMonth, currentYear]);

  // Generate monthly calendar data
  const monthlyCalendarData = useMemo(() => {
    const year = currentYear;
    const month = currentMonth;

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0 = Sunday

    // Create calendar grid (6 weeks max)
    const weeks: {
      date: string | null;
      day: number | null;
      level: number;
    }[][] = [];
    let currentWeek: {
      date: string | null;
      day: number | null;
      level: number;
    }[] = [];

    // Add empty cells for days before first day of month
    for (let i = 0; i < startDayOfWeek; i++) {
      currentWeek.push({ date: null, day: null, level: 0 });
    }

    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = formatDate(date);
      const activity = activities.find((a) => a.date === dateStr);
      const level = activity ? activity.completionRate / 100 : 0;

      currentWeek.push({ date: dateStr, day, level });

      if (currentWeek.length === 7) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    }

    // Fill remaining cells in last week
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({ date: null, day: null, level: 0 });
      }
      weeks.push(currentWeek);
    }

    return weeks;
  }, [activities, currentMonth, currentYear]);

  // Get month name
  const monthName = useMemo(() => {
    return new Date(currentYear, currentMonth).toLocaleDateString("en-US", {
      month: "long",
    });
  }, [currentMonth, currentYear]);

  // Streak visualization data (Sunday to Saturday)
  const streakVisualization = useMemo(() => {
    const data = [];
    // Find the most recent Sunday
    const todayDate = new Date(now);
    const dayOfWeek = todayDate.getDay(); // 0 = Sunday
    const startOfWeek = new Date(todayDate);
    startOfWeek.setDate(todayDate.getDate() - dayOfWeek);

    // Generate 7 days starting from Sunday
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateStr = formatDate(date);
      const activity = activities.find((a) => a.date === dateStr);
      const isFuture = date > todayDate;

      data.push({
        day: DAYS_OF_WEEK[i],
        date: dateStr,
        completed: activity ? activity.tasksCompleted : 0,
        total: activity ? activity.taskTotal : 0,
        rate: activity ? activity.completionRate : 0,
        isToday: dateStr === today,
        isFuture,
      });
    }
    return data;
  }, [activities, now, today]);

  const TAB_BAR_HEIGHT = Layout.tabBarHeight;
  const bottomPadding = TAB_BAR_HEIGHT + (Platform.OS === "ios" ? 24 : 16) + 20;

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Header with gradient */}
      <LinearGradient
        colors={[Colors.surface, Colors.background]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.userName}>
              {profile?.displayName || "Achiever"}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Pressable
              style={styles.achievementsButton}
              onPress={() => setShowAchievements(true)}
            >
              <Ionicons name="trophy" size={20} color={Colors.cyberLime} />
            </Pressable>
            <Pressable
              style={styles.levelBadge}
              onPress={() => router.push("/(tabs)/profile")}
            >
              <LinearGradient
                colors={[Colors.warning, "#FF8C00"]}
                style={styles.levelGradient}
              >
                <Ionicons name="star" size={12} color={Colors.background} />
              </LinearGradient>
              <Text style={styles.levelText}>Lv.{profile?.level || 1}</Text>
            </Pressable>
          </View>
        </View>
      </LinearGradient>

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
        {/* Streak Widget with Lottie Animation */}
        <Animated.View entering={FadeInDown.delay(50)}>
          <StreakWidget />
        </Animated.View>

        {/* Quick Stats Row */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.statsRow}>
          {/* Today's Progress */}
          <LinearGradient
            colors={[`${Colors.cyberLime}15`, `${Colors.cyberLime}05`]}
            style={styles.statCard}
          >
            <View
              style={[
                styles.statIconBg,
                { backgroundColor: `${Colors.cyberLime}30` },
              ]}
            >
              <Ionicons
                name="checkmark-done"
                size={18}
                color={Colors.cyberLime}
              />
            </View>
            <Text style={styles.statValue}>
              {completedToday}/{totalToday}
            </Text>
            <Text style={styles.statLabel}>Today</Text>
          </LinearGradient>

          {/* Active Days */}
          <LinearGradient
            colors={[`${Colors.cyberLime}15`, `${Colors.cyberLime}05`]}
            style={styles.statCard}
          >
            <View
              style={[
                styles.statIconBg,
                { backgroundColor: `${Colors.cyberLime}30` },
              ]}
            >
              <Ionicons name="calendar" size={18} color={Colors.cyberLime} />
            </View>
            <Text style={styles.statValue}>{activeDaysThisMonth}</Text>
            <Text style={styles.statLabel}>Active Days</Text>
          </LinearGradient>

          {/* Progress Rate */}
          <LinearGradient
            colors={[`${Colors.cyberLime}15`, `${Colors.cyberLime}05`]}
            style={styles.statCard}
          >
            <View
              style={[
                styles.statIconBg,
                { backgroundColor: `${Colors.cyberLime}30` },
              ]}
            >
              <Ionicons name="trending-up" size={18} color={Colors.cyberLime} />
            </View>
            <Text style={styles.statValue}>{todayCompletionRate}%</Text>
            <Text style={styles.statLabel}>Progress</Text>
          </LinearGradient>
        </Animated.View>

        {/* Monthly Calendar Heatmap */}
        <Animated.View
          entering={FadeInDown.delay(150)}
          style={styles.heatmapCard}
        >
          <View style={styles.heatmapHeader}>
            <Text style={styles.sectionTitle}>
              {monthName} {currentYear}
            </Text>
            <View style={styles.legendInline}>
              <Text style={styles.legendLabel}>Activity</Text>
              {[0, 0.25, 0.5, 0.8, 1].map((level, i) => (
                <View
                  key={i}
                  style={[
                    styles.legendCell,
                    { backgroundColor: getHeatmapColor(level) },
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Day of Week Headers */}
          <View style={styles.dayHeaders}>
            {DAYS_OF_WEEK.map((day) => (
              <Text key={day} style={styles.dayHeaderText}>
                {day.slice(0, 3)}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {monthlyCalendarData.map((week, weekIndex) => (
              <View key={weekIndex} style={styles.calendarWeek}>
                {week.map((day, dayIndex) => (
                  <View
                    key={dayIndex}
                    style={[
                      styles.calendarCell,
                      day.date && {
                        backgroundColor: getHeatmapColor(day.level),
                      },
                      !day.date && styles.calendarCellEmpty,
                      day.date === today && styles.calendarCellToday,
                    ]}
                  >
                    {day.day && (
                      <Text
                        style={[
                          styles.calendarDayText,
                          day.level >= 0.8 && styles.calendarDayTextActive,
                          day.date === today && styles.calendarDayTextToday,
                        ]}
                      >
                        {day.day}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Today's Habits Preview */}
        <Animated.View entering={FadeInDown.delay(200)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Habits</Text>
            <Pressable onPress={() => router.push("/(tabs)/tasks")}>
              <Text style={styles.seeAllText}>See all</Text>
            </Pressable>
          </View>

          {todaysTasks.length === 0 ? (
            <LinearGradient
              colors={[`${Colors.cyberLime}10`, "transparent"]}
              style={styles.emptyHabits}
            >
              <Ionicons
                name="add-circle-outline"
                size={32}
                color={Colors.cyberLime}
              />
              <Text style={styles.emptyHabitsText}>No habits yet</Text>
              <Pressable
                style={styles.addHabitButton}
                onPress={() => router.push("/add-task")}
              >
                <LinearGradient
                  colors={[Colors.cyberLime, "#B8E600"]}
                  style={styles.addHabitGradient}
                >
                  <Text style={styles.addHabitText}>
                    Create your first habit
                  </Text>
                </LinearGradient>
              </Pressable>
            </LinearGradient>
          ) : (
            <View style={styles.habitsList}>
              {todaysTasks.slice(0, 4).map((task, index) => {
                const isCompleted = todaysCompletions.some(
                  (c) => c.taskId === task.id,
                );
                return (
                  <View key={task.id} style={styles.habitPreviewCard}>
                    <View style={styles.habitPreviewLeft}>
                      <View
                        style={[
                          styles.habitCheckbox,
                          isCompleted && styles.habitCheckboxCompleted,
                        ]}
                      >
                        {isCompleted && (
                          <Ionicons
                            name="checkmark"
                            size={14}
                            color={Colors.background}
                          />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.habitName,
                          isCompleted && styles.habitNameCompleted,
                        ]}
                        numberOfLines={1}
                      >
                        {task.name}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.categoryDot,
                        { backgroundColor: getCategoryColor(task.category) },
                      ]}
                    />
                  </View>
                );
              })}
              {todaysTasks.length > 4 && (
                <Text style={styles.moreHabitsText}>
                  +{todaysTasks.length - 4} more habits
                </Text>
              )}
            </View>
          )}
        </Animated.View>

        {/* Active Goals Preview */}
        {goals.length > 0 && (
          <Animated.View entering={FadeInDown.delay(250)}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Goals</Text>
              <Pressable onPress={() => router.push("/(tabs)/goals")}>
                <Text style={styles.seeAllText}>See all</Text>
              </Pressable>
            </View>

            {goals
              .filter((g) => !g.isArchived && g.currentValue < g.targetValue)
              .slice(0, 2)
              .map((goal) => {
                const progress = Math.min(
                  Math.round((goal.currentValue / goal.targetValue) * 100),
                  100,
                );
                return (
                  <Pressable
                    key={goal.id}
                    style={styles.goalPreviewCard}
                    onPress={() =>
                      router.push({
                        pathname: "/goal-detail",
                        params: { id: goal.id },
                      })
                    }
                  >
                    <View style={styles.goalPreviewHeader}>
                      <View style={styles.goalTitleContainer}>
                        <Text style={styles.goalIcon}>{goal.icon || "🎯"}</Text>
                        <Text style={styles.goalTitle} numberOfLines={1}>
                          {goal.title}
                        </Text>
                      </View>
                      <Text style={styles.goalProgress}>{progress}%</Text>
                    </View>
                    <View style={styles.goalProgressBarBg}>
                      <LinearGradient
                        colors={[Colors.cyberLime, "#B8E600"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[
                          styles.goalProgressBarFill,
                          { width: `${Math.max(progress, 2)}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.goalMeta}>
                      {goal.currentValue} / {goal.targetValue} {goal.unit}
                    </Text>
                  </Pressable>
                );
              })}
          </Animated.View>
        )}
      </ScrollView>

      {/* Daily Streak Popup */}
      <DailyStreakPopup
        visible={showDailyPopup}
        onClose={() => setShowDailyPopup(false)}
      />

      {/* Achievements Screen */}
      <AchievementScreen
        visible={showAchievements}
        onClose={() => setShowAchievements(false)}
      />
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
  greeting: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
  },
  userName: {
    fontSize: Typography.sizes["2xl"],
    fontFamily: Typography.fonts.heading,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  achievementsButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceElevated,
    paddingRight: Spacing.md,
    paddingLeft: 4,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  levelGradient: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  levelText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.number,
    color: Colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  streakCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.cyberLime,
  },
  streakHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  streakIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  streakInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  streakNumber: {
    fontSize: Typography.sizes["4xl"],
    fontFamily: Typography.fonts.number,
    color: Colors.textPrimary,
    lineHeight: Typography.sizes["4xl"] * 1.1,
  },
  streakLabel: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
  },
  streakStats: {
    alignItems: "flex-end",
  },
  miniStat: {
    alignItems: "center",
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: 2,
  },
  miniStatValue: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fonts.number,
    color: Colors.cyberLime,
  },
  miniStatLabel: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: Colors.textMuted,
  },
  streakVisualization: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  streakDayContainer: {
    alignItems: "center",
    gap: Spacing.xs,
  },
  streakDayLabel: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodySemibold,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  streakDayLabelActive: {
    color: Colors.cyberLime,
  },
  streakDayCircle: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  streakDayComplete: {
    backgroundColor: Colors.cyberLime,
  },
  streakDayPartial: {
    backgroundColor: Colors.cyberLimeLight,
    borderColor: Colors.cyberLime,
  },
  streakDayLow: {
    backgroundColor: `${Colors.warning}40`,
    borderColor: Colors.warning,
  },
  streakDayEmpty: {
    backgroundColor: Colors.surface,
    borderColor: Colors.borderDefault,
  },
  streakDayFuture: {
    backgroundColor: Colors.surface,
    borderColor: Colors.borderDefault,
    opacity: 0.4,
  },
  streakDayToday: {
    borderColor: Colors.cyberLime,
    borderWidth: 3,
  },
  streakDayPercent: {
    fontSize: 9,
    fontFamily: Typography.fonts.number,
    color: Colors.textPrimary,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  statIconBg: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.fonts.number,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  heatmapCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  heatmapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fonts.heading,
    color: Colors.textPrimary,
  },
  legendInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendLabel: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: Colors.textMuted,
    marginRight: 4,
  },
  legendCell: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  dayHeaders: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: Spacing.sm,
  },
  dayHeaderText: {
    width: CELL_SIZE,
    textAlign: "center",
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodySemibold,
    color: Colors.textSecondary,
  },
  calendarGrid: {
    gap: CELL_GAP,
  },
  calendarWeek: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  calendarCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: CELL_GAP,
  },
  calendarCellEmpty: {
    backgroundColor: "transparent",
  },
  calendarCellToday: {
    borderWidth: 2,
    borderColor: Colors.cyberLime,
  },
  calendarDayText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.number,
    color: Colors.textSecondary,
  },
  calendarDayTextActive: {
    color: Colors.background,
    fontFamily: Typography.fonts.bodySemibold,
  },
  calendarDayTextToday: {
    color: Colors.cyberLime,
    fontFamily: Typography.fonts.bodySemibold,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  seeAllText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.bodySemibold,
    color: Colors.cyberLime,
  },
  emptyHabits: {
    borderRadius: BorderRadius.xl,
    padding: Spacing["2xl"],
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    borderStyle: "dashed",
    marginBottom: Spacing.xl,
  },
  emptyHabitsText: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  addHabitButton: {
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  addHabitGradient: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  addHabitText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.bodySemibold,
    color: Colors.background,
  },
  habitsList: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  habitPreviewCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderDefault,
  },
  habitPreviewLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: Spacing.md,
  },
  habitCheckbox: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    borderColor: Colors.borderDefault,
    justifyContent: "center",
    alignItems: "center",
  },
  habitCheckboxCompleted: {
    backgroundColor: Colors.cyberLime,
    borderColor: Colors.cyberLime,
  },
  habitName: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.bodyMedium,
    color: Colors.textPrimary,
    flex: 1,
  },
  habitNameCompleted: {
    color: Colors.textSecondary,
    textDecorationLine: "line-through",
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
  },
  moreHabitsText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
    textAlign: "center",
    padding: Spacing.md,
  },
  goalPreviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  goalPreviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  goalTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flex: 1,
  },
  goalIcon: {
    fontSize: 18,
  },
  goalTitle: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.bodySemibold,
    color: Colors.textPrimary,
  },
  goalProgress: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.number,
    color: Colors.cyberLime,
  },
  goalProgressBarBg: {
    height: 6,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
    marginBottom: Spacing.sm,
  },
  goalProgressBarFill: {
    height: "100%",
    borderRadius: BorderRadius.full,
  },
  goalMeta: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.number,
    color: Colors.textSecondary,
  },
});
