import { BorderRadius, Colors, Spacing, Typography } from "@/constants/design";
import type { Badge, BadgeRarity } from "@/types";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeIn, ZoomIn } from "react-native-reanimated";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Badge images mapping
export const BADGE_IMAGES: Record<string, any> = {
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

// Rarity colors
const RARITY_COLORS: Record<
  BadgeRarity,
  { primary: string; secondary: string; bg: string; border: string }
> = {
  common: {
    primary: "#9CA3AF",
    secondary: "#6B7280",
    bg: "rgba(156, 163, 175, 0.1)",
    border: "rgba(156, 163, 175, 0.3)",
  },
  rare: {
    primary: "#60A5FA",
    secondary: "#3B82F6",
    bg: "rgba(96, 165, 250, 0.1)",
    border: "rgba(96, 165, 250, 0.3)",
  },
  epic: {
    primary: "#A78BFA",
    secondary: "#8B5CF6",
    bg: "rgba(167, 139, 250, 0.1)",
    border: "rgba(167, 139, 250, 0.3)",
  },
  legendary: {
    primary: "#FBBF24",
    secondary: "#F59E0B",
    bg: "rgba(251, 191, 36, 0.15)",
    border: "rgba(251, 191, 36, 0.4)",
  },
};

// RARITY_LABELS
const RARITY_LABELS: Record<BadgeRarity, string> = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};

interface BadgeAchievementCardProps {
  badge: Badge;
  onPress?: () => void;
  showUnlockAnimation?: boolean;
}

