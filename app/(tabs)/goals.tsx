import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  BorderRadius,
  Colors,
  Layout,
  Spacing,
  Typography,
} from "@/constants/design";
import { useApp } from "@/context/AppContext";
import type { Goal } from "@/types";

type TabType = "active" | "completed" | "all";

const TABS: { key: TabType; label: string }[] = [
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "all", label: "All" },
];

export default function GoalsScreen() {
  const {
    goals,
    goalItems,
    currentStreak,
    longestStreak,
    refreshData,
    deleteGoal,
    getGoalItems,
  } = useApp();

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("active");
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  const handleGoalPress = useCallback((goalId: string) => {
    Haptics.selectionAsync();
    router.push({ pathname: "/goal-detail", params: { id: goalId } });
  }, []);

  const handleGoalOptions = useCallback(
    (goalId: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setExpandedGoalId(expandedGoalId === goalId ? null : goalId);
    },
    [expandedGoalId],
  );

  const handleDeleteGoal = useCallback(
    (goal: Goal) => {
      Alert.alert(
        "Delete Goal",
        `Are you sure you want to delete "${goal.title}"? This will also delete all tracked items. This action cannot be undone.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Warning,
              );
              await deleteGoal(goal.id);
              setExpandedGoalId(null);
            },
          },
        ],
      );
    },
    [deleteGoal],
  );

  // Filter goals
  const filteredGoals = useMemo(() => {
    const yearGoals = goals.filter(
      (g) => g.year === currentYear && !g.isArchived,
    );

    switch (activeTab) {
      case "active":
        return yearGoals.filter((g) => g.currentValue < g.targetValue);
      case "completed":
        return yearGoals.filter((g) => g.currentValue >= g.targetValue);
      case "all":
        return yearGoals;
    }
  }, [goals, currentYear, activeTab]);

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    const yearGoals = goals.filter(
      (g) => g.year === currentYear && !g.isArchived,
    );
    if (yearGoals.length === 0) return { completed: 0, total: 0, percent: 0 };

    const completed = yearGoals.filter(
      (g) => g.currentValue >= g.targetValue,
    ).length;
    const percent = Math.round(
      yearGoals.reduce(
        (sum, g) => sum + Math.min((g.currentValue / g.targetValue) * 100, 100),
        0,
      ) / yearGoals.length,
    );

    return { completed, total: yearGoals.length, percent };
  }, [goals, currentYear]);

  const TAB_BAR_HEIGHT = Layout.tabBarHeight;
  const bottomPadding = TAB_BAR_HEIGHT + (Platform.OS === "ios" ? 24 : 16) + 20;

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.surface, Colors.background]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerSubtitle}>{currentYear}</Text>
            <Text style={styles.headerTitle}>Goals</Text>
          </View>
          <Pressable
            style={styles.addButton}
            onPress={() => router.push("/add-goal")}
          >
            <LinearGradient
              colors={[Colors.cyberLime, "#B8E600"]}
              style={styles.addButtonGradient}
            >
              <Ionicons name="add" size={22} color={Colors.background} />
            </LinearGradient>
          </Pressable>
        </View>
      </LinearGradient>

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
            tintColor={Colors.cyberLime}
          />
        }
      >
        {/* Master Progress Card */}
        <Animated.View entering={FadeInDown.delay(50)}>
          <LinearGradient
            colors={["rgba(205, 255, 0, 0.1)", "rgba(205, 255, 0, 0.02)"]}
            style={styles.masterCard}
          >
            <View style={styles.masterHeader}>
              <View style={styles.masterInfo}>
                <Text style={styles.masterTitle}>Year Progress</Text>
                <Text style={styles.masterSubtitle}>
                  {overallProgress.completed}/{overallProgress.total} goals
                  completed
                </Text>
              </View>
              <View style={styles.masterPercentContainer}>
                <Text style={styles.masterPercent}>
                  {overallProgress.percent}
                </Text>
                <Text style={styles.masterPercentSymbol}>%</Text>
              </View>
            </View>

            <View style={styles.masterProgressBg}>
              <LinearGradient
                colors={[Colors.cyberLime, "#B8E600"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.masterProgressFill,
                  { width: `${Math.max(overallProgress.percent, 2)}%` },
                ]}
              />
            </View>

            <View style={styles.masterStats}>
              <View style={styles.masterStatItem}>
                <Ionicons name="flame" size={16} color={Colors.warning} />
                <Text style={styles.masterStatValue}>{currentStreak}</Text>
                <Text style={styles.masterStatLabel}>Streak</Text>
              </View>
              <View style={styles.masterStatDivider} />
              <View style={styles.masterStatItem}>
                <Ionicons name="trophy" size={16} color={Colors.cyberLime} />
                <Text style={styles.masterStatValue}>{longestStreak}</Text>
                <Text style={styles.masterStatLabel}>Best</Text>
              </View>
              <View style={styles.masterStatDivider} />
              <View style={styles.masterStatItem}>
                <Ionicons name="flag" size={16} color={Colors.info} />
                <Text style={styles.masterStatValue}>
                  {overallProgress.total}
                </Text>
                <Text style={styles.masterStatLabel}>Goals</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Tab Navigation */}
        <Animated.View
          entering={FadeInDown.delay(100)}
          style={styles.tabsContainer}
        >
          {TABS.map((tab) => (
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
        </Animated.View>

        {/* Goals List */}
        {filteredGoals.length === 0 ? (
          <Animated.View entering={FadeInDown.delay(150)}>
            <LinearGradient
              colors={[`${Colors.cyberLime}15`, "transparent"]}
              style={styles.emptyState}
            >
              <Ionicons
                name="flag-outline"
                size={48}
                color={Colors.cyberLime}
              />
              <Text style={styles.emptyTitle}>
                {activeTab === "completed"
                  ? "No completed goals yet"
                  : "No goals set"}
              </Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === "completed"
                  ? "Keep working on your active goals!"
                  : `Set your ${currentYear} goals and start tracking`}
              </Text>
              {activeTab !== "completed" && (
                <Pressable
                  style={styles.addGoalButton}
                  onPress={() => router.push("/add-goal")}
                >
                  <LinearGradient
                    colors={[Colors.cyberLime, "#B8E600"]}
                    style={styles.addGoalGradient}
                  >
                    <Ionicons name="add" size={18} color={Colors.background} />
                    <Text style={styles.addGoalText}>Create Goal</Text>
                  </LinearGradient>
                </Pressable>
              )}
            </LinearGradient>
          </Animated.View>
        ) : (
          <View style={styles.goalsList}>
            {filteredGoals.map((goal, index) => {
              const progress = Math.min(
                Math.round((goal.currentValue / goal.targetValue) * 100),
                100,
              );
              const isCompleted = progress >= 100;
              const items = getGoalItems(goal.id);
              const hasItems = items.length > 0;
              const isExpanded = expandedGoalId === goal.id;

              return (
                <Animated.View
                  key={goal.id}
                  entering={FadeInDown.delay(150 + index * 50)}
                >
                  <Pressable
                    style={styles.goalCard}
                    onPress={() => handleGoalPress(goal.id)}
                    onLongPress={() => handleGoalOptions(goal.id)}
                  >
                    <View style={styles.goalHeader}>
                      <View
                        style={[
                          styles.goalIconContainer,
                          isCompleted && styles.goalIconCompleted,
                        ]}
                      >
                        <Text style={styles.goalIconEmoji}>
                          {goal.icon || "🎯"}
                        </Text>
                      </View>
                      <View style={styles.goalInfo}>
                        <Text style={styles.goalTitle} numberOfLines={1}>
                          {goal.title}
                        </Text>
                        <View style={styles.goalBadges}>
                          <View
                            style={[
                              styles.statusBadge,
                              isCompleted && styles.statusBadgeCompleted,
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusBadgeText,
                                isCompleted && styles.statusBadgeTextCompleted,
                              ]}
                            >
                              {isCompleted ? "Completed" : "In Progress"}
                            </Text>
                          </View>
                          <View style={styles.itemsBadge}>
                            <Ionicons
                              name={
                                goal.targetType === "numeric"
                                  ? "stats-chart"
                                  : "list"
                              }
                              size={10}
                              color={Colors.textSecondary}
                            />
                            <Text style={styles.itemsBadgeText}>
                              {goal.targetType === "numeric"
                                ? "Value"
                                : "Items"}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <Pressable
                        style={styles.moreButton}
                        onPress={() => handleGoalOptions(goal.id)}
                      >
                        <Ionicons
                          name="ellipsis-vertical"
                          size={18}
                          color={Colors.textMuted}
                        />
                      </Pressable>
                    </View>

                    <View style={styles.goalProgressSection}>
                      <View style={styles.goalProgressInfo}>
                        <Text style={styles.goalProgressText}>
                          {goal.currentValue} / {goal.targetValue} {goal.unit}
                        </Text>
                        <Text style={styles.goalProgressPercent}>
                          {progress}%
                        </Text>
                      </View>
                      <View style={styles.goalProgressBg}>
                        <LinearGradient
                          colors={
                            isCompleted
                              ? [Colors.success, "#22C55E"]
                              : [Colors.cyberLime, "#B8E600"]
                          }
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={[
                            styles.goalProgressFill,
                            { width: `${Math.max(progress, 2)}%` },
                          ]}
                        />
                      </View>
                    </View>
                  </Pressable>

                  {/* Expanded Options */}
                  {isExpanded && (
                    <Animated.View
                      entering={FadeInRight.duration(200)}
                      style={styles.goalActions}
                    >
                      <Pressable
                        style={styles.actionButton}
                        onPress={() => handleGoalPress(goal.id)}
                      >
                        <Ionicons
                          name="eye-outline"
                          size={18}
                          color={Colors.info}
                        />
                        <Text
                          style={[styles.actionText, { color: Colors.info }]}
                        >
                          View
                        </Text>
                      </Pressable>
                      <Pressable
                        style={styles.actionButton}
                        onPress={() => handleDeleteGoal(goal)}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={18}
                          color={Colors.error}
                        />
                        <Text
                          style={[styles.actionText, { color: Colors.error }]}
                        >
                          Delete
                        </Text>
                      </Pressable>
                    </Animated.View>
                  )}
                </Animated.View>
              );
            })}
          </View>
        )}

        {/* Add More Button */}
        {filteredGoals.length > 0 && (
          <Animated.View entering={FadeInDown.delay(400)}>
            <Pressable
              style={styles.addMoreCard}
              onPress={() => router.push("/add-goal")}
            >
              <View style={styles.addMoreIcon}>
                <Ionicons name="add" size={20} color={Colors.background} />
              </View>
              <Text style={styles.addMoreText}>Add New Goal</Text>
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
    backgroundColor: Colors.background,
  },
  headerGradient: {
    paddingBottom: Spacing.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  headerSubtitle: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
  },
  headerTitle: {
    fontSize: Typography.sizes["2xl"],
    fontFamily: Typography.fonts.heading,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  addButton: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  addButtonGradient: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  masterCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.cyberLime,
  },
  masterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.lg,
  },
  masterInfo: {
    flex: 1,
  },
  masterTitle: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fonts.heading,
    color: Colors.textPrimary,
  },
  masterSubtitle: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  masterPercentContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  masterPercent: {
    fontSize: Typography.sizes["4xl"],
    fontFamily: Typography.fonts.number,
    color: Colors.cyberLime,
    lineHeight: Typography.sizes["4xl"] * 1.1,
  },
  masterPercentSymbol: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fonts.number,
    color: Colors.cyberLime,
    marginTop: 4,
  },
  masterProgressBg: {
    height: 10,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
    marginBottom: Spacing.lg,
  },
  masterProgressFill: {
    height: "100%",
    borderRadius: BorderRadius.full,
  },
  masterStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
  },
  masterStatItem: {
    alignItems: "center",
    flex: 1,
    gap: 4,
  },
  masterStatValue: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.fonts.number,
    color: Colors.textPrimary,
  },
  masterStatLabel: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
  },
  masterStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.borderDefault,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xs,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: "center",
    borderRadius: BorderRadius.md,
  },
  tabActive: {
    backgroundColor: Colors.cyberLime,
  },
  tabText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.bodySemibold,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.background,
  },
  emptyState: {
    borderRadius: BorderRadius.xl,
    padding: Spacing["3xl"],
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  emptyTitle: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fonts.heading,
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: Spacing["2xl"],
  },
  addGoalButton: {
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  addGoalGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing["2xl"],
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  addGoalText: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.bodySemibold,
    color: Colors.background,
  },
  goalsList: {
    gap: Spacing.md,
  },
  goalCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  goalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  goalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.cyberLimeLight,
    justifyContent: "center",
    alignItems: "center",
  },
  goalIconEmoji: {
    fontSize: 20,
  },
  goalIconCompleted: {
    backgroundColor: Colors.success,
    borderWidth: 0,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.heading,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  goalBadges: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  statusBadge: {
    backgroundColor: Colors.cyberLimeLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  statusBadgeCompleted: {
    backgroundColor: `${Colors.success}20`,
  },
  statusBadgeText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodySemibold,
    color: Colors.cyberLime,
  },
  statusBadgeTextCompleted: {
    color: Colors.success,
  },
  itemsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  itemsBadgeText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.number,
    color: Colors.textSecondary,
  },
  moreButton: {
    padding: Spacing.xs,
  },
  goalProgressSection: {
    marginTop: Spacing.sm,
  },
  goalProgressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  goalProgressText: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fonts.number,
    color: Colors.textPrimary,
  },
  goalProgressPercent: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.number,
    color: Colors.cyberLime,
  },
  goalProgressBg: {
    height: 8,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  goalProgressFill: {
    height: "100%",
    borderRadius: BorderRadius.full,
  },
  goalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    backgroundColor: Colors.surfaceElevated,
    padding: Spacing.sm,
    marginTop: -1,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    borderTopWidth: 0,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
  },
  actionText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.bodySemibold,
  },
  addMoreCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    borderStyle: "dashed",
    marginTop: Spacing.md,
  },
  addMoreIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.cyberLime,
    justifyContent: "center",
    alignItems: "center",
  },
  addMoreText: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.bodySemibold,
    color: Colors.textSecondary,
  },
});
