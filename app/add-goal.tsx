import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
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

import { BorderRadius, Colors, Spacing, Typography } from "@/constants/design";
import { useApp } from "@/context/AppContext";

const GOAL_PRESETS = [
  {
    title: "Read books",
    icon: "📚",
    unit: "books",
    defaultTarget: 52,
    trackItems: true,
  },
  {
    title: "Listen to podcasts",
    icon: "🎧",
    unit: "episodes",
    defaultTarget: 100,
    trackItems: true,
  },
  {
    title: "Workout",
    icon: "💪",
    unit: "sessions",
    defaultTarget: 200,
    trackItems: false,
  },
  {
    title: "Watch movies",
    icon: "🎬",
    unit: "movies",
    defaultTarget: 50,
    trackItems: true,
  },
  {
    title: "Complete courses",
    icon: "🎓",
    unit: "courses",
    defaultTarget: 12,
    trackItems: true,
  },
  {
    title: "Save money",
    icon: "💰",
    unit: "$",
    defaultTarget: 10000,
    trackItems: false,
  },
];

const EMOJI_OPTIONS = [
  "🎯",
  "💪",
  "📚",
  "💰",
  "🏃",
  "🥗",
  "🎸",
  "💻",
  "🎨",
  "🧩",
  "⚽",
  "🧘",
];

