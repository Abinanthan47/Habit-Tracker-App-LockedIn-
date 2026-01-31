import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
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

// Neo-Brutalism Vibrant Colors
const COLORS = {
  bg: "#FFB1D8",
  pastelGreen: "#C1FF72",
  pastelPurple: "#C5B4E3",
  pastelPink: "#FFB1D8",
  pastelBlue: "#A0D7FF",
  pastelYellow: "#FDFD96",
  white: "#FFFFFF",
  black: "#000000",
  darkCard: "#1a1a2e",
  muted: "rgba(0,0,0,0.5)",
};

export default function GoalsScreen() {
  const { goals, updateGoalProgress, refreshData, currentStreak } = useApp();

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("active");
  const currentYear = new Date().getFullYear();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  // Filter goals based on tab
  const filteredGoals = useMemo(() => {
    const yearGoals = goals.filter((g) => g.year === currentYear);

    switch (activeTab) {
      case "done":
        return yearGoals.filter((g) => g.currentValue >= g.targetValue);
      case "stats":
        return yearGoals;
      default:
        return yearGoals.filter(
          (g) => !g.isArchived && g.currentValue < g.targetValue
        );
    }
  }, [goals, activeTab, currentYear]);

  // Calculate total progress
  const totalProgress = useMemo(() => {
    const activeGoals = goals.filter(
      (g) => !g.isArchived && g.year === currentYear
    );
    if (activeGoals.length === 0) return 0;
    return Math.round(
      activeGoals.reduce(
        (sum, g) => sum + Math.min((g.currentValue / g.targetValue) * 100, 100),
        0
      ) / activeGoals.length
    );
  }, [goals, currentYear]);

  const handleUpdateProgress = useCallback(
    async (goalId: string, currentValue: number, targetValue: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const newValue = Math.min(currentValue + 1, targetValue);
      await updateGoalProgress(goalId, newValue);
    },
    [updateGoalProgress]
  );

  // Tab bar dimensions
  const TAB_BAR_HEIGHT = 64;
  const BOTTOM_MARGIN = Platform.OS === "ios" ? 24 : 12;
  const bottomPadding = TAB_BAR_HEIGHT + BOTTOM_MARGIN + 80;

  const getGoalIcon = (title: string): string => {
    const lower = title.toLowerCase();
    if (lower.includes("read") || lower.includes("book")) return "book";
    if (lower.includes("run") || lower.includes("running")) return "walk";
    if (
      lower.includes("workout") ||
      lower.includes("gym") ||
      lower.includes("fitness")
    )
      return "barbell";
    if (lower.includes("save") || lower.includes("money")) return "cash";
    if (lower.includes("meditat")) return "leaf";
    if (lower.includes("code") || lower.includes("project"))
      return "code-slash";
    return "trophy";
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>YEAR</Text>
          <Text style={styles.headerTitleBold}> GOALS</Text>
        </View>
        <View style={styles.streakBadge}>
          <Ionicons name="flame" size={12} color={COLORS.black} />
          <Text style={styles.streakText}>{currentStreak} DAY</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
        >
          {[
            { key: "active", label: "ACTIVE" },
            { key: "done", label: "DONE" },
            { key: "stats", label: "STATS" },
          ].map((tab) => (
            <Pressable
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => {
                setActiveTab(tab.key);
                Haptics.selectionAsync();
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.key && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
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
        {/* Master Progress Card */}
        <Animated.View
          entering={FadeInDown.delay(100)}
          style={styles.masterCard}
        >
          <View style={styles.masterBadge}>
            <Text style={styles.masterBadgeText}>{currentYear} OVERALL</Text>
          </View>
          <Text style={styles.masterTitle}>MASTER</Text>
          <Text style={styles.masterTitle}>PROGRESS</Text>
          <View style={styles.masterProgressRow}>
            <View style={styles.masterProgressBarBg}>
              <View
                style={[
                  styles.masterProgressBarFill,
                  { width: `${totalProgress}%` },
                ]}
              />
            </View>
            <Text style={styles.masterPercent}>{totalProgress}%</Text>
          </View>
          <View style={styles.masterEmoji}>
            <Text style={styles.emojiText}>
              {totalProgress >= 80 ? "🔥" : totalProgress >= 50 ? "💪" : "🎯"}
            </Text>
          </View>
        </Animated.View>

        {/* Goals List */}
        {filteredGoals.length === 0 ? (
          <Animated.View
            entering={FadeInDown.delay(200)}
            style={styles.emptyState}
          >
            <View style={styles.emptyIcon}>
              <Ionicons name="trophy" size={44} color={COLORS.black} />
            </View>
            <Text style={styles.emptyTitle}>
              {activeTab === "done"
                ? "No completed goals yet!"
                : "No goals yet!"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === "done"
                ? "Complete your active goals to see them here"
                : `Set ambitious goals for ${currentYear}`}
            </Text>
            {activeTab === "active" && (
              <Pressable
                style={styles.addFirstButton}
                onPress={() => router.push("/add-goal")}
              >
                <Ionicons name="add" size={18} color={COLORS.black} />
                <Text style={styles.addFirstText}>ADD GOAL</Text>
              </Pressable>
            )}
          </Animated.View>
        ) : (
          filteredGoals.map((goal, index) => {
            const progress = Math.min(
              Math.round((goal.currentValue / goal.targetValue) * 100),
              100
            );
            const isCompleted = goal.currentValue >= goal.targetValue;

            return (
              <Animated.View
                key={goal.id}
                entering={FadeInDown.delay(200 + index * 100)}
                style={styles.goalCard}
              >
                {/* Status Badge */}
                <View
                  style={[
                    styles.statusBadge,
                    isCompleted && styles.statusBadgeCompleted,
                  ]}
                >
                  <Text style={styles.statusText}>
                    {isCompleted
                      ? "✅ COMPLETED"
                      : progress >= 75
                      ? "🔥 ALMOST"
                      : progress >= 50
                      ? "ON TRACK"
                      : "IN PROGRESS"}
                  </Text>
                </View>

                {/* Goal Title */}
                <View style={styles.goalTitleRow}>
                  <Text style={styles.goalTitle}>
                    {goal.title.toUpperCase()}
                  </Text>
                  <View style={styles.goalIconBox}>
                    <Ionicons
                      name={getGoalIcon(goal.title) as any}
                      size={22}
                      color={COLORS.white}
                    />
                  </View>
                </View>

                {/* Progress Section */}
                <View style={styles.progressSection}>
                  <Text style={styles.progressLabel}>PROGRESS</Text>
                  <Text style={styles.progressValue}>
                    {goal.currentValue}/{goal.targetValue} {goal.unit || ""}
                  </Text>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressBarBg}>
                  <View
                    style={[styles.progressBarFill, { width: `${progress}%` }]}
                  />
                </View>

                {/* Update/Complete Button */}
                {!isCompleted ? (
                  <Pressable
                    style={styles.updateButton}
                    onPress={() =>
                      handleUpdateProgress(
                        goal.id,
                        goal.currentValue,
                        goal.targetValue
                      )
                    }
                  >
                    <Text style={styles.updateButtonText}>
                      LOG +1 {goal.unit?.toUpperCase() || ""}
                    </Text>
                  </Pressable>
                ) : (
                  <View style={styles.completedBanner}>
                    <Ionicons name="trophy" size={18} color={COLORS.black} />
                    <Text style={styles.completedText}>GOAL ACHIEVED! 🎉</Text>
                  </View>
                )}
              </Animated.View>
            );
          })
        )}

        {/* Add Goal Card */}
        {filteredGoals.length > 0 && activeTab === "active" && (
          <Animated.View entering={FadeInDown.delay(400)}>
            <Pressable
              style={styles.addGoalCard}
              onPress={() => router.push("/add-goal")}
            >
              <View style={styles.addIconContainer}>
                <Ionicons name="add" size={28} color={COLORS.black} />
              </View>
              <Text style={styles.addGoalText}>ADD NEW GOAL</Text>
            </Pressable>
          </Animated.View>
        )}
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
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: COLORS.black,
  },
  headerTitleBold: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.black,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.pastelGreen,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: COLORS.black,
    gap: 4,
  },
  streakText: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.black,
  },
  tabsContainer: {
    paddingVertical: 6,
  },
  tabs: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: COLORS.black,
  },
  tabActive: {
    backgroundColor: COLORS.black,
  },
  tabText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.black,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  masterCard: {
    backgroundColor: COLORS.pastelYellow,
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: COLORS.black,
    shadowColor: COLORS.black,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    position: "relative",
  },
  masterBadge: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.black,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  masterBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.black,
  },
  masterTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.black,
    lineHeight: 30,
  },
  masterProgressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
  },
  masterProgressBarBg: {
    flex: 1,
    height: 12,
    backgroundColor: COLORS.white,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.black,
    overflow: "hidden",
  },
  masterProgressBarFill: {
    height: "100%",
    backgroundColor: COLORS.pastelGreen,
  },
  masterPercent: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.black,
  },
  masterEmoji: {
    position: "absolute",
    right: 14,
    bottom: 14,
  },
  emojiText: {
    fontSize: 36,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 36,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 3,
    borderColor: COLORS.black,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    shadowColor: COLORS.black,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.black,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.muted,
    textAlign: "center",
    marginBottom: 18,
  },
  addFirstButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.pastelGreen,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: COLORS.black,
    gap: 6,
  },
  addFirstText: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.black,
  },
  goalCard: {
    backgroundColor: COLORS.darkCard,
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
  statusBadge: {
    backgroundColor: COLORS.pastelGreen,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.black,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  statusBadgeCompleted: {
    backgroundColor: COLORS.pastelYellow,
  },
  statusText: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.black,
  },
  goalTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  goalTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.white,
    flex: 1,
    marginRight: 10,
  },
  goalIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  progressSection: {
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  progressValue: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.white,
  },
  progressBarBg: {
    height: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 5,
    marginBottom: 12,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.pastelGreen,
    borderRadius: 5,
  },
  updateButton: {
    backgroundColor: COLORS.white,
    borderRadius: 50,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.black,
  },
  updateButtonText: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.black,
  },
  completedBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.pastelYellow,
    borderRadius: 50,
    paddingVertical: 12,
    gap: 6,
    borderWidth: 2,
    borderColor: COLORS.black,
  },
  completedText: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.black,
  },
  addGoalCard: {
    backgroundColor: COLORS.pastelGreen,
    borderRadius: 18,
    padding: 18,
    borderWidth: 3,
    borderColor: COLORS.black,
    shadowColor: COLORS.black,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  addIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.black,
    justifyContent: "center",
    alignItems: "center",
  },
  addGoalText: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.black,
  },
});
