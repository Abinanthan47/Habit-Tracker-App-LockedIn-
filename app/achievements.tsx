import { BorderRadius, Colors, Spacing, Typography } from "@/constants/design";
import { useApp } from "@/context/AppContext";
import type { Badge, BadgeRarity } from "@/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BADGE_CARD_WIDTH = SCREEN_WIDTH - Spacing.lg * 2;

// Badge images mapping
const BADGE_IMAGES: Record<string, any> = {
  streak_7: require("@/assets/images/badge-week.png"),
  streak_21: require("@/assets/images/basdge21.png"),
  streak_30: require("@/assets/images/badge30.png"),
  streak_100: require("@/assets/images/badge1.png"),
  streak_365: require("@/assets/images/badge1.png"),
  perfect_week: require("@/assets/images/badge-week.png"),
  perfect_month: require("@/assets/images/badge30.png"),
  tasks_10: require("@/assets/images/badgezero.png"),
  tasks_100: require("@/assets/images/badge1.png"),
  tasks_500: require("@/assets/images/badge30.png"),
  tasks_1000: require("@/assets/images/badge1.png"),
  early_bird: require("@/assets/images/badge-morning.png"),
  night_owl: require("@/assets/images/badge30.png"),
  first_habit: require("@/assets/images/badgezero.png"),
  first_goal: require("@/assets/images/badgezero.png"),
  comeback: require("@/assets/images/badge1.png"),
  no_cheat: require("@/assets/images/badge30.png"),
};

// Rarity labels and colors - All green-based gradients
const RARITY_CONFIG: Record<
  BadgeRarity,
  { label: string; color: string; gradient: readonly [string, string] }
> = {
  common: {
    label: "Common",
    color: "#4ADE80",
    gradient: ["#4ADE80", "#22C55E"],
  },
  rare: {
    label: "Rare",
    color: "#10B981",
    gradient: ["#34D399", "#10B981"],
  },
  epic: {
    label: "Epic",
    color: Colors.cyberLime,
    gradient: [Colors.cyberLime, "#A3E635"],
  },
  legendary: {
    label: "Legendary",
    color: "#00FF88",
    gradient: ["#00FF88", Colors.cyberLime],
  },
};

interface AchievementScreenProps {
  visible: boolean;
  onClose: () => void;
}

