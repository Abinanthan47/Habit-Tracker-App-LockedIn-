import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  BorderRadius,
  Colors,
  getCategoryColor,
  Spacing,
  Typography,
} from "@/constants/design";
import { useApp } from "@/context/AppContext";
import type {
  TaskCategory,
  TaskFrequency,
  TaskPriority,
  TimeOfDay,
} from "@/types";

// Category options
const CATEGORY_OPTIONS: {
  category: TaskCategory;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}[] = [
  { category: "health", icon: "heart-outline", label: "Health" },
  { category: "fitness", icon: "barbell-outline", label: "Fitness" },
  { category: "personal", icon: "person-outline", label: "Personal" },
  { category: "work", icon: "briefcase-outline", label: "Work" },
  { category: "learning", icon: "book-outline", label: "Learning" },
  { category: "mindfulness", icon: "leaf-outline", label: "Mindful" },
];

const TIME_OPTIONS: {
  key: TimeOfDay;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: "morning", label: "Morning", icon: "sunny-outline" },
  { key: "afternoon", label: "Afternoon", icon: "partly-sunny-outline" },
  { key: "evening", label: "Evening", icon: "moon-outline" },
  { key: "anytime", label: "Anytime", icon: "time-outline" },
];

const FREQUENCY_OPTIONS: {
  key: TaskFrequency;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    key: "daily",
    label: "Daily",
    description: "Every day",
    icon: "today-outline",
  },
  {
    key: "weekly",
    label: "Weekly",
    description: "Once a week",
    icon: "calendar-outline",
  },
  {
    key: "monthly",
    label: "Monthly",
    description: "Once a month",
    icon: "calendar-number-outline",
  },
];

const PRIORITY_OPTIONS: {
  key: TaskPriority;
  label: string;
  color: string;
}[] = [
  { key: "low", label: "Low", color: Colors.info },
  { key: "medium", label: "Medium", color: Colors.warning },
  { key: "high", label: "High", color: Colors.error },
];