export default function AddGoalScreen() {
  const { addGoal } = useApp();

  const [title, setTitle] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [unit, setUnit] = useState("");
  const [targetType, setTargetType] = useState<"numeric" | "items">("numeric");
  const [selectedEmoji, setSelectedEmoji] = useState("🎯");
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentYear = new Date().getFullYear();

  const handlePresetSelect = (index: number) => {
    const preset = GOAL_PRESETS[index];
    setSelectedPreset(index);
    setTitle(preset.title);
    setUnit(preset.unit);
    setTargetValue(preset.defaultTarget.toString());
    setTargetType(preset.trackItems ? "items" : "numeric");
    setSelectedEmoji(preset.icon);
    Haptics.selectionAsync();
  };

  const handleSubmit = async () => {
    if (!title.trim() || !targetValue || parseInt(targetValue) <= 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await addGoal({
        title: title.trim(),
        description: "",
        year: currentYear,
        icon: selectedEmoji,
        targetType,
        targetValue: parseInt(targetValue),
        currentValue: 0,
        unit: unit.trim() || undefined,
        milestones: [],
        linkedTaskIds: [],
        isArchived: false,
        trackItems: targetType === "items",
        items: [],
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error) {
      console.error("Error adding goal:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = title.trim() && targetValue && parseInt(targetValue) > 0;

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
          <Text style={styles.headerTitle}>New Goal</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Year Badge */}
          <Animated.View
            entering={FadeInDown.delay(50)}
            style={styles.yearSection}
          >
            <View style={styles.yearBadge}>
              <Ionicons name="flag" size={14} color={Colors.background} />
              <Text style={styles.yearText}>{currentYear} Goal</Text>
            </View>
            <Text style={styles.subtitle}>
              Set a target and track your progress throughout the year
            </Text>
          </Animated.View>

          {/* Quick Start */}
          <Animated.View
            entering={FadeInDown.delay(100)}
            style={styles.section}
          >
            <Text style={styles.label}>Quick Start</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.presetsRow}
            >
              {GOAL_PRESETS.map((preset, index) => (
                <Pressable
                  key={index}
                  style={[
                    styles.presetCard,
                    selectedPreset === index && styles.presetCardSelected,
                  ]}
                  onPress={() => handlePresetSelect(index)}
                >
                  <Text style={styles.presetIcon}>{preset.icon}</Text>
                  <Text
                    style={[
                      styles.presetTitle,
                      selectedPreset === index && styles.presetTitleSelected,
                    ]}
                    numberOfLines={2}
                  >
                    {preset.title}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>

          {/* Emoji Selection */}
          <Animated.View
            entering={FadeInDown.delay(125)}
            style={styles.section}
          >
            <Text style={styles.label}>Goal Icon / Emoji</Text>
            <View style={styles.emojiGrid}>
              {EMOJI_OPTIONS.map((emoji) => (
                <Pressable
                  key={emoji}
                  style={[
                    styles.emojiItem,
                    selectedEmoji === emoji && styles.emojiItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedEmoji(emoji);
                    Haptics.selectionAsync();
                  }}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </Pressable>
              ))}
              <View style={styles.customEmojiContainer}>
                <TextInput
                  style={styles.customEmojiInput}
                  maxLength={2}
                  placeholder="+"
                  placeholderTextColor={Colors.textMuted}
                  onChangeText={(text) => {
                    if (text) setSelectedEmoji(text);
                  }}
                />
              </View>
            </View>
          </Animated.View>

          {/* Title */}
          <Animated.View
            entering={FadeInDown.delay(150)}
            style={styles.section}
          >
            <Text style={styles.label}>Goal Title</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={(text) => {
                  setTitle(text);
                  setSelectedPreset(null);
                }}
                placeholder="What do you want to achieve?"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </Animated.View>

          {/* Type Selection */}
          <Animated.View
            entering={FadeInDown.delay(175)}
            style={styles.section}
          >
            <Text style={styles.label}>Tracking Mode</Text>
            <View style={styles.typeGrid}>
              <Pressable
                style={[
                  styles.typeCard,
                  targetType === "numeric" && styles.typeCardActive,
                ]}
                onPress={() => {
                  setTargetType("numeric");
                  Haptics.selectionAsync();
                }}
              >
                <Ionicons
                  name="stats-chart"
                  size={20}
                  color={
                    targetType === "numeric"
                      ? Colors.background
                      : Colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.typeCardText,
                    targetType === "numeric" && styles.typeCardTextActive,
                  ]}
                >
                  Value
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.typeCard,
                  targetType === "items" && styles.typeCardActive,
                ]}
                onPress={() => {
                  setTargetType("items");
                  Haptics.selectionAsync();
                }}
              >
                <Ionicons
                  name="list"
                  size={20}
                  color={
                    targetType === "items"
                      ? Colors.background
                      : Colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.typeCardText,
                    targetType === "items" && styles.typeCardTextActive,
                  ]}
                >
                  Items
                </Text>
              </Pressable>
            </View>
          </Animated.View>

          {/* Target & Unit */}
          <Animated.View
            entering={FadeInDown.delay(200)}
            style={styles.section}
          >
            <Text style={styles.label}>Target</Text>
            <View style={styles.targetRow}>
              <View style={[styles.inputContainer, { flex: 1 }]}>
                <TextInput
                  style={[styles.input, styles.targetInput]}
                  value={targetValue}
                  onChangeText={setTargetValue}
                  placeholder="52"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="number-pad"
                />
              </View>
              <View style={[styles.inputContainer, { flex: 1.5 }]}>
                <TextInput
                  style={styles.input}
                  value={unit}
                  onChangeText={setUnit}
                  placeholder={
                    targetType === "numeric"
                      ? "miles, $, etc."
                      : "books, movies, etc."
                  }
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            </View>
            <Text style={styles.helperText}>
              {targetType === "numeric"
                ? "Enter your total target value. You can add progress periodically."
                : "Enter the number of items you want to complete. You'll add them to a list."}
            </Text>
          </Animated.View>

          {/* Preview */}
          {isValid && (
            <Animated.View
              entering={FadeInDown.delay(300)}
              style={styles.section}
            >
              <Text style={styles.label}>Preview</Text>
              <View style={styles.previewCard}>
                <View style={styles.previewHeader}>
                  <View style={styles.previewIconContainer}>
                    <Text style={styles.previewEmoji}>{selectedEmoji}</Text>
                  </View>
                  <View style={styles.previewInfo}>
                    <Text style={styles.previewTitle}>{title}</Text>
                    <View style={styles.previewBadgeRow}>
                      <View style={styles.previewBadge}>
                        <Ionicons
                          name={
                            targetType === "numeric" ? "stats-chart" : "list"
                          }
                          size={10}
                          color={Colors.cyberLime}
                        />
                        <Text style={styles.previewBadgeText}>
                          {targetType === "numeric"
                            ? "Value Tracking"
                            : "Item Checklist"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={styles.previewProgress}>
                  <Text style={styles.previewProgressText}>
                    0 / {targetValue} {unit}
                  </Text>
                  <Text style={styles.previewProgressPercent}>0%</Text>
                </View>
                <View style={styles.previewProgressBarBg}>
                  <View style={styles.previewProgressBarFill} />
                </View>
              </View>
            </Animated.View>
          )}
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <Pressable
            style={[
              styles.submitButton,
              (!isValid || isSubmitting) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!isValid || isSubmitting}
          >
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={Colors.background}
            />
            <Text style={styles.submitButtonText}>
              {isSubmitting ? "Creating..." : "Create Goal"}
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
  yearSection: {
    marginBottom: Spacing["2xl"],
  },
  yearBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.cyberLime,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    alignSelf: "flex-start",
    marginBottom: Spacing.md,
  },
  yearText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.bodySemibold,
    color: Colors.background,
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
    lineHeight: 22,
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
  presetsRow: {
    gap: Spacing.md,
  },
  presetCard: {
    width: 90,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    alignItems: "center",
  },
  presetCardSelected: {
    backgroundColor: Colors.cyberLimeLight,
    borderColor: Colors.cyberLime,
  },
  presetIcon: {
    fontSize: 28,
    marginBottom: Spacing.sm,
  },
  presetTitle: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodySemibold,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  presetTitleSelected: {
    color: Colors.textPrimary,
  },
  inputContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  input: {
    padding: Spacing.lg,
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.bodyMedium,
    color: Colors.textPrimary,
  },
  targetRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  targetInput: {
    textAlign: "center",
    fontSize: Typography.sizes["2xl"],
    fontFamily: Typography.fonts.number,
  },
  helperText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
    lineHeight: 16,
  },
  emojiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  emojiItem: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceElevated,
  },
  emojiItemSelected: {
    backgroundColor: Colors.cyberLimeLight,
    borderWidth: 1,
    borderColor: Colors.cyberLime,
  },
  emojiText: {
    fontSize: 20,
  },
  customEmojiContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceElevated,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  customEmojiInput: {
    fontSize: 18,
    textAlign: "center",
    color: Colors.textPrimary,
    width: "100%",
  },
  typeGrid: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  typeCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  typeCardActive: {
    backgroundColor: Colors.cyberLime,
    borderColor: Colors.cyberLime,
  },
  typeCardText: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.bodySemibold,
    color: Colors.textSecondary,
  },
  typeCardTextActive: {
    color: Colors.background,
  },
  previewCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  previewIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  previewEmoji: {
    fontSize: 24,
  },
  previewInfo: {
    flex: 1,
  },
  previewTitle: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fonts.heading,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  previewBadgeRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  previewBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.cyberLimeLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  previewBadgeText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodySemibold,
    color: Colors.cyberLime,
  },
  previewProgress: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: Spacing.sm,
  },
  previewProgressText: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fonts.number,
    color: Colors.textPrimary,
  },
  previewProgressPercent: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.number,
    color: Colors.cyberLime,
  },
  previewProgressBarBg: {
    height: 8,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  previewProgressBarFill: {
    width: "5%",
    height: "100%",
    backgroundColor: Colors.cyberLime,
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
