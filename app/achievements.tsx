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

// Rarity labels and colors
const RARITY_CONFIG: Record<BadgeRarity, { label: string; color: string }> = {
  common: { label: "Common", color: "#9CA3AF" },
  rare: { label: "Rare", color: "#60A5FA" },
  epic: { label: "Epic", color: "#A78BFA" },
  legendary: { label: "Legendary", color: "#FBBF24" },
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
  const rewardLightRef = useRef<LottieView>(null);

  // Animation for badge glow
  const glowScale = useSharedValue(1);

  useEffect(() => {
    if (visible && activeTab === "unlocked") {
      // Play reward animations when showing unlocked badges
      confettiRef.current?.play();
      rewardLightRef.current?.play();

      // Pulsing glow effect
      glowScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1000 }),
          withTiming(1, { duration: 1000 }),
        ),
        -1,
        true,
      );
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
        {/* Background reward light animation */}
        {activeTab === "unlocked" && unlockedBadges.length > 0 && (
          <LottieView
            ref={rewardLightRef}
            source={require("@/assets/images/Reward light effect.json")}
            autoPlay
            loop
            style={styles.rewardLightBg}
          />
        )}

        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
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
              <Ionicons
                name={
                  activeTab === "unlocked" ? "ribbon-outline" : "trophy-outline"
                }
                size={64}
                color={Colors.textMuted}
              />
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
                    colors={[`${rarityConfig.color}20`, Colors.surface]}
                    style={styles.badgeCardGradient}
                  >
                    {/* Reward Light Effect for Unlocked Badges */}
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

                    {/* Badge Image */}
                    <View
                      style={[
                        styles.badgeImageContainer,
                        isUnlocked && {
                          backgroundColor: `${rarityConfig.color}20`,
                        },
                      ]}
                    >
                      {badgeImage ? (
                        <Image
                          source={badgeImage}
                          style={styles.badgeImage}
                          contentFit="contain"
                        />
                      ) : (
                        <Text style={styles.badgeEmoji}>{badge.icon}</Text>
                      )}
                      {!isUnlocked && (
                        <View style={styles.lockOverlay}>
                          <Ionicons
                            name="lock-closed"
                            size={40}
                            color={Colors.textMuted}
                          />
                        </View>
                      )}
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
                        { backgroundColor: `${rarityConfig.color}30` },
                      ]}
                    >
                      <Ionicons
                        name={
                          badge.rarity === "legendary"
                            ? "diamond"
                            : badge.rarity === "epic"
                              ? "flash"
                              : "star"
                        }
                        size={12}
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
                            colors={[
                              rarityConfig.color,
                              `${rarityConfig.color}80`,
                            ]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[
                              styles.progressFill,
                              { width: `${Math.max(progress.percent, 2)}%` },
                            ]}
                          />
                        </View>
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
          <LottieView
            ref={confettiRef}
            source={require("@/assets/images/Confetti.json")}
            autoPlay={false}
            loop={false}
            style={styles.confettiOverlay}
          />
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
  rewardLightBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    opacity: 0.3,
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
    minHeight: 420,
    overflow: "hidden",
  },
  glowContainer: {
    position: "absolute",
    top: -50,
    width: 250,
    height: 250,
  },
  rewardLight: {
    width: "100%",
    height: "100%",
  },
  badgeImageContainer: {
    width: 160,
    height: 160,
    borderRadius: BorderRadius["2xl"],
    backgroundColor: Colors.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
    position: "relative",
    overflow: "hidden",
    zIndex: 1,
  },
  badgeImage: {
    width: 130,
    height: 130,
  },
  badgeEmoji: {
    fontSize: 72,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  badgeName: {
    fontSize: Typography.sizes["2xl"],
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.lg,
  },
  rarityText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.bodySemibold,
    textTransform: "uppercase",
  },
  progressContainer: {
    width: "100%",
    marginTop: Spacing.md,
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
  emptyText: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.fonts.heading,
    color: Colors.textSecondary,
    marginTop: Spacing.xl,
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
