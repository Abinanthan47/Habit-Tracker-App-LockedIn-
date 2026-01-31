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
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import type { TaskCategory, TimeOfDay } from "@/types";

// Neo-Brutalism Vibrant Colors
const COLORS = {
  bg: "#FDFD96",
  pastelGreen: "#C1FF72",
  pastelPink: "#FFB1D8",
  pastelBlue: "#A0D7FF",
  pastelPurple: "#C5B4E3",
  white: "#FFFFFF",
  black: "#000000",
  muted: "rgba(0,0,0,0.5)",
};

// Category options with colors
const CATEGORY_OPTIONS: {
  category: TaskCategory;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  label: string;
}[] = [
  {
    category: "health",
    icon: "water",
    color: COLORS.pastelBlue,
    label: "Health",
  },
  {
    category: "fitness",
    icon: "barbell",
    color: COLORS.pastelPink,
    label: "Fitness",
  },
  {
    category: "personal",
    icon: "person",
    color: COLORS.pastelPurple,
    label: "Personal",
  },
  {
    category: "work",
    icon: "briefcase",
    color: COLORS.pastelGreen,
    label: "Work",
  },
  { category: "learning", icon: "book", color: COLORS.bg, label: "Learning" },
  {
    category: "mindfulness",
    icon: "leaf",
    color: COLORS.pastelGreen,
    label: "Mindful",
  },
];

const TIME_OPTIONS: {
  key: TimeOfDay;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}[] = [
  { key: "morning", label: "Morning", icon: "sunny", color: COLORS.bg },
  {
    key: "afternoon",
    label: "Afternoon",
    icon: "partly-sunny",
    color: COLORS.pastelPink,
  },
  { key: "evening", label: "Evening", icon: "moon", color: COLORS.pastelBlue },
  { key: "anytime", label: "Anytime", icon: "time", color: COLORS.white },
];

export default function AddTaskScreen() {
  const { addTask } = useApp();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("morning");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      await addTask({
        name: name.trim(),
        category: CATEGORY_OPTIONS[selectedCategory].category,
        timeOfDay,
        frequency: "daily",
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error) {
      console.error("Error adding task:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Pressable style={styles.closeButton} onPress={() => router.back()}>
            <Ionicons name="close" size={22} color={COLORS.black} />
          </Pressable>
          <Text style={styles.headerTitle}>NEW HABIT</Text>
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
            <Text style={styles.label}>HABIT NAME</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g., Drink 2L Water"
                placeholderTextColor={COLORS.muted}
                autoFocus
                returnKeyType="done"
              />
            </View>
          </Animated.View>

          {/* Category Picker */}
          <Animated.View
            entering={FadeInDown.delay(100)}
            style={styles.section}
          >
            <Text style={styles.label}>CATEGORY</Text>
            <View style={styles.categoryGrid}>
              {CATEGORY_OPTIONS.map((item, index) => (
                <Pressable
                  key={index}
                  style={[
                    styles.categoryCard,
                    {
                      backgroundColor:
                        selectedCategory === index ? item.color : COLORS.white,
                    },
                  ]}
                  onPress={() => {
                    setSelectedCategory(index);
                    Haptics.selectionAsync();
                  }}
                >
                  <View style={styles.categoryIconContainer}>
                    <Ionicons name={item.icon} size={22} color={COLORS.black} />
                  </View>
                  <Text style={styles.categoryLabel}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>

          {/* Time of Day */}
          <Animated.View
            entering={FadeInDown.delay(150)}
            style={styles.section}
          >
            <Text style={styles.label}>BEST TIME</Text>
            <View style={styles.timeGrid}>
              {TIME_OPTIONS.map((option) => (
                <Pressable
                  key={option.key}
                  style={[
                    styles.timeCard,
                    {
                      backgroundColor:
                        timeOfDay === option.key ? option.color : COLORS.white,
                    },
                  ]}
                  onPress={() => {
                    setTimeOfDay(option.key);
                    Haptics.selectionAsync();
                  }}
                >
                  <Ionicons name={option.icon} size={18} color={COLORS.black} />
                  <Text style={styles.timeLabel}>{option.label}</Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        </ScrollView>

        {/* Submit Button */}
        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, 16) },
          ]}
        >
          <Pressable
            style={[
              styles.submitButton,
              (!name.trim() || isSubmitting) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!name.trim() || isSubmitting}
          >
            <Ionicons name="add" size={22} color={COLORS.black} />
            <Text style={styles.submitButtonText}>
              {isSubmitting ? "CREATING..." : "CREATE HABIT"}
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
    backgroundColor: COLORS.bg,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.black,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.black,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.black,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.black,
    letterSpacing: 0.5,
  },
  headerRight: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.muted,
    letterSpacing: 1,
    marginBottom: 10,
  },
  inputContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: COLORS.black,
    shadowColor: COLORS.black,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.black,
    fontWeight: "700",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  categoryCard: {
    width: "31.33%",
    marginHorizontal: "1%",
    aspectRatio: 1,
    borderRadius: 14,
    padding: 8,
    marginBottom: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.black,
    shadowColor: COLORS.black,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  categoryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.5)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  categoryLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.black,
    textTransform: "uppercase",
  },
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  timeCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
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
  timeLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.black,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 3,
    borderTopColor: COLORS.black,
    backgroundColor: COLORS.bg,
  },
  submitButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.pastelGreen,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: COLORS.black,
    gap: 8,
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
    color: COLORS.black,
    letterSpacing: 0.5,
  },
});
