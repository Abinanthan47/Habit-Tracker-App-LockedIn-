import { BorderRadius, Colors, Spacing, Typography } from "@/constants/design";
import { useApp } from "@/context/AppContext";
import { getToday } from "@/lib/dates";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import React, { useEffect, useMemo, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const DAYS_OF_WEEK = ["S", "M", "T", "W", "T", "F", "S"];

interface StreakWidgetProps {
  onAchievementsPress?: () => void;
}

export function StreakWidget({ onAchievementsPress }: StreakWidgetProps) {
  const {
    currentStreak,
    longestStreak,
    activities,
    completions,
    getTasksForToday,
  } = useApp();
  const lottieRef = useRef<LottieView>(null);

  const today = getToday();
  const todayTasks = useMemo(() => getTasksForToday(), [getTasksForToday]);
  const todayCompletions = useMemo(
    () => completions.filter((c) => c.date === today),
    [completions, today],
  );

  // Pulsing animation for flame
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000 }),
        withTiming(1, { duration: 1000 }),
      ),
      -1,
      true,
    );
  }, []);

  const animatedFlameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  // Weekly visualization data (Sunday to Saturday)
  const weekData = useMemo(() => {
    const data = [];
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday

    // Find Sunday of current week
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - dayOfWeek);

    // Generate 7 days starting from Sunday
    for (let i = 0; i < 7; i++) {
      const date = new Date(sunday);
      date.setDate(sunday.getDate() + i);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      const activity = activities.find((a) => a.date === dateStr);
      const isToday = dateStr === today;
      const isFuture = date > now;

      data.push({
        day: DAYS_OF_WEEK[i],
        date: dateStr,
        completed: activity ? activity.tasksCompleted : 0,
        total: activity ? activity.taskTotal : 0,
        rate: activity ? activity.completionRate : 0,
        isToday,
        isFuture,
      });
    }
    return data;
  }, [activities, today]);

  // Today's progress
  const todayProgress = useMemo(() => {
    if (todayTasks.length === 0) return { completed: 0, total: 0, rate: 100 };
    const completed = todayCompletions.length;
    const total = todayTasks.length;
    const rate = Math.round((completed / total) * 100);
    return { completed, total, rate };
  }, [todayTasks, todayCompletions]);

  // Streak message based on streak count
  const streakMessage = useMemo(() => {
    if (currentStreak >= 100) return "LEGENDARY! 🏆";
    if (currentStreak >= 30) return "Unstoppable! 🔥";
    if (currentStreak >= 21) return "Habit Formed!";
    if (currentStreak >= 14) return "Two weeks strong!";
    if (currentStreak >= 7) return "Week warrior!";
    if (currentStreak >= 3) return "Building momentum!";
    if (currentStreak >= 1) return "Keep it going!";
    return "Start your streak!";
  }, [currentStreak]);

  return (
    <Animated.View entering={FadeIn.delay(100)} style={styles.container}>
      <LinearGradient
        colors={[Colors.surfaceElevated, Colors.surface]}
        style={styles.gradient}
      >
        {/* Top Row - Streak & Best */}
        <View style={styles.topRow}>
          {/* Flame with Streak */}
          <View style={styles.streakSection}>
            <Animated.View style={[styles.flameContainer, animatedFlameStyle]}>
              <LottieView
                ref={lottieRef}
                source={require("@/assets/images/flame.json")}
                autoPlay
                loop
                style={styles.flame}
              />
            </Animated.View>
            <View style={styles.streakNumbers}>
              <Text style={styles.streakCount}>{currentStreak}</Text>
              <Text style={styles.streakLabel}>DAY STREAK</Text>
            </View>
          </View>

          {/* Best Streak Badge */}
          <View style={styles.bestSection}>
            <View style={styles.bestBadge}>
              <Ionicons name="trophy" size={14} color={Colors.warning} />
              <Text style={styles.bestLabel}>BEST</Text>
            </View>
            <Text style={styles.bestCount}>{longestStreak}</Text>
          </View>
        </View>

        {/* Message */}
        <Text style={styles.message}>{streakMessage}</Text>

        {/* Weekly Progress */}
        <View style={styles.weekSection}>
          <Text style={styles.weekTitle}>This Week</Text>
          <View style={styles.weekRow}>
            {weekData.map((day, index) => {
              const isComplete = day.rate >= 80;
              const isPartial = day.rate > 0 && day.rate < 80;

              return (
                <View key={index} style={styles.dayItem}>
                  <Text
                    style={[
                      styles.dayLabel,
                      day.isToday && styles.dayLabelToday,
                    ]}
                  >
                    {day.day}
                  </Text>
                  <View
                    style={[
                      styles.dayCircle,
                      isComplete && styles.dayCircleComplete,
                      isPartial && styles.dayCirclePartial,
                      day.isToday && styles.dayCircleToday,
                      day.isFuture && styles.dayCircleFuture,
                    ]}
                  >
                    {isComplete && !day.isFuture && (
                      <Ionicons
                        name="checkmark"
                        size={14}
                        color={Colors.background}
                      />
                    )}
                    {isPartial && !day.isFuture && (
                      <View style={styles.partialDot} />
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Today's Progress Bar */}
        <View style={styles.todaySection}>
          <View style={styles.todayHeader}>
            <Text style={styles.todayLabel}>Today's Progress</Text>
            <Text style={styles.todayCount}>
              {todayProgress.completed}/{todayProgress.total}
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <LinearGradient
              colors={
                todayProgress.rate >= 100
                  ? [Colors.success, "#22C55E"]
                  : [Colors.cyberLime, "#B8E600"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.progressBarFill,
                { width: `${Math.max(todayProgress.rate, 3)}%` },
              ]}
            />
          </View>
          <Text style={styles.progressPercent}>{todayProgress.rate}%</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius["2xl"],
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.cyberLime,
  },
  gradient: {
    padding: Spacing.lg,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  streakSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  flameContainer: {
    width: 60,
    height: 60,
  },
  flame: {
    width: "100%",
    height: "100%",
  },
  streakNumbers: {
    alignItems: "flex-start",
  },
  streakCount: {
    fontSize: 48,
    fontFamily: Typography.fonts.number,
    color: Colors.cyberLime,
    lineHeight: 52,
  },
  streakLabel: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodySemibold,
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  bestSection: {
    alignItems: "center",
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  bestBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  bestLabel: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodySemibold,
    color: Colors.warning,
  },
  bestCount: {
    fontSize: Typography.sizes["2xl"],
    fontFamily: Typography.fonts.number,
    color: Colors.textPrimary,
  },
  message: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.bodySemibold,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  weekSection: {
    marginBottom: Spacing.lg,
  },
  weekTitle: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.bodySemibold,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayItem: {
    alignItems: "center",
    gap: 4,
  },
  dayLabel: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: Colors.textMuted,
  },
  dayLabelToday: {
    color: Colors.cyberLime,
    fontFamily: Typography.fonts.bodySemibold,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  dayCircleComplete: {
    backgroundColor: Colors.cyberLime,
    borderColor: Colors.cyberLime,
  },
  dayCirclePartial: {
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.warning,
  },
  dayCircleToday: {
    borderColor: Colors.cyberLime,
    borderWidth: 2,
  },
  dayCircleFuture: {
    opacity: 0.4,
  },
  partialDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.warning,
  },
  todaySection: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  todayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  todayLabel: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.bodySemibold,
    color: Colors.textSecondary,
  },
  todayCount: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.number,
    color: Colors.textPrimary,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: Colors.borderDefault,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
    marginBottom: Spacing.xs,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: BorderRadius.full,
  },
  progressPercent: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.number,
    color: Colors.cyberLime,
    textAlign: "right",
  },
});
