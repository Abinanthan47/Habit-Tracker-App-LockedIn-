import type { Task } from "@/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import React, { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import {
  BorderRadius,
  Colors,
  getCategoryColor,
  Spacing,
  Typography,
} from "@/constants/design";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface TaskItemProps {
  task: Task;
  isCompleted: boolean;
  streak?: number;
  onToggle: () => void;
  onDelete?: () => void;
}

export function TaskItem({
  task,
  isCompleted,
  streak = 0,
  onToggle,
}: TaskItemProps) {
  const scale = useSharedValue(1);
  const checkScale = useSharedValue(isCompleted ? 1 : 0);

  React.useEffect(() => {
    checkScale.value = withSpring(isCompleted ? 1 : 0, {
      damping: 12,
      stiffness: 150,
    });
  }, [isCompleted, checkScale]);

  const handleToggle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    scale.value = withSequence(
      withTiming(0.95, { duration: 80 }),
      withSpring(1, { damping: 10, stiffness: 300 }),
    );

    onToggle();
  }, [onToggle, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const categoryColor = getCategoryColor(task.category);

  const getCategoryIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (task.category) {
      case "health":
        return "heart-outline";
      case "fitness":
        return "barbell-outline";
      case "mindfulness":
        return "leaf-outline";
      case "learning":
        return "book-outline";
      case "work":
        return "briefcase-outline";
      default:
        return "ellipse-outline";
    }
  };

  return (
    <AnimatedPressable
      onPress={handleToggle}
      style={[
        styles.container,
        isCompleted && styles.containerCompleted,
        animatedStyle,
      ]}
    >
      {/* Checkbox */}
      <View style={[styles.checkbox, isCompleted && styles.checkboxDone]}>
        {isCompleted && (
          <Ionicons name="checkmark" size={14} color={Colors.background} />
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text
          style={[styles.name, isCompleted && styles.completedText]}
          numberOfLines={2}
        >
          {task.name}
        </Text>
        <View style={styles.metaRow}>
          {streak > 0 ? (
            <View style={styles.streakBadge}>
              <Ionicons name="flame" size={10} color={Colors.warning} />
              <Text style={styles.streakText}>{streak} day streak</Text>
            </View>
          ) : (
            <>
              <Ionicons
                name={
                  task.timeOfDay === "morning"
                    ? "sunny-outline"
                    : task.timeOfDay === "evening"
                      ? "moon-outline"
                      : "time-outline"
                }
                size={12}
                color={isCompleted ? Colors.textMuted : Colors.textSecondary}
              />
              <Text style={[styles.meta, isCompleted && styles.metaCompleted]}>
                {task.timeOfDay.charAt(0).toUpperCase() +
                  task.timeOfDay.slice(1)}
              </Text>
            </>
          )}
        </View>
      </View>

      {/* Category Icon */}
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: isCompleted
              ? Colors.surface
              : `${categoryColor}15`,
          },
        ]}
      >
        <Ionicons
          name={getCategoryIcon()}
          size={18}
          color={isCompleted ? Colors.textMuted : categoryColor}
        />
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  containerCompleted: {
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.borderMuted,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    borderColor: Colors.borderDefault,
    backgroundColor: Colors.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxDone: {
    backgroundColor: Colors.cyberLime,
    borderColor: Colors.cyberLime,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  completedText: {
    color: Colors.textMuted,
    textDecorationLine: "line-through",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  meta: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  metaCompleted: {
    color: Colors.textMuted,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  streakText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    color: Colors.warning,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
});
