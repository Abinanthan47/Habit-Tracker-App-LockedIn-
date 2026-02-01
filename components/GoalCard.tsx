import type { Goal } from "@/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { BorderRadius, Colors, Spacing, Typography } from "@/constants/design";

const AnimatedView = Animated.createAnimatedComponent(View);

interface GoalCardProps {
  goal: Goal;
  onPress?: () => void;
  onUpdateProgress?: (value: number) => void;
}

export function GoalCard({ goal, onPress, onUpdateProgress }: GoalCardProps) {
  const progressPercent = Math.min(
    (goal.currentValue / goal.targetValue) * 100,
    100,
  );
  const progressWidth = useSharedValue(0);

  React.useEffect(() => {
    progressWidth.value = withSpring(progressPercent, {
      damping: 20,
      stiffness: 100,
    });
  }, [progressPercent, progressWidth]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const isCompleted = goal.currentValue >= goal.targetValue;

  return (
    <Pressable
      onPress={onPress}
      style={[styles.container, isCompleted && styles.containerCompleted]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconBox, isCompleted && styles.iconBoxCompleted]}>
          <Text style={styles.emoji}>{getGoalEmoji(goal.title)}</Text>
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {goal.title}
          </Text>
          <View
            style={[
              styles.statusBadge,
              isCompleted && styles.statusBadgeCompleted,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isCompleted && styles.statusTextCompleted,
              ]}
            >
              {isCompleted
                ? "Completed"
                : progressPercent >= 75
                  ? "Almost there"
                  : progressPercent >= 50
                    ? "On track"
                    : "In progress"}
            </Text>
          </View>
        </View>
        {isCompleted && (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark" size={14} color={Colors.background} />
          </View>
        )}
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressValue}>
            {goal.currentValue} / {goal.targetValue}
          </Text>
          <Text style={styles.progressUnit}>{goal.unit || "units"}</Text>
        </View>
        <Text style={styles.progressPercent}>
          {Math.round(progressPercent)}%
        </Text>
      </View>

      <View style={styles.progressBar}>
        <AnimatedView
          style={[
            styles.progressFill,
            progressStyle,
            isCompleted && styles.progressFillCompleted,
          ]}
        />
      </View>

      {/* Actions */}
      {onUpdateProgress && !isCompleted && (
        <View style={styles.actions}>
          <Pressable
            style={styles.decrementButton}
            onPress={() => onUpdateProgress(Math.max(0, goal.currentValue - 1))}
          >
            <Ionicons name="remove" size={16} color={Colors.textSecondary} />
          </Pressable>
          <Pressable
            style={styles.incrementButton}
            onPress={() => onUpdateProgress(goal.currentValue + 1)}
          >
            <Ionicons name="add" size={16} color={Colors.background} />
            <Text style={styles.incrementText}>Add +1</Text>
          </Pressable>
        </View>
      )}
    </Pressable>
  );
}

function getGoalEmoji(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes("read")) return "📚";
  if (lower.includes("workout") || lower.includes("gym")) return "💪";
  if (lower.includes("run")) return "🏃";
  if (lower.includes("code")) return "💻";
  if (lower.includes("money") || lower.includes("save")) return "💰";
  if (lower.includes("meditat")) return "🧘";
  return "🎯";
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  containerCompleted: {
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.borderMuted,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.lg,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.cyberLimeLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  iconBoxCompleted: {
    backgroundColor: "rgba(0, 255, 136, 0.15)",
  },
  emoji: {
    fontSize: 22,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  statusBadge: {
    alignSelf: "flex-start",
    backgroundColor: Colors.cyberLimeLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  statusBadgeCompleted: {
    backgroundColor: "rgba(0, 255, 136, 0.15)",
  },
  statusText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.cyberLime,
  },
  statusTextCompleted: {
    color: Colors.success,
  },
  completedBadge: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.success,
    justifyContent: "center",
    alignItems: "center",
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: Spacing.sm,
  },
  progressInfo: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: Spacing.xs,
  },
  progressValue: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  progressUnit: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  progressPercent: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.black,
    color: Colors.cyberLime,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
    marginBottom: Spacing.lg,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.cyberLime,
    borderRadius: BorderRadius.full,
  },
  progressFillCompleted: {
    backgroundColor: Colors.success,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Spacing.sm,
  },
  decrementButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    justifyContent: "center",
    alignItems: "center",
  },
  incrementButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.cyberLime,
    justifyContent: "center",
  },
  incrementText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.background,
  },
});