export function AchievementScreen({
  visible,
  onClose,
}: AchievementScreenProps) {
  const { badges, currentStreak, completions } = useApp();
  const [activeTab, setActiveTab] = useState<"unlocked" | "locked">("unlocked");
  const confettiRef = useRef<LottieView>(null);

  // Animation for badge glow
  const glowScale = useSharedValue(1);
  const shimmer = useSharedValue(0);

  useEffect(() => {
    if (visible && activeTab === "unlocked") {
      // Play confetti when showing unlocked badges
      setTimeout(() => confettiRef.current?.play(), 300);

      // Pulsing glow effect
      glowScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1500 }),
          withTiming(1, { duration: 1500 }),
        ),
        -1,
        true,
      );

      // Shimmer effect
      shimmer.value = withRepeat(withTiming(1, { duration: 2000 }), -1, false);
    }
  }, [visible, activeTab]);

  const animatedGlowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
  }));

  const unlockedBadges = useMemo(
    () => badges.filter((b) => b.unlockedAt),
    [badges],
  );
  const lockedBadges = useMemo(
    () => badges.filter((b) => !b.unlockedAt),
    [badges],
  );

  const displayBadges =
    activeTab === "unlocked" ? unlockedBadges : lockedBadges;

  // Calculate progress for locked badges
  const getBadgeProgress = (
    badge: Badge,
  ): { current: number; target: number; percent: number } => {
    const [type, value] = badge.requirement?.split(":") || [];
    const target = parseInt(value) || 0;

    switch (type) {
      case "streak":
        return {
          current: currentStreak,
          target,
          percent: Math.min((currentStreak / target) * 100, 100),
        };
      case "tasks":
        return {
          current: completions.length,
          target,
          percent: Math.min((completions.length / target) * 100, 100),
        };
      default:
        return { current: 0, target, percent: 0 };
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>🏆 Achievements</Text>
          <View style={styles.badgeCount}>
            <Ionicons name="ribbon" size={16} color={Colors.cyberLime} />
            <Text style={styles.badgeCountText}>
              {unlockedBadges.length}/{badges.length}
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <Pressable
            style={[styles.tab, activeTab === "unlocked" && styles.tabActive]}
            onPress={() => setActiveTab("unlocked")}
          >
            <Ionicons
              name="star"
              size={18}
              color={
                activeTab === "unlocked" ? Colors.cyberLime : Colors.textMuted
              }
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "unlocked" && styles.tabTextActive,
              ]}
            >
              Unlocked ({unlockedBadges.length})
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === "locked" && styles.tabActive]}
            onPress={() => setActiveTab("locked")}
          >
            <Ionicons
              name="lock-closed"
              size={18}
              color={
                activeTab === "locked" ? Colors.cyberLime : Colors.textMuted
              }
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "locked" && styles.tabTextActive,
              ]}
            >
              Locked ({lockedBadges.length})
            </Text>
          </Pressable>
        </View>

        {/* Badge Cards - Horizontal Swipeable */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContent}
          decelerationRate="fast"
          snapToInterval={BADGE_CARD_WIDTH + Spacing.lg}
        >
          {displayBadges.length === 0 ? (
            <View style={[styles.emptyCard, { width: BADGE_CARD_WIDTH }]}>
              <View style={styles.emptyIconCircle}>
                <Ionicons
                  name={
                    activeTab === "unlocked"
                      ? "ribbon-outline"
                      : "trophy-outline"
                  }
                  size={48}
                  color={Colors.textMuted}
                />
              </View>
              <Text style={styles.emptyText}>
                {activeTab === "unlocked"
                  ? "No badges unlocked yet"
                  : "All badges unlocked! 🎉"}
              </Text>
              <Text style={styles.emptySubtext}>
                {activeTab === "unlocked"
                  ? "Complete tasks and maintain streaks to earn badges"
                  : "You're a legend!"}
              </Text>
            </View>
          ) : (
            displayBadges.map((badge, index) => {
              const rarityConfig = RARITY_CONFIG[badge.rarity];
              const badgeImage = BADGE_IMAGES[badge.id];
              const isUnlocked = !!badge.unlockedAt;
              const progress = !isUnlocked ? getBadgeProgress(badge) : null;

              return (
                <Animated.View
                  key={badge.id}
                  entering={SlideInRight.delay(index * 100)}
                  style={[styles.badgeCard, { width: BADGE_CARD_WIDTH }]}
                >
                  <LinearGradient
                    colors={[`${rarityConfig.color}15`, Colors.surface]}
                    style={styles.badgeCardGradient}
                  >
                    {/* Circle Badge Container with Glow */}
                    <View style={styles.badgeCircleWrapper}>
                      {/* Single Reward Light Effect for Unlocked Badges */}
                      {isUnlocked && (
                        <Animated.View
                          style={[styles.glowContainer, animatedGlowStyle]}
                        >
                          <LottieView
                            source={require("@/assets/images/Reward light effect.json")}
                            autoPlay
                            loop
                            style={styles.rewardLight}
                          />
                        </Animated.View>
                      )}

                      {/* Circle Badge Image */}
                      <View
                        style={[
                          styles.badgeCircle,
                          isUnlocked && {
                            borderColor: rarityConfig.color,
                            shadowColor: rarityConfig.color,
                          },
                        ]}
                      >
                        <LinearGradient
                          colors={
                            isUnlocked
                              ? rarityConfig.gradient
                              : ["#3B3B4F", "#2A2A3A"]
                          }
                          style={styles.badgeCircleInner}
                        >
                          {badgeImage ? (
                            <Image
                              source={badgeImage}
                              style={styles.badgeImage}
                              contentFit="cover"
                            />
                          ) : (
                            <Text style={styles.badgeEmoji}>{badge.icon}</Text>
                          )}
                          {!isUnlocked && (
                            <View style={styles.lockOverlay}>
                              <Ionicons
                                name="lock-closed"
                                size={32}
                                color={Colors.textMuted}
                              />
                            </View>
                          )}
                        </LinearGradient>
                      </View>
                    </View>

                    {/* Badge Info */}
                    <Text
                      style={[
                        styles.badgeName,
                        {
                          color: isUnlocked
                            ? rarityConfig.color
                            : Colors.textMuted,
                        },
                      ]}
                    >
                      {badge.name}
                    </Text>
                    <Text style={styles.badgeDescription}>
                      {badge.description}
                    </Text>

                    {/* Rarity Badge */}
                    <View
                      style={[
                        styles.rarityBadge,
                        { backgroundColor: `${rarityConfig.color}20` },
                      ]}
                    >
                      <Ionicons
                        name={
                          badge.rarity === "legendary"
                            ? "diamond"
                            : badge.rarity === "epic"
                              ? "flash"
                              : badge.rarity === "rare"
                                ? "star"
                                : "ellipse"
                        }
                        size={14}
                        color={rarityConfig.color}
                      />
                      <Text
                        style={[
                          styles.rarityText,
                          { color: rarityConfig.color },
                        ]}
                      >
                        {rarityConfig.label}
                      </Text>
                    </View>

                    {/* Progress for locked badges */}
                    {!isUnlocked && progress && (
                      <View style={styles.progressContainer}>
                        <View style={styles.progressHeader}>
                          <Text style={styles.progressLabel}>Progress</Text>
                          <Text style={styles.progressValue}>
                            {progress.current}/{progress.target}
                          </Text>
                        </View>
                        <View style={styles.progressBar}>
                          <LinearGradient
                            colors={rarityConfig.gradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[
                              styles.progressFill,
                              { width: `${Math.max(progress.percent, 2)}%` },
                            ]}
                          />
                        </View>
                        <Text style={styles.progressPercent}>
                          {Math.round(progress.percent)}% Complete
                        </Text>
                      </View>
                    )}

                    {/* Unlock date for unlocked badges */}
                    {isUnlocked && badge.unlockedAt && (
                      <View style={styles.unlockInfo}>
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color={Colors.success}
                        />
                        <Text style={styles.unlockDate}>
                          Unlocked{" "}
                          {new Date(badge.unlockedAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </Text>
                      </View>
                    )}
                  </LinearGradient>
                </Animated.View>
              );
            })
          )}
        </ScrollView>

        {/* Page Indicator */}
        {displayBadges.length > 0 && (
          <View style={styles.pageIndicator}>
            <View style={styles.dotsContainer}>
              {displayBadges.map((_, index) => (
                <View
                  key={index}
                  style={[styles.dot, index === 0 && styles.dotActive]}
                />
              ))}
            </View>
            <Text style={styles.swipeHint}>← Swipe to explore →</Text>
          </View>
        )}

        {/* Confetti overlay for unlocked badges */}
        {activeTab === "unlocked" && unlockedBadges.length > 0 && (
          <View style={styles.confettiOverlay} pointerEvents="none">
            <LottieView
              ref={confettiRef}
              source={require("@/assets/images/Confetti.json")}
              autoPlay={false}
              loop={false}
              style={StyleSheet.absoluteFill}
            />
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

// Default export for Expo Router compatibility
export default function AchievementsPage() {
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  confettiOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: Typography.sizes["2xl"],
    fontFamily: Typography.fonts.heading,
    color: Colors.textPrimary,
  },
  badgeCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  badgeCountText: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.number,
    color: Colors.cyberLime,
  },
  tabs: {
    flexDirection: "row",
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.xl,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  tabActive: {
    backgroundColor: Colors.surface,
  },
  tabText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.bodySemibold,
    color: Colors.textMuted,
  },
  tabTextActive: {
    color: Colors.cyberLime,
  },
  carouselContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  badgeCard: {
    marginRight: Spacing.lg,
  },
  badgeCardGradient: {
    borderRadius: BorderRadius["2xl"],
    padding: Spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    minHeight: 450,
    overflow: "hidden",
  },
  badgeCircleWrapper: {
    position: "relative",
    width: 180,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  glowContainer: {
    position: "absolute",
    width: 220,
    height: 220,
    justifyContent: "center",
    alignItems: "center",
  },
  rewardLight: {
    width: "100%",
    height: "100%",
  },
  badgeCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: "#36ff32ff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },
  badgeCircleInner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  badgeImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  badgeEmoji: {
    fontSize: 56,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 70,
  },
  badgeName: {
    fontSize: Typography.sizes["xl"],
    fontFamily: Typography.fonts.heading,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  badgeDescription: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.lg,
    lineHeight: 22,
    paddingHorizontal: Spacing.md,
  },
  rarityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.lg,
  },
  rarityText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.bodySemibold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  progressContainer: {
    width: "100%",
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  progressLabel: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
  },
  progressValue: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.number,
    color: Colors.textPrimary,
  },
  progressBar: {
    height: 10,
    backgroundColor: Colors.borderDefault,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: BorderRadius.full,
  },
  progressPercent: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: Colors.textMuted,
    textAlign: "center",
    marginTop: Spacing.sm,
  },
  unlockInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.md,
    backgroundColor: `${Colors.success}15`,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  unlockDate: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.bodySemibold,
    color: Colors.success,
  },
  emptyCard: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius["2xl"],
    padding: Spacing["2xl"],
    minHeight: 350,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  emptyText: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.fonts.heading,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.body,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
    textAlign: "center",
    paddingHorizontal: Spacing.xl,
  },
  pageIndicator: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  dotsContainer: {
    flexDirection: "row",
    gap: Spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.borderDefault,
  },
  dotActive: {
    backgroundColor: Colors.cyberLime,
    width: 24,
  },
  swipeHint: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.body,
    color: Colors.textMuted,
  },
});
