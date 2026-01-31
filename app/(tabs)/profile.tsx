import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
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
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";

// Neo-Brutalism Vibrant Colors
const COLORS = {
  bg: "#FFF0F5",
  pastelGreen: "#C1FF72",
  pastelPurple: "#C5B4E3",
  pastelPink: "#FFB1D8",
  pastelBlue: "#A0D7FF",
  pastelYellow: "#FDFD96",
  white: "#FFFFFF",
  black: "#000000",
  muted: "rgba(0,0,0,0.5)",
};

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
  } = useApp();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

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
      ]
    );
  }, [cheatDayConfig, useCheatDay]);

  // Calculate real stats from data
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
      (g) => g.year === currentYear && !g.isArchived
    );
    if (yearGoals.length === 0) return 0;
    return Math.round(
      yearGoals.reduce(
        (sum, g) => sum + Math.min((g.currentValue / g.targetValue) * 100, 100),
        0
      ) / yearGoals.length
    );
  }, [goals]);

  const totalCompletions = completions.length;

  // Calculate XP progress
  const xpProgress = profile
    ? Math.round((profile.points / profile.pointsToNextLevel) * 100)
    : 0;
  const xpToNext = profile ? profile.pointsToNextLevel - profile.points : 100;

  // Get unlocked badges
  const unlockedBadges = useMemo(
    () => badges.filter((b) => b.unlockedAt),
    [badges]
  );

  // Tab bar dimensions
  const TAB_BAR_HEIGHT = 64;
  const BOTTOM_MARGIN = Platform.OS === "ios" ? 24 : 12;
  const bottomPadding = TAB_BAR_HEIGHT + BOTTOM_MARGIN + 80;

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.settingsBtn}>
          <Ionicons name="settings-outline" size={20} color={COLORS.black} />
        </Pressable>
        <Text style={styles.headerTitle}>My Stats</Text>
        <Pressable style={styles.shareBtn}>
          <Ionicons name="share-outline" size={20} color={COLORS.black} />
        </Pressable>
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
        {/* Profile Card */}
        <Animated.View
          entering={FadeInDown.delay(100)}
          style={styles.profileCard}
        >
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color={COLORS.black} />
            </View>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>LVL {profile?.level || 1}</Text>
            </View>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.userName}>
              {profile?.displayName || "Achiever"}
            </Text>
            <Text style={styles.motto}>"Consistency is the King!" 🎯</Text>
          </View>

          {/* XP Progress */}
          <View style={styles.xpSection}>
            <View style={styles.xpHeader}>
              <Text style={styles.xpLabel}>LEVEL PROGRESS</Text>
              <Text style={styles.xpValue}>
                {profile?.points || 0}/{profile?.pointsToNextLevel || 100} XP
              </Text>
            </View>
            <View style={styles.xpBarBg}>
              <View style={[styles.xpBarFill, { width: `${xpProgress}%` }]} />
            </View>
            <Text style={styles.xpHint}>🔥 {xpToNext} XP to level up!</Text>
          </View>
        </Animated.View>

        {/* Stats Grid */}
        <Animated.View
          entering={FadeInDown.delay(200)}
          style={styles.statsGrid}
        >
          {/* Current Streak */}
          <View
            style={[styles.statCard, { backgroundColor: COLORS.pastelGreen }]}
          >
            <View style={styles.statIcon}>
              <Ionicons name="flash" size={18} color={COLORS.black} />
            </View>
            <Text style={styles.statValue}>{currentStreak}</Text>
            <Text style={styles.statLabel}>CURRENT STREAK</Text>
          </View>

          {/* Success Rate */}
          <View
            style={[styles.statCard, { backgroundColor: COLORS.pastelYellow }]}
          >
            <View style={styles.statIcon}>
              <Ionicons name="trending-up" size={18} color={COLORS.black} />
            </View>
            <Text style={styles.statValue}>{successRate}%</Text>
            <Text style={styles.statLabel}>SUCCESS RATE</Text>
          </View>

          {/* Cheat Days */}
          <View
            style={[styles.statCard, { backgroundColor: COLORS.pastelPink }]}
          >
            <View style={styles.statIcon}>
              <Ionicons name="pizza" size={18} color={COLORS.black} />
            </View>
            <Text style={styles.statValue}>
              {String(cheatDaysLeft).padStart(2, "0")}
            </Text>
            <Text style={styles.statLabel}>CHEAT DAYS</Text>
          </View>

          {/* Yearly Goals */}
          <View
            style={[styles.statCard, { backgroundColor: COLORS.pastelBlue }]}
          >
            <View style={styles.statIcon}>
              <Ionicons name="flag" size={18} color={COLORS.black} />
            </View>
            <Text style={styles.statValue}>{yearlyGoalProgress}%</Text>
            <Text style={styles.statLabel}>YEARLY GOALS</Text>
          </View>
        </Animated.View>

        {/* Additional Stats */}
        <Animated.View
          entering={FadeInDown.delay(300)}
          style={styles.additionalStats}
        >
          <View style={styles.additionalStatRow}>
            <View style={styles.additionalStatItem}>
              <Ionicons
                name="checkmark-circle"
                size={22}
                color={COLORS.pastelGreen}
              />
              <Text style={styles.additionalStatValue}>{totalCompletions}</Text>
              <Text style={styles.additionalStatLabel}>COMPLETED</Text>
            </View>
            <View style={styles.additionalStatItem}>
              <Ionicons name="trophy" size={22} color={COLORS.pastelYellow} />
              <Text style={styles.additionalStatValue}>{longestStreak}</Text>
              <Text style={styles.additionalStatLabel}>BEST STREAK</Text>
            </View>
            <View style={styles.additionalStatItem}>
              <Ionicons name="list" size={22} color={COLORS.pastelPink} />
              <Text style={styles.additionalStatValue}>{tasks.length}</Text>
              <Text style={styles.additionalStatLabel}>HABITS</Text>
            </View>
          </View>
        </Animated.View>

        {/* Achievements Section */}
        <Animated.View entering={FadeInDown.delay(400)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>ACHIEVEMENTS</Text>
            <Text style={styles.badgeCount}>
              {unlockedBadges.length}/{badges.length}
            </Text>
          </View>

          {badges.length === 0 ? (
            <View style={styles.noBadges}>
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
              {badges.map((badge, index) => {
                const isUnlocked = !!badge.unlockedAt;
                const badgeColors = [
                  COLORS.pastelYellow,
                  COLORS.pastelGreen,
                  COLORS.pastelPink,
                  COLORS.pastelBlue,
                ];

                return (
                  <View
                    key={badge.id}
                    style={[
                      styles.badgeCard,
                      !isUnlocked && styles.badgeCardLocked,
                    ]}
                  >
                    <View
                      style={[
                        styles.badgeIcon,
                        {
                          backgroundColor:
                            badgeColors[index % badgeColors.length],
                        },
                      ]}
                    >
                      <Text style={styles.badgeEmoji}>{badge.icon}</Text>
                    </View>
                    <Text style={styles.badgeName}>{badge.name}</Text>
                    <Text style={styles.badgeTier}>
                      {isUnlocked ? badge.rarity.toUpperCase() : "LOCKED"}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </Animated.View>

        {/* Use Cheat Day Button */}
        <Animated.View entering={FadeInDown.delay(500)}>
          <Pressable
            style={[
              styles.cheatDayButton,
              cheatDaysLeft === 0 && styles.cheatDayButtonDisabled,
            ]}
            onPress={handleUseCheatDay}
            disabled={cheatDaysLeft === 0}
          >
            <Ionicons name="pizza" size={22} color={COLORS.white} />
            <Text style={styles.cheatDayText}>
              {cheatDaysLeft > 0 ? "USE CHEAT DAY" : "NO CHEAT DAYS LEFT"}
            </Text>
          </Pressable>
        </Animated.View>
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
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.black,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.black,
  },
  shareBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.pastelBlue,
    borderWidth: 2,
    borderColor: COLORS.black,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  profileCard: {
    backgroundColor: COLORS.pastelGreen,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: COLORS.black,
    shadowColor: COLORS.black,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    borderWidth: 3,
    borderColor: COLORS.black,
    justifyContent: "center",
    alignItems: "center",
  },
  levelBadge: {
    position: "absolute",
    bottom: -6,
    right: -10,
    backgroundColor: COLORS.pastelYellow,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: COLORS.black,
  },
  levelText: {
    fontSize: 10,
    fontWeight: "900",
    color: COLORS.black,
  },
  profileInfo: {
    alignItems: "center",
    marginBottom: 14,
  },
  userName: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.black,
    marginBottom: 4,
  },
  motto: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(0,0,0,0.6)",
    fontStyle: "italic",
  },
  xpSection: {
    width: "100%",
  },
  xpHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  xpLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.muted,
  },
  xpValue: {
    fontSize: 9,
    fontWeight: "900",
    color: COLORS.black,
  },
  xpBarBg: {
    height: 16,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.black,
    overflow: "hidden",
  },
  xpBarFill: {
    height: "100%",
    backgroundColor: COLORS.pastelYellow,
    borderRadius: 6,
  },
  xpHint: {
    fontSize: 9,
    fontWeight: "700",
    color: COLORS.muted,
    textAlign: "right",
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
    marginBottom: 14,
  },
  statCard: {
    width: "48%",
    marginHorizontal: "1%",
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: COLORS.black,
    shadowColor: COLORS.black,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.black,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 26,
    fontWeight: "900",
    color: COLORS.black,
  },
  statLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: "rgba(0,0,0,0.5)",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  additionalStats: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.black,
  },
  additionalStatRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  additionalStatItem: {
    alignItems: "center",
  },
  additionalStatValue: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.black,
    marginTop: 4,
  },
  additionalStatLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: COLORS.muted,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.black,
  },
  badgeCount: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.muted,
  },
  noBadges: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.black,
    borderStyle: "dashed",
  },
  noBadgesText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.muted,
  },
  badgesRow: {
    gap: 10,
    paddingRight: 16,
    marginBottom: 16,
  },
  badgeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.black,
    width: 100,
  },
  badgeCardLocked: {
    opacity: 0.5,
  },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.black,
    marginBottom: 8,
  },
  badgeEmoji: {
    fontSize: 22,
  },
  badgeName: {
    fontSize: 10,
    fontWeight: "900",
    color: COLORS.black,
    marginBottom: 2,
    textAlign: "center",
  },
  badgeTier: {
    fontSize: 8,
    fontWeight: "700",
    color: COLORS.muted,
  },
  cheatDayButton: {
    backgroundColor: COLORS.black,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    borderWidth: 3,
    borderColor: COLORS.black,
    shadowColor: COLORS.black,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  cheatDayButtonDisabled: {
    opacity: 0.5,
  },
  cheatDayText: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.white,
  },
});
