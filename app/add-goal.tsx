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

import { useApp } from "@/context/AppContext";

// Neo-Brutalism Vibrant Colors
const COLORS = {
  bg: "#FFB1D8",
  pastelGreen: "#C1FF72",
  pastelYellow: "#FDFD96",
  pastelBlue: "#A0D7FF",
  pastelPurple: "#C5B4E3",
  white: "#FFFFFF",
  black: "#000000",
  darkCard: "#1a1a2e",
  muted: "rgba(0,0,0,0.6)",
};

const GOAL_PRESETS = [
  { title: "Read books", icon: "📚", unit: "books", defaultTarget: 52 },
  { title: "Workout", icon: "💪", unit: "sessions", defaultTarget: 200 },
  { title: "Meditate", icon: "🧘", unit: "sessions", defaultTarget: 365 },
  { title: "Running", icon: "🏃", unit: "miles", defaultTarget: 500 },
  { title: "Code", icon: "💻", unit: "projects", defaultTarget: 12 },
  { title: "Save money", icon: "💰", unit: "$", defaultTarget: 10000 },
];

export default function AddGoalScreen() {
  const { addGoal } = useApp();

  const [title, setTitle] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [unit, setUnit] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentYear = new Date().getFullYear();

  const handlePresetSelect = (index: number) => {
    const preset = GOAL_PRESETS[index];
    setSelectedPreset(index);
    setTitle(preset.title);
    setUnit(preset.unit);
    setTargetValue(preset.defaultTarget.toString());
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
        targetType: "numeric",
        targetValue: parseInt(targetValue),
        currentValue: 0,
        unit: unit.trim() || undefined,
        milestones: [],
        linkedTaskIds: [],
        isArchived: false,
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
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.closeButton} onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={COLORS.black} />
          </Pressable>
          <Text style={styles.headerTitle}>NEW GOAL</Text>
          <View style={{ width: 48 }} />
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
              <Text style={styles.yearText}>{currentYear} GOAL</Text>
            </View>
            <Text style={styles.subtitle}>
              Set a target and track your progress
            </Text>
          </Animated.View>

          {/* Presets */}
          <Animated.View
            entering={FadeInDown.delay(100)}
            style={styles.section}
          >
            <Text style={styles.label}>QUICK START</Text>
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
                  <Text style={styles.presetTitle}>{preset.title}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>

          {/* Title */}
          <Animated.View
            entering={FadeInDown.delay(150)}
            style={styles.section}
          >
            <Text style={styles.label}>GOAL TITLE</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={(text) => {
                  setTitle(text);
                  setSelectedPreset(null);
                }}
                placeholder="What do you want to achieve?"
                placeholderTextColor={COLORS.muted}
              />
            </View>
          </Animated.View>

          {/* Target & Unit */}
          <Animated.View
            entering={FadeInDown.delay(200)}
            style={styles.section}
          >
            <Text style={styles.label}>TARGET</Text>
            <View style={styles.targetRow}>
              <View style={[styles.inputContainer, { flex: 1 }]}>
                <TextInput
                  style={[styles.input, styles.targetInput]}
                  value={targetValue}
                  onChangeText={setTargetValue}
                  placeholder="52"
                  placeholderTextColor={COLORS.muted}
                  keyboardType="number-pad"
                />
              </View>
              <View style={[styles.inputContainer, { flex: 1.5 }]}>
                <TextInput
                  style={styles.input}
                  value={unit}
                  onChangeText={setUnit}
                  placeholder="books, miles, etc."
                  placeholderTextColor={COLORS.muted}
                />
              </View>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Submit */}
        <SafeAreaView edges={["bottom"]} style={styles.footerSafeArea}>
          <Animated.View entering={FadeInDown.delay(250)} style={styles.footer}>
            <Pressable
              style={[
                styles.submitButton,
                (!isValid || isSubmitting) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!isValid || isSubmitting}
            >
              <Ionicons name="add" size={24} color={COLORS.white} />
              <Text style={styles.submitButtonText}>
                {isSubmitting ? "CREATING..." : "CREATE GOAL"}
              </Text>
            </Pressable>
          </Animated.View>
        </SafeAreaView>
      </KeyboardAvoidingView>
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.black,
  },
  closeButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 3,
    borderColor: COLORS.black,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.black,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.black,
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  yearSection: {
    marginBottom: 24,
  },
  yearBadge: {
    backgroundColor: COLORS.pastelYellow,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.black,
    alignSelf: "flex-start",
    marginBottom: 10,
    shadowColor: COLORS.black,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  yearText: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.black,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.muted,
  },
  section: {
    marginBottom: 22,
  },
  label: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.muted,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  presetsRow: {
    gap: 10,
  },
  presetCard: {
    width: 95,
    padding: 14,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 3,
    borderColor: COLORS.black,
    alignItems: "center",
    shadowColor: COLORS.black,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  presetCardSelected: {
    backgroundColor: COLORS.pastelGreen,
  },
  presetIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  presetTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.black,
    textAlign: "center",
  },
  inputContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: COLORS.black,
    shadowColor: COLORS.black,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  input: {
    padding: 16,
    fontSize: 15,
    color: COLORS.black,
    fontWeight: "700",
  },
  targetRow: {
    flexDirection: "row",
    gap: 10,
  },
  targetInput: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "900",
  },
  footerSafeArea: {
    backgroundColor: COLORS.bg,
  },
  footer: {
    padding: 20,
    paddingTop: 12,
    borderTopWidth: 3,
    borderTopColor: COLORS.black,
  },
  submitButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.darkCard,
    padding: 16,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: COLORS.black,
    gap: 10,
    shadowColor: COLORS.black,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  submitButtonDisabled: {
    opacity: 0.4,
    shadowOpacity: 0,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.white,
    letterSpacing: 0.5,
  },
});
