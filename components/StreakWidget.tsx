import { BorderRadius, Colors, Spacing, Typography } from "@/constants/design";
import { useApp } from "@/context/AppContext";
import { formatDate } from "@/lib/dates";
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

// Week from Sunday to Saturday
const DAYS_OF_WEEK = ["S", "M", "T", "W", "T", "F", "S"];

export function StreakWidget() {
  const { currentStreak, activities, completions, getTasksForToday } = useApp();
  const lottieRef = useRef<LottieView>(null);

  // Get today's date properly formatted in LOCAL timezone
  const today = useMemo(() => {
    const now = new Date();
    return formatDate(now);
  }, []);

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
        withTiming(1.1, { duration: 1000 }),
        withTiming(1, { duration: 1000 }),
      ),
      -1,
      true,
    );
  }, []);

  const animatedFlameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  // Weekly visualization data (Sunday to Saturday) - properly synced with LOCAL timezone
  const weekData = useMemo(() => {
    const data = [];
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday

    // Find Sunday of current week using local date
    const sunday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - dayOfWeek,
    );

    // Generate 7 days starting from Sunday
    for (let i = 0; i < 7; i++) {
      const date = new Date(
        sunday.getFullYear(),
        sunday.getMonth(),
        sunday.getDate() + i,
      );
      const dateStr = formatDate(date);

      const activity = activities.find((a) => a.date === dateStr);

      // Check if date is today using same format
      const isToday = dateStr === today;

      // Check if date is in the future using local midnight comparison
      const todayMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );
      const dateMidnight = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      );
      const isFuture = dateMidnight > todayMidnight;

      data.push({
        day: DAYS_OF_WEEK[i],
        date: dateStr,
        dayNumber: date.getDate(),
        completed: activity ? activity.tasksCompleted : 0,
        total: activity ? activity.taskTotal : 0,
        rate: activity ? activity.completionRate : 0,
        isToday,
        isFuture,
      });
    }
    return data;
  }, [activities, today]);

  // Today's progress - based on daily tasks only
  const todayProgress = useMemo(() => {
    if (todayTasks.length === 0) return { completed: 0, total: 0, rate: 100 };
    const completed = todayCompletions.length;
    const total = todayTasks.length;
    const rate = Math.round((completed / total) * 100);
    return { completed, total, rate };
  }, [todayTasks, todayCompletions]);

  // Streak message based on streak count
  const streakMessage = useMemo(() => {
    if (currentStreak >= 100) return "Legendary!";
    if (currentStreak >= 30) return "Unstoppable!";
    if (currentStreak >= 21) return "Habit Formed!";
    if (currentStreak >= 14) return "Two weeks!";
    if (currentStreak >= 7) return "One week!";
    if (currentStreak >= 3) return "Building!";
    if (currentStreak >= 1) return "Keep going!";
    return "Start today!";
  }, [currentStreak]);

  return (
    <Animated.View entering={FadeIn.delay(100)} style={styles.container}>
      <LinearGradient
        colors={[Colors.surfaceElevated, Colors.surface]}
        style={styles.gradient}
      >
        {/* Top Row - Streak Number with Flame on Right */}
        <View style={styles.topSection}>
          {/* Left: Streak Number */}
          <View style={styles.streakNumberContainer}>
            <Text style={styles.streakNumber}>{currentStreak}</Text>
          </View>

          {/* Center: Streak Text */}
          <View style={styles.streakTextContainer}>
            <Text style={styles.streakTitle}>Days Streak</Text>
            <Text style={styles.streakSubtitle}>{streakMessage}</Text>
          </View>

          {/* Right: Flame Animation */}
          <Animated.View style={[styles.flameContainer, animatedFlameStyle]}>
            <LottieView
              ref={lottieRef}
              source={require("@/assets/images/flame.json")}
              autoPlay
              loop
              style={styles.flame}
            />
          </Animated.View>
        </View>

        {/* Week Days Row - Sun to Sat */}
        <View style={styles.weekSection}>
          {weekData.map((day, index) => {
            const isComplete = day.rate >= 80;
            const isPartial = day.rate > 0 && day.rate < 80;

            return (
              <View key={`day-${index}`} style={styles.dayColumn}>
                {/* Day Label */}
                <Text
                  style={[styles.dayLabel, day.isToday && styles.dayLabelToday]}
                >
                  {day.day}
                </Text>

                {/* Day Number / Status */}
                <View
                  style={[
                    styles.dayCircle,
                    day.isToday && styles.dayCircleToday,
                    isComplete && !day.isFuture && styles.dayCircleComplete,
                    isPartial && !day.isFuture && styles.dayCirclePartial,
                  ]}
                >
                  {day.isFuture ? (
                    <Text style={styles.dayNumberFuture}>{day.dayNumber}</Text>
                  ) : isComplete ? (
                    <Text style={styles.dayFlame}>
                      <Ionicons name="checkmark" size={14} color={"white"} />
                    </Text>
                  ) : isPartial ? (
                    <Text style={styles.dayNumberPartial}>{day.dayNumber}</Text>
                  ) : (
                    <Text
                      style={[
                        styles.dayNumber,
                        day.isToday && styles.dayNumberToday,
                      ]}
                    >
                      {day.dayNumber}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Today's Tasks Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Today's Tasks</Text>
            <Text style={styles.progressCount}>
              {todayProgress.completed}/{todayProgress.total}
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <LinearGradient
              colors={
                todayProgress.rate >= 100
                  ? [Colors.success, "#96fd51ff"]
                  : [Colors.cyberLime, Colors.cyberLimeMuted]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.progressBarFill,
                { width: `${Math.max(todayProgress.rate, 3)}%` },
              ]}
            />
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  gradient: {
    padding: Spacing.lg,
  },
  topSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  streakNumberContainer: {
    marginRight: Spacing.md,
  },
  streakNumber: {
    fontSize: 52,
    fontFamily: Typography.fonts.number,
    color: Colors.cyberLime,
    lineHeight: 56,
  },
  streakTextContainer: {
    flex: 1,
  },
  streakTitle: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.fonts.heading,
    color: Colors.textPrimary,
  },
  streakSubtitle: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  flameContainer: {
    width: 56,
    height: 56,
  },
  flame: {
    width: "100%",
    height: "100%",
  },
  weekSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderMuted,
  },
  dayColumn: {
    alignItems: "center",
    gap: Spacing.xs,
  },
  dayLabel: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodySemibold,
    color: Colors.textMuted,
  },
  dayLabelToday: {
    color: Colors.cyberLime,
  },
  dayCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  dayCircleToday: {
    borderColor: Colors.cyberLime,
    borderWidth: 2,
  },
  dayCircleComplete: {
    backgroundColor: Colors.cyberLimeLight,
    borderColor: Colors.cyberLime,
  },
  dayCirclePartial: {
    backgroundColor: `${Colors.warning}20`,
    borderColor: Colors.warning,
  },
  dayNumber: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.number,
    color: Colors.textSecondary,
  },
  dayNumberToday: {
    color: Colors.cyberLime,
  },
  dayNumberFuture: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.number,
    color: Colors.textMuted,
  },
  dayNumberPartial: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.number,
    color: Colors.warning,
  },
  dayFlame: {
    fontSize: 13,
  },
  progressSection: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderMuted,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  progressLabel: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.bodySemibold,
    color: Colors.textPrimary,
  },
  progressCount: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.number,
    color: Colors.cyberLime,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: BorderRadius.full,
  },
});
