import { BorderRadius, Colors, Spacing, Typography } from "@/constants/design";
import type { Badge, BadgeRarity } from "@/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

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

// Rarity colors
const BADGE_RARITY_COLORS: Record<BadgeRarity, string> = {
  common: "#9CA3AF",
  rare: "#60A5FA",
  epic: "#A78BFA",
  legendary: "#FBBF24",
};

interface BadgeCardProps {
  badge: Badge;
  size?: "small" | "medium" | "large";
  showDetails?: boolean;
}

export function BadgeCard({
  badge,
  size = "medium",
  showDetails = true,
}: BadgeCardProps) {
  const isUnlocked = !!badge.unlockedAt;
  const rarityColor = BADGE_RARITY_COLORS[badge.rarity];
  const badgeImage = BADGE_IMAGES[badge.id];

  const scale = useSharedValue(1);

  React.useEffect(() => {
    if (isUnlocked) {
      scale.value = withSpring(1.1, { damping: 10 }, () => {
        scale.value = withSpring(1, { damping: 15 });
      });
    }
  }, [isUnlocked, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const sizeStyles = {
    small: { iconSize: 24, containerSize: 48, imageSize: 36 },
    medium: { iconSize: 32, containerSize: 64, imageSize: 48 },
    large: { iconSize: 48, containerSize: 88, imageSize: 64 },
  };

  const currentSize = sizeStyles[size];

  if (!showDetails) {
    return (
      <Animated.View
        style={[
          styles.iconOnly,
          {
            width: currentSize.containerSize,
            height: currentSize.containerSize,
            backgroundColor: isUnlocked ? `${rarityColor}25` : Colors.surface,
            opacity: isUnlocked ? 1 : 0.5,
            borderColor: isUnlocked ? `${rarityColor}50` : Colors.borderDefault,
          },
          animatedStyle,
        ]}
      >
        {badgeImage ? (
          <Image
            source={badgeImage}
            style={{
              width: currentSize.imageSize,
              height: currentSize.imageSize,
            }}
            contentFit="contain"
          />
        ) : (
          <Text style={{ fontSize: currentSize.iconSize }}>{badge.icon}</Text>
        )}
        {!isUnlocked && (
          <View style={styles.smallLockOverlay}>
            <Text style={styles.lockEmoji}>🔒</Text>
          </View>
        )}
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: isUnlocked ? `${rarityColor}15` : Colors.surface,
          borderColor: isUnlocked ? `${rarityColor}40` : Colors.borderDefault,
          opacity: isUnlocked ? 1 : 0.6,
        },
        animatedStyle,
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          {
            width: currentSize.containerSize,
            height: currentSize.containerSize,
            backgroundColor: isUnlocked
              ? `${rarityColor}30`
              : Colors.surfaceElevated,
          },
        ]}
      >
        {badgeImage ? (
          <Image
            source={badgeImage}
            style={{
              width: currentSize.imageSize,
              height: currentSize.imageSize,
            }}
            contentFit="contain"
          />
        ) : (
          <Text style={{ fontSize: currentSize.iconSize }}>{badge.icon}</Text>
        )}
      </View>

      <View style={styles.details}>
        <Text style={styles.name}>{badge.name}</Text>
        <Text style={styles.description}>{badge.description}</Text>
        <View
          style={[styles.rarityBadge, { backgroundColor: `${rarityColor}30` }]}
        >
          <Text style={[styles.rarityText, { color: rarityColor }]}>
            {badge.rarity.toUpperCase()}
          </Text>
        </View>
      </View>

      {!isUnlocked && (
        <View style={styles.lockOverlay}>
          <Ionicons name="lock-closed" size={18} color={Colors.textMuted} />
        </View>
      )}
    </Animated.View>
  );
}

interface BadgeGridProps {
  badges: Badge[];
}

export function BadgeGrid({ badges }: BadgeGridProps) {
  const unlockedCount = badges.filter((b) => b.unlockedAt).length;

  return (
    <View style={styles.gridContainer}>
      <View style={styles.gridHeader}>
        <Text style={styles.gridTitle}>🏆 ACHIEVEMENTS</Text>
        <Text style={styles.gridCount}>
          {unlockedCount}/{badges.length}
        </Text>
      </View>

      <View style={styles.grid}>
        {badges.map((badge) => (
          <BadgeCard
            key={badge.id}
            badge={badge}
            size="small"
            showDetails={false}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  iconOnly: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    margin: Spacing.xs,
    position: "relative",
    overflow: "hidden",
  },
  smallLockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  lockEmoji: {
    fontSize: 16,
  },
  iconContainer: {
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  details: {
    flex: 1,
  },
  name: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.heading,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  description: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  rarityBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  rarityText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodySemibold,
    letterSpacing: 0.5,
  },
  lockOverlay: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.md,
  },
  gridContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  gridHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  gridTitle: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.bodySemibold,
    color: Colors.textSecondary,
    letterSpacing: 1,
  },
  gridCount: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.number,
    color: Colors.textPrimary,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: Spacing.sm,
  },
});