export function BadgeAchievementCard({
  badge,
  onPress,
  showUnlockAnimation = false,
}: BadgeAchievementCardProps) {
  const confettiRef = useRef<LottieView>(null);
  const isUnlocked = !!badge.unlockedAt;
  const rarityStyle = RARITY_COLORS[badge.rarity];
  const badgeImage = BADGE_IMAGES[badge.id];

  useEffect(() => {
    if (showUnlockAnimation && confettiRef.current) {
      confettiRef.current.play();
    }
  }, [showUnlockAnimation]);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: isUnlocked ? rarityStyle.bg : Colors.surface,
          borderColor: isUnlocked ? rarityStyle.border : Colors.borderDefault,
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      {/* Confetti animation overlay */}
      {showUnlockAnimation && (
        <LottieView
          ref={confettiRef}
          source={require("@/assets/images/Confetti.json")}
          autoPlay={false}
          loop={false}
          style={styles.confettiOverlay}
        />
      )}

      {/* Badge Image or Locked Icon */}
      <View
        style={[
          styles.imageContainer,
          !isUnlocked && styles.imageContainerLocked,
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
            <Text style={styles.lockIcon}>🔒</Text>
          </View>
        )}
      </View>

      {/* Badge Info */}
      <View style={styles.info}>
        <Text
          style={[
            styles.name,
            { color: isUnlocked ? rarityStyle.primary : Colors.textMuted },
          ]}
          numberOfLines={1}
        >
          {badge.name}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {badge.description}
        </Text>
        <View style={styles.footer}>
          <View
            style={[
              styles.rarityBadge,
              {
                backgroundColor: isUnlocked
                  ? rarityStyle.primary
                  : Colors.borderDefault,
              },
            ]}
          >
            <Text
              style={[
                styles.rarityText,
                { color: isUnlocked ? Colors.background : Colors.textMuted },
              ]}
            >
              {RARITY_LABELS[badge.rarity]}
            </Text>
          </View>
          {isUnlocked && badge.unlockedAt && (
            <Text style={styles.unlockDate}>
              {new Date(badge.unlockedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

interface BadgeUnlockModalProps {
  badge: Badge | null;
  visible: boolean;
  onClose: () => void;
}

export function BadgeUnlockModal({
  badge,
  visible,
  onClose,
}: BadgeUnlockModalProps) {
  const confettiRef = useRef<LottieView>(null);
  const rewardRef = useRef<LottieView>(null);

  useEffect(() => {
    if (visible) {
      confettiRef.current?.play();
      rewardRef.current?.play();
    }
  }, [visible]);

  if (!badge) return null;

  const rarityStyle = RARITY_COLORS[badge.rarity];
  const badgeImage = BADGE_IMAGES[badge.id];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        {/* Confetti */}
        <LottieView
          ref={confettiRef}
          source={require("@/assets/images/Confetti.json")}
          autoPlay
          loop={false}
          style={styles.fullConfetti}
        />

        {/* Reward Light Effect */}
        <LottieView
          ref={rewardRef}
          source={require("@/assets/images/Reward light effect.json")}
          autoPlay
          loop
          style={styles.rewardEffect}
        />

        <Animated.View
          entering={ZoomIn.delay(100).springify()}
          style={styles.modalContent}
        >
          <LinearGradient
            colors={[rarityStyle.bg, Colors.surface]}
            style={styles.modalGradient}
          >
            <Text style={styles.unlockTitle}>🎉 Badge Unlocked!</Text>

            <View style={styles.modalBadgeContainer}>
              {badgeImage ? (
                <Image
                  source={badgeImage}
                  style={styles.modalBadgeImage}
                  contentFit="contain"
                />
              ) : (
                <Text style={styles.modalBadgeEmoji}>{badge.icon}</Text>
              )}
            </View>

            <Text
              style={[styles.modalBadgeName, { color: rarityStyle.primary }]}
            >
              {badge.name}
            </Text>
            <Text style={styles.modalBadgeDesc}>{badge.description}</Text>

            <View
              style={[
                styles.modalRarityBadge,
                { backgroundColor: rarityStyle.primary },
              ]}
            >
              <Text style={styles.modalRarityText}>
                {RARITY_LABELS[badge.rarity]}
              </Text>
            </View>

            <Pressable style={styles.closeButton} onPress={onClose}>
              <LinearGradient
                colors={[Colors.cyberLime, "#B8E600"]}
                style={styles.closeButtonGradient}
              >
                <Text style={styles.closeButtonText}>Awesome!</Text>
              </LinearGradient>
            </Pressable>
          </LinearGradient>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

interface BadgesGridProps {
  badges: Badge[];
  onBadgePress?: (badge: Badge) => void;
}

export function BadgesGrid({ badges, onBadgePress }: BadgesGridProps) {
  const unlockedBadges = badges.filter((b) => b.unlockedAt);
  const lockedBadges = badges.filter((b) => !b.unlockedAt);

  return (
    <View style={styles.gridContainer}>
      {/* Unlocked Badges Section */}
      {unlockedBadges.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🏆 Unlocked</Text>
            <Text style={styles.sectionCount}>{unlockedBadges.length}</Text>
          </View>
          <View style={styles.grid}>
            {unlockedBadges.map((badge, index) => (
              <Animated.View
                key={badge.id}
                entering={FadeIn.delay(index * 50)}
                style={styles.gridItem}
              >
                <BadgeAchievementCard
                  badge={badge}
                  onPress={() => onBadgePress?.(badge)}
                />
              </Animated.View>
            ))}
          </View>
        </>
      )}

      {/* Locked Badges Section */}
      {lockedBadges.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleLocked}>🔒 Locked</Text>
            <Text style={styles.sectionCount}>{lockedBadges.length}</Text>
          </View>
          <View style={styles.grid}>
            {lockedBadges.map((badge, index) => (
              <Animated.View
                key={badge.id}
                entering={FadeIn.delay(100 + index * 30)}
                style={styles.gridItem}
              >
                <BadgeAchievementCard
                  badge={badge}
                  onPress={() => onBadgePress?.(badge)}
                />
              </Animated.View>
            ))}
          </View>
        </>
      )}

      {badges.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🎖️</Text>
          <Text style={styles.emptyText}>No badges yet</Text>
          <Text style={styles.emptySubtext}>
            Complete tasks to earn badges!
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Badge Card Styles
  card: {
    flexDirection: "row",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.md,
  },
  confettiOverlay: {
    position: "absolute",
    width: "200%",
    height: "200%",
    top: -50,
    left: -50,
    zIndex: 10,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.lg,
    backgroundColor: "rgba(0,0,0,0.05)",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  imageContainerLocked: {
    opacity: 0.5,
  },
  badgeImage: {
    width: 52,
    height: 52,
  },
  badgeEmoji: {
    fontSize: 32,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  lockIcon: {
    fontSize: 20,
  },
  info: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.heading,
    marginBottom: 4,
  },
  description: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  rarityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  rarityText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodySemibold,
    textTransform: "uppercase",
  },
  unlockDate: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: Colors.textMuted,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullConfetti: {
    position: "absolute",
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  rewardEffect: {
    position: "absolute",
    width: 300,
    height: 300,
  },
  modalContent: {
    width: SCREEN_WIDTH * 0.85,
    maxWidth: 360,
  },
  modalGradient: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  unlockTitle: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.fonts.heading,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  modalBadgeContainer: {
    width: 120,
    height: 120,
    marginBottom: Spacing.lg,
  },
  modalBadgeImage: {
    width: "100%",
    height: "100%",
  },
  modalBadgeEmoji: {
    fontSize: 80,
  },
  modalBadgeName: {
    fontSize: Typography.sizes["2xl"],
    fontFamily: Typography.fonts.heading,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  modalBadgeDesc: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  modalRarityBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.xl,
  },
  modalRarityText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.bodySemibold,
    color: Colors.background,
    textTransform: "uppercase",
  },
  closeButton: {
    width: "100%",
  },
  closeButtonGradient: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.heading,
    color: Colors.background,
  },

  // Grid Styles
  gridContainer: {
    gap: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fonts.heading,
    color: Colors.textPrimary,
  },
  sectionTitleLocked: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fonts.heading,
    color: Colors.textMuted,
  },
  sectionCount: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.number,
    color: Colors.textSecondary,
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  grid: {
    gap: Spacing.md,
  },
  gridItem: {
    flex: 1,
  },
  emptyState: {
    alignItems: "center",
    padding: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fonts.heading,
    color: Colors.textSecondary,
  },
  emptySubtext: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.body,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
});
