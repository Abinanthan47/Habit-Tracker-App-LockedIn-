import Ionicons from "@expo/vector-icons/Ionicons";
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

// Neo-Brutalism Vibrant Colors
const COLORS = {
  bg: "#FF7F50",
  pastelGreen: "#C1FF72",
  pastelPurple: "#C5B4E3",
  pastelPink: "#FFB1D8",
  pastelBlue: "#A0D7FF",
  pastelYellow: "#FDFD96",
  white: "#FFFFFF",
  black: "#000000",
  muted: "rgba(0,0,0,0.6)",
};

export default function HomeScreen() {
  const {
    profile,
    currentStreak,
    longestStreak,
    tasks,
    completions,
    activities,
    refreshData,
    getCompletionsForDate,
  } = useApp();

  const [refreshing, setRefreshing] = useState(false);
  const today = getToday();
  const now = new Date();

  // Get current month info
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Generate MONTHLY heatmap data (current month only)
  const monthlyHeatmapData = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const data: { date: string; level: number; dayNum: number }[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateStr = date.toISOString().split("T")[0];

      // Only show data for days up to today
      if (date <= now) {
        const activity = activities.find((a) => a.date === dateStr);
        let level = 0;
        if (activity) {
          if (activity.completionRate >= 80) level = 1;
          else if (activity.completionRate >= 50) level = 0.5;
          else if (activity.completionRate > 0) level = 0.25;
        }
        data.push({ date: dateStr, level, dayNum: day });
      } else {
        data.push({ date: dateStr, level: -1, dayNum: day }); // Future day
      }
    }
    return data;
  }, [activities, currentMonth, currentYear, now]);

  // Today's stats from real data
  const todayCompletions = useMemo(() => {
    return completions.filter((c) => c.date === today);
  }, [completions, today]);

  const todayTotal = tasks.length;
  const todayCompleted = todayCompletions.length;
  const todayPercent =
    todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

  // Calculate month completion from activities
  const monthCompletion = useMemo(() => {
    const monthActivities = activities.filter((a) => {
      const date = new Date(a.date);
      return (
        date.getMonth() === currentMonth && date.getFullYear() === currentYear
      );
    });
    if (monthActivities.length === 0) return 0;
    const avgCompletion =
      monthActivities.reduce((sum, a) => sum + a.completionRate, 0) /
      monthActivities.length;
    return Math.round(avgCompletion);
  }, [activities, currentMonth, currentYear]);

  // Weekly stats from real data
  const weeklyStats = useMemo(() => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    let completed = 0;
    let total = 0;

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      if (date > now) break;

      const dateStr = date.toISOString().split("T")[0];
      const dayCompletions = completions.filter((c) => c.date === dateStr);
      completed += dayCompletions.length;
      total += tasks.length;
    }

    return {
      completed,
      total: total || 1,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [completions, tasks, now]);

  // Monthly progress
  const monthlyStats = useMemo(() => {
    const monthStart = new Date(currentYear, currentMonth, 1);
    let completed = 0;
    let total = 0;

    for (
      let d = new Date(monthStart);
      d <= now && d.getMonth() === currentMonth;
      d.setDate(d.getDate() + 1)
    ) {
      const dateStr = d.toISOString().split("T")[0];
      const dayCompletions = completions.filter((c) => c.date === dateStr);
      completed += dayCompletions.length;
      total += tasks.length;
    }

    return {
      completed,
      total: total || 1,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [completions, tasks, currentMonth, currentYear, now]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  // Bottom padding for tab bar
  const TAB_BAR_HEIGHT = 64;
  const BOTTOM_MARGIN = Platform.OS === "ios" ? 24 : 12;
  const bottomPadding = TAB_BAR_HEIGHT + BOTTOM_MARGIN + 80;

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={20} color={COLORS.black} />
          </View>
          <View>
            <Text style={styles.welcomeText}>READY TO CRUSH IT?</Text>
            <Text style={styles.userName}>
              {profile?.displayName || "Achiever"}
            </Text>
          </View>
        </View>
        <Pressable style={styles.notificationBtn}>
          <Ionicons name="notifications" size={22} color={COLORS.black} />
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
        {/* Hero Streak Card */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.heroCard}>
          <View style={styles.heroContent}>
            <Text style={styles.heroLabel}>CURRENT STREAK</Text>
            <Text style={styles.heroValue}>{currentStreak} Days</Text>
            <Text style={styles.heroBest}>Best: {longestStreak} Days</Text>
            <Pressable
              style={styles.heroButton}
              onPress={() => router.push("/(tabs)/tasks")}
            >
              <Text style={styles.heroButtonText}>LETS GO!</Text>
              <Ionicons name="arrow-forward" size={16} color={COLORS.black} />
            </Pressable>
          </View>
          <View style={styles.heroEmojiContainer}>
            <Text style={styles.heroEmoji}>🕺</Text>
            <Text style={styles.sparkle}>✨</Text>
          </View>
        </Animated.View>

        {/* Overall Stats Card */}
        <Animated.View
          entering={FadeInDown.delay(150)}
          style={styles.masterCard}
        >
          <View>
            <Text style={styles.masterLabel}>TODAY'S PROGRESS</Text>
            <View style={styles.masterRow}>
              <Text style={styles.masterValue}>
                {todayCompleted}/{todayTotal}
              </Text>
              <Text style={styles.masterEmoji}>
                {todayPercent >= 80 ? "🔥" : todayPercent >= 50 ? "💪" : "🎯"}
              </Text>
            </View>
          </View>
          <View style={styles.legendBadge}>
            <Text style={styles.legendBadgeText}>{todayPercent}%</Text>
          </View>
        </Animated.View>

        {/* Monthly Consistency Map */}
        <Animated.View
          entering={FadeInDown.delay(200)}
          style={styles.heatmapCard}
        >
          <View style={styles.heatmapHeader}>
            <Text style={styles.heatmapTitle}>
              {monthNames[currentMonth]} Activity
            </Text>
            <View style={styles.yearBadge}>
              <Text style={styles.yearText}>{currentYear}</Text>
            </View>
          </View>

          {/* Heatmap Grid - Calendar Style */}
          <View style={styles.calendarGrid}>
            {/* Day headers */}
            <View style={styles.dayHeaders}>
              {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                <Text key={i} style={styles.dayHeaderText}>
                  {day}
                </Text>
              ))}
            </View>

            {/* Calendar cells */}
            <View style={styles.calendarCells}>
              {/* Empty cells for first week offset */}
              {Array.from({
                length: new Date(currentYear, currentMonth, 1).getDay(),
              }).map((_, i) => (
                <View key={`empty-${i}`} style={styles.calendarCellEmpty} />
              ))}

              {/* Day cells */}
              {monthlyHeatmapData.map((item, index) => {
                const isToday = item.date === today;
                const isFuture = item.level === -1;

                let bgColor = "rgba(255,255,255,0.3)";
                if (!isFuture) {
                  if (item.level >= 1) bgColor = COLORS.pastelGreen;
                  else if (item.level >= 0.5) bgColor = "rgba(193,255,114,0.7)";
                  else if (item.level > 0) bgColor = "rgba(193,255,114,0.4)";
                }

                return (
                  <View
                    key={item.date}
                    style={[
                      styles.calendarCell,
                      { backgroundColor: bgColor },
                      isToday && styles.calendarCellToday,
                      isFuture && styles.calendarCellFuture,
                    ]}
                  >
                    <Text
                      style={[
                        styles.calendarCellText,
                        isFuture && styles.calendarCellTextFuture,
                      ]}
                    >
                      {item.dayNum}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Footer */}
          <View style={styles.heatmapFooter}>
            <View>
              <Text style={styles.completionLabel}>MONTH COMPLETION</Text>
              <Text style={styles.completionValue}>{monthCompletion}% 🔥</Text>
            </View>
            <View style={styles.legend}>
              <Text style={styles.legendText}>0%</Text>
              <View
                style={[
                  styles.legendCell,
                  { backgroundColor: "rgba(255,255,255,0.3)" },
                ]}
              />
              <View
                style={[
                  styles.legendCell,
                  { backgroundColor: "rgba(193,255,114,0.5)" },
                ]}
              />
              <View
                style={[
                  styles.legendCell,
                  { backgroundColor: COLORS.pastelGreen },
                ]}
              />
              <Text style={styles.legendText}>100%</Text>
            </View>
          </View>
        </Animated.View>

        {/* Weekly Mission */}
        <Animated.View
          entering={FadeInDown.delay(300)}
          style={styles.progressCard}
        >
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressLabel}>WEEKLY MISSION</Text>
              <Text style={styles.progressValue}>
                {weeklyStats.completed}/{weeklyStats.total}
              </Text>
            </View>
            <View style={styles.progressBadge}>
              <Text style={styles.progressBadgeText}>
                {weeklyStats.percent}%
              </Text>
            </View>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.min(weeklyStats.percent, 100)}%` },
              ]}
            />
          </View>
        </Animated.View>

        {/* Monthly Goal */}
        <Animated.View
          entering={FadeInDown.delay(350)}
          style={styles.progressCardBlue}
        >
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressLabel}>MONTHLY GOAL</Text>
              <Text style={styles.progressValue}>
                {monthlyStats.completed}/{monthlyStats.total}
              </Text>
            </View>
            <View style={styles.progressBadgeWhite}>
              <Text style={styles.progressBadgeTextBlack}>
                {monthlyStats.percent}%
              </Text>
            </View>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFillPink,
                { width: `${Math.min(monthlyStats.percent, 100)}%` },
              ]}
            />
          </View>
        </Animated.View>

        {/* Today's Rituals */}
        <Animated.View entering={FadeInDown.delay(400)}>
          <Text style={styles.sectionTitle}>Today's Rituals</Text>

          {tasks.length === 0 ? (
            <Pressable
              style={styles.emptyCard}
              onPress={() => router.push("/add-task")}
            >
              <Ionicons
                name="add-circle-outline"
                size={32}
                color={COLORS.black}
              />
              <Text style={styles.emptyText}>Add your first habit!</Text>
            </Pressable>
          ) : (
            tasks.slice(0, 3).map((task, index) => {
              const isCompleted = todayCompletions.some(
                (c) => c.taskId === task.id
              );
              const bgColors = [
                COLORS.pastelYellow,
                COLORS.white,
                COLORS.pastelGreen,
              ];

              return (
                <Pressable
                  key={task.id}
                  style={[
                    styles.taskPreview,
                    { backgroundColor: bgColors[index % bgColors.length] },
                  ]}
                  onPress={() => router.push("/(tabs)/tasks")}
                >
                  <View style={styles.taskPreviewLeft}>
                    <View
                      style={[
                        styles.taskIcon,
                        isCompleted && { backgroundColor: COLORS.pastelGreen },
                      ]}
                    >
                      <Ionicons
                        name={
                          task.category === "health"
                            ? "water"
                            : task.category === "fitness"
                            ? "fitness"
                            : task.category === "mindfulness"
                            ? "leaf"
                            : task.category === "learning"
                            ? "book"
                            : "checkbox"
                        }
                        size={22}
                        color={COLORS.black}
                      />
                    </View>
                    <Text style={styles.taskPreviewText}>{task.name}</Text>
                  </View>
                  <View
                    style={[
                      styles.taskCheckbox,
                      isCompleted && styles.taskCheckboxDone,
                    ]}
                  >
                    {isCompleted && (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={COLORS.black}
                      />
                    )}
                  </View>
                </Pressable>
              );
            })
          )}

          {tasks.length > 3 && (
            <Pressable
              style={styles.viewAllButton}
              onPress={() => router.push("/(tabs)/tasks")}
            >
              <Text style={styles.viewAllText}>VIEW ALL TASKS →</Text>
            </Pressable>
          )}
        </Animated.View>
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.black,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.pastelGreen,
    borderWidth: 2,
    borderColor: COLORS.black,
    justifyContent: "center",
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.muted,
    letterSpacing: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: "900",
    color: COLORS.black,
  },
  notificationBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.white,
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
  heroCard: {
    backgroundColor: COLORS.pastelGreen,
    borderRadius: 24,
    padding: 20,
    marginBottom: 14,
    borderWidth: 3,
    borderColor: COLORS.black,
    shadowColor: COLORS.black,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    overflow: "hidden",
  },
  heroContent: {
    flex: 1,
  },
  heroLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.black,
    letterSpacing: 1,
    marginBottom: 4,
  },
  heroValue: {
    fontSize: 34,
    fontWeight: "900",
    color: COLORS.black,
    fontStyle: "italic",
    letterSpacing: -1,
  },
  heroBest: {
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(0,0,0,0.7)",
    marginTop: 2,
  },
  heroButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 50,
    marginTop: 14,
    alignSelf: "flex-start",
    borderWidth: 2,
    borderColor: COLORS.black,
    gap: 6,
  },
  heroButtonText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.black,
  },
  heroEmojiContainer: {
    position: "relative",
  },
  heroEmoji: {
    fontSize: 60,
  },
  sparkle: {
    position: "absolute",
    top: -8,
    right: -4,
    fontSize: 20,
  },
  masterCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 3,
    borderColor: COLORS.black,
    shadowColor: COLORS.black,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  masterLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.muted,
    letterSpacing: 0.5,
  },
  masterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  masterValue: {
    fontSize: 26,
    fontWeight: "900",
    color: COLORS.black,
  },
  masterEmoji: {
    fontSize: 26,
  },
  legendBadge: {
    backgroundColor: COLORS.pastelPink,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: COLORS.black,
  },
  legendBadgeText: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.black,
  },
  heatmapCard: {
    backgroundColor: COLORS.pastelPurple,
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    borderWidth: 3,
    borderColor: COLORS.black,
    shadowColor: COLORS.black,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  heatmapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  heatmapTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: COLORS.black,
  },
  yearBadge: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: COLORS.black,
  },
  yearText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.black,
  },
  calendarGrid: {
    marginBottom: 14,
  },
  dayHeaders: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
  },
  dayHeaderText: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.muted,
    width: 36,
    textAlign: "center",
  },
  calendarCells: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calendarCell: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 4,
  },
  calendarCellEmpty: {
    width: "14.28%",
    aspectRatio: 1,
  },
  calendarCellToday: {
    borderWidth: 2,
    borderColor: COLORS.black,
  },
  calendarCellFuture: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  calendarCellText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.black,
  },
  calendarCellTextFuture: {
    color: "rgba(0,0,0,0.3)",
  },
  heatmapFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  completionLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.muted,
    letterSpacing: 0.5,
  },
  completionValue: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.black,
  },
  legend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendText: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.muted,
  },
  legendCell: {
    width: 14,
    height: 14,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: COLORS.black,
  },
  progressCard: {
    backgroundColor: COLORS.pastelPink,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: COLORS.black,
    shadowColor: COLORS.black,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  progressCardBlue: {
    backgroundColor: COLORS.pastelBlue,
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
    alignItems: "flex-end",
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "rgba(0,0,0,0.7)",
    letterSpacing: 0.5,
  },
  progressValue: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.black,
    fontStyle: "italic",
  },
  progressBadge: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: COLORS.black,
  },
  progressBadgeWhite: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: COLORS.black,
  },
  progressBadgeText: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.black,
  },
  progressBadgeTextBlack: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.black,
  },
  progressBarBg: {
    height: 24,
    backgroundColor: COLORS.white,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: COLORS.black,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.pastelGreen,
  },
  progressBarFillPink: {
    height: "100%",
    backgroundColor: COLORS.pastelPink,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.black,
    fontStyle: "italic",
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 24,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: COLORS.black,
    borderStyle: "dashed",
    alignItems: "center",
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.muted,
  },
  taskPreview: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
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
  taskPreviewLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  taskIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.black,
    justifyContent: "center",
    alignItems: "center",
  },
  taskPreviewText: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.black,
    flex: 1,
  },
  taskCheckbox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.black,
    justifyContent: "center",
    alignItems: "center",
  },
  taskCheckboxDone: {
    backgroundColor: COLORS.pastelGreen,
  },
  viewAllButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.black,
  },
});