export default function AddTaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addTask, updateTask, tasks } = useApp();

  const [name, setName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("morning");
  const [frequency, setFrequency] = useState<TaskFrequency>("daily");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!id;

  // Populate data if editing
  useEffect(() => {
    if (id && tasks.length > 0) {
      const task = tasks.find((t) => t.id === id);
      if (task) {
        setName(task.name);
        setTimeOfDay(task.timeOfDay);
        setFrequency(task.frequency);
        setPriority(task.priority || "medium");

        const catIndex = CATEGORY_OPTIONS.findIndex(
          (c) => c.category === task.category,
        );
        if (catIndex > -1) setSelectedCategory(catIndex);
      }
    }
  }, [id, tasks]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      if (isEditing) {
        await updateTask(id!, {
          name: name.trim(),
          category: CATEGORY_OPTIONS[selectedCategory].category,
          timeOfDay,
          frequency,
          priority,
        });
      } else {
        await addTask({
          name: name.trim(),
          category: CATEGORY_OPTIONS[selectedCategory].category,
          timeOfDay,
          frequency,
          priority,
        });
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error) {
      console.error("Error saving task:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "left", "right", "bottom"]}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.closeButton} onPress={() => router.back()}>
            <Ionicons name="close" size={22} color={Colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>
            {isEditing ? "Edit Habit" : "New Habit"}
          </Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Name Input */}
          <Animated.View entering={FadeInDown.delay(50)} style={styles.section}>
            <Text style={styles.label}>Habit Name</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g., Drink 2L Water"
                placeholderTextColor={Colors.textMuted}
                autoFocus
                returnKeyType="done"
              />
            </View>
          </Animated.View>

          {/* Frequency Options */}
          <Animated.View
            entering={FadeInDown.delay(100)}
            style={styles.section}
          >
            <Text style={styles.label}>Frequency</Text>
            <View style={styles.frequencyGrid}>
              {FREQUENCY_OPTIONS.map((option) => {
                const isSelected = frequency === option.key;

                return (
                  <Pressable
                    key={option.key}
                    style={[
                      styles.frequencyCard,
                      isSelected && styles.frequencyCardSelected,
                    ]}
                    onPress={() => {
                      setFrequency(option.key);
                      Haptics.selectionAsync();
                    }}
                  >
                    <View
                      style={[
                        styles.frequencyIconContainer,
                        isSelected && styles.frequencyIconSelected,
                      ]}
                    >
                      <Ionicons
                        name={option.icon}
                        size={20}
                        color={
                          isSelected ? Colors.background : Colors.textSecondary
                        }
                      />
                    </View>
                    <Text
                      style={[
                        styles.frequencyLabel,
                        isSelected && styles.frequencyLabelSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                    <Text style={styles.frequencyDescription}>
                      {option.description}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>

          {/* Category Picker */}
          <Animated.View
            entering={FadeInDown.delay(150)}
            style={styles.section}
          >
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryGrid}>
              {CATEGORY_OPTIONS.map((item, index) => {
                const isSelected = selectedCategory === index;
                const categoryColor = getCategoryColor(item.category);

                return (
                  <Pressable
                    key={index}
                    style={[
                      styles.categoryCard,
                      isSelected && styles.categoryCardSelected,
                      isSelected && { borderColor: categoryColor },
                    ]}
                    onPress={() => {
                      setSelectedCategory(index);
                      Haptics.selectionAsync();
                    }}
                  >
                    <View
                      style={[
                        styles.categoryIconContainer,
                        {
                          backgroundColor: isSelected
                            ? `${categoryColor}20`
                            : Colors.surfaceElevated,
                        },
                      ]}
                    >
                      <Ionicons
                        name={item.icon}
                        size={20}
                        color={
                          isSelected ? categoryColor : Colors.textSecondary
                        }
                      />
                    </View>
                    <Text
                      style={[
                        styles.categoryLabel,
                        isSelected && { color: Colors.textPrimary },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>

          {/* Time of Day */}
          <Animated.View
            entering={FadeInDown.delay(200)}
            style={styles.section}
          >
            <Text style={styles.label}>Best Time</Text>
            <View style={styles.timeGrid}>
              {TIME_OPTIONS.map((option) => {
                const isSelected = timeOfDay === option.key;

                return (
                  <Pressable
                    key={option.key}
                    style={[
                      styles.timeCard,
                      isSelected && styles.timeCardSelected,
                    ]}
                    onPress={() => {
                      setTimeOfDay(option.key);
                      Haptics.selectionAsync();
                    }}
                  >
                    <Ionicons
                      name={option.icon}
                      size={16}
                      color={
                        isSelected ? Colors.background : Colors.textSecondary
                      }
                    />
                    <Text
                      style={[
                        styles.timeLabel,
                        isSelected && styles.timeLabelSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>

          {/* Priority Selection */}
          <Animated.View
            entering={FadeInDown.delay(225)}
            style={styles.section}
          >
            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityGrid}>
              {PRIORITY_OPTIONS.map((option) => {
                const isSelected = priority === option.key;

                return (
                  <Pressable
                    key={option.key}
                    style={[
                      styles.priorityCard,
                      isSelected && {
                        backgroundColor: `${option.color}20`,
                        borderColor: option.color,
                      },
                    ]}
                    onPress={() => {
                      setPriority(option.key);
                      Haptics.selectionAsync();
                    }}
                  >
                    <Ionicons
                      name={isSelected ? "flag" : "flag-outline"}
                      size={16}
                      color={isSelected ? option.color : Colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.priorityLabel,
                        isSelected && { color: option.color },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>

          {/* Preview Card */}
          {name.trim() && (
            <Animated.View
              entering={FadeInDown.delay(250)}
              style={styles.section}
            >
              <Text style={styles.label}>Preview</Text>
              <View style={styles.previewCard}>
                <View style={styles.previewLeft}>
                  <View style={styles.previewCheckbox} />
                  <View>
                    <Text style={styles.previewName}>{name.trim()}</Text>
                    <Text style={styles.previewMeta}>
                      {CATEGORY_OPTIONS[selectedCategory].label} • {frequency} •{" "}
                      {TIME_OPTIONS.find((t) => t.key === timeOfDay)?.label}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.previewDot,
                    {
                      backgroundColor: getCategoryColor(
                        CATEGORY_OPTIONS[selectedCategory].category,
                      ),
                    },
                  ]}
                />
              </View>
            </Animated.View>
          )}
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <Pressable
            style={[
              styles.submitButton,
              (!name.trim() || isSubmitting) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!name.trim() || isSubmitting}
          >
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={Colors.background}
            />
            <Text style={styles.submitButtonText}>
              {isSubmitting
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : "Create Habit"}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderDefault,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fonts.heading,
    color: Colors.textPrimary,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing["3xl"],
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.bodySemibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  inputContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  input: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fonts.bodyMedium,
    color: Colors.textPrimary,
  },
  frequencyGrid: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  frequencyCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  frequencyCardSelected: {
    backgroundColor: Colors.cyberLimeLight,
    borderColor: Colors.cyberLime,
  },
  frequencyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  frequencyIconSelected: {
    backgroundColor: Colors.cyberLime,
  },
  frequencyLabel: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.bodySemibold,
    color: Colors.textSecondary,
  },
  frequencyLabelSelected: {
    color: Colors.textPrimary,
  },
  frequencyDescription: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: Colors.textMuted,
    marginTop: 2,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -Spacing.xs,
  },
  categoryCard: {
    width: "31.33%",
    marginHorizontal: "1%",
    aspectRatio: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  categoryCardSelected: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 2,
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  categoryLabel: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodySemibold,
    color: Colors.textSecondary,
  },
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  timeCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    gap: Spacing.sm,
  },
  timeCardSelected: {
    backgroundColor: Colors.cyberLime,
    borderColor: Colors.cyberLime,
  },
  timeLabel: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.bodySemibold,
    color: Colors.textSecondary,
  },
  timeLabelSelected: {
    color: Colors.background,
  },
  priorityGrid: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  priorityCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    gap: Spacing.xs,
  },
  priorityLabel: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.bodySemibold,
    color: Colors.textSecondary,
  },
  previewCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  previewLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  previewCheckbox: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    borderColor: Colors.borderDefault,
    backgroundColor: Colors.surfaceElevated,
  },
  previewName: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.bodyMedium,
    color: Colors.textPrimary,
  },
  previewMeta: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
    marginTop: 2,
    textTransform: "capitalize",
  },
  previewDot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderDefault,
    backgroundColor: Colors.background,
  },
  submitButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.cyberLime,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  submitButtonDisabled: {
    opacity: 0.4,
  },
  submitButtonText: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.bodySemibold,
    color: Colors.background,
  },
});
