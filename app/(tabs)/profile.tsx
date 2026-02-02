import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { BarChart, PieChart } from "react-native-gifted-charts";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { BadgeCard } from "@/components/BadgeCard";
import {
  BorderRadius,
  Colors,
  Layout,
  Spacing,
  Typography,
  getCategoryColor,
} from "@/constants/design";
import { useApp } from "@/context/AppContext";
import { formatDate } from "@/lib/dates";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CHART_WIDTH = SCREEN_WIDTH - Spacing.lg * 4 - 40;

export default function ProfileScreen() {
  const {
    profile,
    badges,
    completions,
    currentStreak,
    longestStreak,
    refreshData,
    useCheatDay,
    cheatDayConfig,
    tasks,
    goals,
    activities,
    updateProfile,
  } = useApp();

  const [refreshing, setRefreshing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(profile?.displayName || "");

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  const handleSaveProfile = async () => {
    if (editName.trim()) {
      await updateProfile({ displayName: editName.trim() });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setShowEditModal(false);
  };

  const handleUseCheatDay = useCallback(async () => {
    const remaining = cheatDayConfig
      ? cheatDayConfig.maxPerMonth - cheatDayConfig.usedThisMonth
      : 0;

    Alert.alert(
      "Use Cheat Day",
      `This will protect your streak for today. You have ${remaining} left this month.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Use",
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            const success = await useCheatDay();
            if (success) {
              Alert.alert("Success! 🎉", "Cheat day activated for today!");
            } else {
              Alert.alert("Oops! 😅", "No cheat days left this month!");
            }
          },
        },
      ],
    );
  }, [cheatDayConfig, useCheatDay]);

  // Calculate real stats
  const successRate = useMemo(() => {
    if (activities.length === 0) return 0;
    const avgCompletion =
      activities.reduce((sum, a) => sum + a.completionRate, 0) /
      activities.length;
    return Math.round(avgCompletion);
  }, [activities]);

  const cheatDaysLeft = cheatDayConfig
    ? cheatDayConfig.maxPerMonth - cheatDayConfig.usedThisMonth
    : 4;

  const yearlyGoalProgress = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yearGoals = goals.filter(
      (g) => g.year === currentYear && !g.isArchived,
    );
    if (yearGoals.length === 0) return 0;
    return Math.round(
      yearGoals.reduce(
        (sum, g) => sum + Math.min((g.currentValue / g.targetValue) * 100, 100),
        0,
      ) / yearGoals.length,
    );
  }, [goals]);

  const totalCompletions = completions.length;

  // XP progress
  const xpProgress = profile
    ? Math.round((profile.points / profile.pointsToNextLevel) * 100)
    : 0;
  const xpToNext = profile ? profile.pointsToNextLevel - profile.points : 100;

  // Weekly activity data for bar chart
  const weeklyData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);

    const data = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateStr = formatDate(date);
      const activity = activities.find((a) => a.date === dateStr);
      const value = activity ? activity.completionRate : 0;
      const isToday = dateStr === formatDate(today);

      data.push({
        value: value,
        label: days[i],
        frontColor: isToday
          ? Colors.cyberLime
          : value >= 80
            ? "#B8E600"
            : value >= 50
              ? Colors.warning
              : Colors.surfaceElevated,
        labelTextStyle: {
          color: isToday ? Colors.cyberLime : Colors.textSecondary,
          fontSize: 10,
          fontFamily: Typography.fonts.body,
        },
      });
    }
    return data;
  }, [activities]);

  // Category distribution for pie chart
  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    tasks.forEach((task) => {
      categories[task.category] = (categories[task.category] || 0) + 1;
    });

    return Object.entries(categories).map(([name, value]) => ({
      value,
      color: getCategoryColor(name as any),
      text: name,
      label: name.charAt(0).toUpperCase() + name.slice(1),
    }));
  }, [tasks]);

  // Unlocked badges
  const unlockedBadges = useMemo(
    () => badges.filter((b) => b.unlockedAt),
    [badges],
  );

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
          <Text style={styles.headerTitle}>Profile</Text>
          <Pressable
            style={styles.settingsButton}
            onPress={() => setShowEditModal(true)}
          >
            <Ionicons
              name="create-outline"
              size={20}
              color={Colors.textSecondary}
            />
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
        {/* Profile Card with Gradient */}
        <Animated.View entering={FadeInDown.delay(50)}>
          <LinearGradient
            colors={["rgba(205, 255, 0, 0.1)", "rgba(205, 255, 0, 0.02)"]}
            style={styles.profileCard}
          >
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={[Colors.cyberLime, "#B8E600"]}
                  style={styles.avatar}
                >
                  <Text style={styles.avatarText}>
                    {(profile?.displayName || "A").charAt(0).toUpperCase()}
                  </Text>
                </LinearGradient>
                <LinearGradient
                  colors={[Colors.warning, "#FF8C00"]}
                  style={styles.levelBadge}
                >
                  <Text style={styles.levelText}>{profile?.level || 1}</Text>
                </LinearGradient>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.userName}>
                  {profile?.displayName || "Achiever"}
                </Text>
                <Text style={styles.userMotto}>
                  Level {profile?.level || 1} • {totalCompletions} completions
                </Text>
              </View>
            </View>

            {/* XP Progress */}
            <View style={styles.xpSection}>
              <View style={styles.xpHeader}>
                <View style={styles.xpLabelRow}>
                  <Ionicons name="star" size={14} color={Colors.warning} />
                  <Text style={styles.xpLabel}>Experience</Text>
                </View>
                <Text style={styles.xpValue}>
                  {profile?.points || 0} / {profile?.pointsToNextLevel || 100}{" "}
                  XP
                </Text>
              </View>
              <View style={styles.xpBarBg}>
                <LinearGradient
                  colors={[Colors.warning, "#FF8C00"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.xpBarFill,
                    { width: `${Math.max(xpProgress, 5)}%` },
                  ]}
                />
              </View>
              <Text style={styles.xpHint}>
                {xpToNext} XP to level {(profile?.level || 1) + 1}
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Quick Stats Grid */}
        <Animated.View
          entering={FadeInDown.delay(100)}
          style={styles.statsGrid}
        >
          <LinearGradient
            colors={[`${Colors.warning}20`, `${Colors.warning}05`]}
            style={[styles.statCard, styles.statCardLarge]}
          >
            <View
              style={[
                styles.statIconContainer,
                { backgroundColor: `${Colors.warning}30` },
              ]}
            >
              <Ionicons name="flame" size={24} color={Colors.warning} />
            </View>
            <Text style={styles.statValue}>{currentStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </LinearGradient>
          <LinearGradient
            colors={[`${Colors.cyberLime}20`, `${Colors.cyberLime}05`]}
            style={[styles.statCard, styles.statCardLarge]}
          >
            <View
              style={[
                styles.statIconContainer,
                { backgroundColor: `${Colors.cyberLime}30` },
              ]}
            >
              <Ionicons name="trophy" size={24} color={Colors.cyberLime} />
            </View>
            <Text style={styles.statValue}>{longestStreak}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </LinearGradient>

          <View style={styles.statCard}>
            <View
              style={[
                styles.statIconContainer,
                { backgroundColor: `${Colors.info}20` },
              ]}
            >
              <Ionicons name="trending-up" size={18} color={Colors.info} />
            </View>
            <Text style={styles.statValueSmall}>{successRate}%</Text>
            <Text style={styles.statLabel}>Avg Rate</Text>
          </View>
          <View style={styles.statCard}>
            <View
              style={[
                styles.statIconContainer,
                { backgroundColor: `${Colors.cyberLime}20` },
              ]}
            >
              <Ionicons name="flag" size={18} color={Colors.cyberLime} />
            </View>
            <Text style={styles.statValueSmall}>{yearlyGoalProgress}%</Text>
            <Text style={styles.statLabel}>Goals</Text>
          </View>
          <View style={styles.statCard}>
            <View
              style={[
                styles.statIconContainer,
                { backgroundColor: `#EC489920` },
              ]}
            >
              <Ionicons name="pizza" size={18} color="#EC4899" />
            </View>
            <Text style={styles.statValueSmall}>{cheatDaysLeft}</Text>
            <Text style={styles.statLabel}>Cheat Days</Text>
          </View>
        </Animated.View>

        {/* Weekly Activity Chart */}
        <Animated.View
          entering={FadeInDown.delay(150)}
          style={styles.chartCard}
        >
          <Text style={styles.chartTitle}>Weekly Activity</Text>
          <Text style={styles.chartSubtitle}>
            Your completion rate this week
          </Text>
          <View style={styles.chartContainer}>
            <BarChart
              data={weeklyData}
              width={CHART_WIDTH}
              height={140}
              barWidth={24}
              spacing={16}
              roundedTop
              roundedBottom
              hideRules
              xAxisThickness={0}
              yAxisThickness={0}
              yAxisTextStyle={{
                color: Colors.textMuted,
                fontSize: 10,
                fontFamily: Typography.fonts.number,
              }}
              noOfSections={4}
              maxValue={100}
              isAnimated
              animationDuration={500}
              barBorderRadius={4}
              yAxisLabelSuffix="%"
              showValuesAsTopLabel
              topLabelTextStyle={{
                color: Colors.textSecondary,
                fontSize: 9,
                fontFamily: Typography.fonts.number,
              }}
            />
          </View>
        </Animated.View>

        {/* Habits Distribution - Fixed Legend */}
        {tasks.length > 0 && (
          <Animated.View
            entering={FadeInDown.delay(200)}
            style={styles.chartCard}
          >
            <Text style={styles.chartTitle}>Habits by Category</Text>
            <Text style={styles.chartSubtitle}>
              Distribution of your {tasks.length} habits
            </Text>
            <View style={styles.pieChartContainer}>
              <PieChart
                data={categoryData}
                donut
                radius={65}
                innerRadius={40}
                innerCircleColor={Colors.surface}
                centerLabelComponent={() => (
                  <View style={styles.pieCenter}>
                    <Text style={styles.pieCenterValue}>{tasks.length}</Text>
                    <Text style={styles.pieCenterLabel}>Total</Text>
                  </View>
                )}
              />
              <View style={styles.pieLegend}>
                {categoryData.map((item, index) => (
                  <View key={index} style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendDot,
                        { backgroundColor: item.color },
                      ]}
                    />
                    <Text style={styles.legendText}>{item.label}</Text>
                    <View style={styles.legendValueBadge}>
                      <Text style={styles.legendValue}>{item.value}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>
        )}

        {/* Achievements Section */}
        <Animated.View entering={FadeInDown.delay(250)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <View style={styles.badgeCountBadge}>
              <Text style={styles.badgeCountText}>
                {unlockedBadges.length}/{badges.length}
              </Text>
            </View>
          </View>

          {badges.length === 0 ? (
            <View style={styles.noBadges}>
              <Ionicons
                name="ribbon-outline"
                size={32}
                color={Colors.textMuted}
              />
              <Text style={styles.noBadgesText}>
                Complete tasks to unlock badges!
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.badgesRow}
            >
              {badges.map((badge) => (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  size="small"
                  showDetails={false}
                />
              ))}
            </ScrollView>
          )}
        </Animated.View>

        {/* Cheat Day Button */}
        <Animated.View
          entering={FadeInDown.delay(300)}
          style={styles.cheatDaySection}
        >
          <Pressable
            style={[
              styles.cheatDayButton,
              cheatDaysLeft === 0 && styles.cheatDayButtonDisabled,
            ]}
            onPress={handleUseCheatDay}
            disabled={cheatDaysLeft === 0}
          >
            <LinearGradient
              colors={
                cheatDaysLeft > 0
                  ? [Colors.cyberLime, "#B8E600"]
                  : [Colors.surfaceElevated, Colors.surfaceElevated]
              }
              style={styles.cheatDayGradient}
            >
              <Ionicons
                name="pizza"
                size={20}
                color={cheatDaysLeft > 0 ? Colors.background : Colors.textMuted}
              />
              <Text
                style={[
                  styles.cheatDayText,
                  cheatDaysLeft === 0 && styles.cheatDayTextDisabled,
                ]}
              >
                {cheatDaysLeft > 0
                  ? `Use Cheat Day (${cheatDaysLeft} left)`
                  : "No Cheat Days Left"}
              </Text>
            </LinearGradient>
          </Pressable>
          <Text style={styles.cheatDayHint}>
            Cheat days protect your streak when you need a break
          </Text>
        </Animated.View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowEditModal(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowEditModal(false)}
        />
        <View style={styles.modalContent}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Edit Profile</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Display Name</Text>
            <TextInput
              style={styles.input}
              value={editName}
              onChangeText={setEditName}
              placeholder="Your name"
              placeholderTextColor={Colors.textMuted}
              autoFocus
            />
          </View>

          <View style={styles.modalActions}>
            <Pressable
              style={styles.cancelButton}
              onPress={() => setShowEditModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.saveButton} onPress={handleSaveProfile}>
              <LinearGradient
                colors={[Colors.cyberLime, "#B8E600"]}
                style={styles.saveButtonGradient}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  headerTitle: {
    fontSize: Typography.sizes["2xl"],
    fontFamily: Typography.fonts.heading,
    color: Colors.textPrimary,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  profileCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.cyberLime,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: Typography.sizes["2xl"],
    fontFamily: Typography.fonts.heading,
    color: Colors.background,
  },
  levelBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 26,
    height: 26,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: Colors.background,
  },
  levelText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.number,
    color: Colors.background,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.fonts.heading,
    color: Colors.textPrimary,
  },
  userMotto: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  xpSection: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  xpHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  xpLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  xpLabel: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.bodySemibold,
    color: Colors.textPrimary,
  },
  xpValue: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.number,
    color: Colors.textSecondary,
  },
  xpBarBg: {
    height: 8,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  xpBarFill: {
    height: "100%",
    borderRadius: BorderRadius.full,
  },
  xpHint: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: Colors.textMuted,
    textAlign: "right",
    marginTop: Spacing.xs,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -Spacing.xs,
    marginBottom: Spacing.lg,
  },
  statCard: {
    width: "31.33%",
    marginHorizontal: "1%",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    alignItems: "center",
  },
  statCardLarge: {
    width: "48%",
    paddingVertical: Spacing.xl,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: Typography.sizes["3xl"],
    fontFamily: Typography.fonts.number,
    color: Colors.textPrimary,
  },
  statValueSmall: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fonts.number,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: "center",
  },
  chartCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  chartTitle: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fonts.heading,
    color: Colors.textPrimary,
  },
  chartSubtitle: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: Spacing.lg,
  },
  chartContainer: {
    alignItems: "center",
    paddingLeft: Spacing.sm,
  },
  pieChartContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pieCenter: {
    alignItems: "center",
  },
  pieCenterValue: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.fonts.number,
    color: Colors.textPrimary,
  },
  pieCenterLabel: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
  },
  pieLegend: {
    flex: 1,
    marginLeft: Spacing.xl,
    gap: Spacing.sm,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: BorderRadius.full,
  },
  legendText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.bodyMedium,
    color: Colors.textPrimary,
    flex: 1,
  },
  legendValueBadge: {
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    minWidth: 24,
    alignItems: "center",
  },
  legendValue: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.number,
    color: Colors.textSecondary,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fonts.heading,
    color: Colors.textPrimary,
  },
  badgeCountBadge: {
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  badgeCountText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.number,
    color: Colors.textSecondary,
  },
  noBadges: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing["2xl"],
    alignItems: "center",
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    borderStyle: "dashed",
    gap: Spacing.sm,
  },
  noBadgesText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.body,
    color: Colors.textMuted,
  },
  badgesRow: {
    gap: Spacing.md,
    paddingRight: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  badgeCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    width: 100,
  },
  badgeCardLocked: {
    opacity: 0.5,
  },
  badgeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.cyberLimeLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  badgeIconLocked: {
    backgroundColor: Colors.surfaceElevated,
  },
  badgeEmoji: {
    fontSize: 24,
  },
  badgeName: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodySemibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    textAlign: "center",
  },
  badgeTier: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: Colors.textMuted,
  },
  cheatDaySection: {
    marginBottom: Spacing.xl,
  },
  cheatDayButton: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  cheatDayButtonDisabled: {
    opacity: 0.6,
  },
  cheatDayGradient: {
    padding: Spacing.lg,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.sm,
  },
  cheatDayText: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.bodySemibold,
    color: Colors.background,
  },
  cheatDayTextDisabled: {
    color: Colors.textMuted,
  },
  cheatDayHint: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: Colors.textMuted,
    textAlign: "center",
    marginTop: Spacing.sm,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius["2xl"],
    borderTopRightRadius: BorderRadius["2xl"],
    padding: Spacing.lg,
    paddingBottom: Spacing["3xl"],
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.borderDefault,
    borderRadius: BorderRadius.full,
    alignSelf: "center",
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.fonts.heading,
    color: Colors.textPrimary,
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.bodySemibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    padding: Spacing.md,
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.body,
    color: Colors.textPrimary,
  },
  modalActions: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  cancelButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surfaceElevated,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.bodySemibold,
    color: Colors.textSecondary,
  },
  saveButton: {
    flex: 2,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  saveButtonGradient: {
    padding: Spacing.md,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.bodySemibold,
    color: Colors.background,
  },
});
