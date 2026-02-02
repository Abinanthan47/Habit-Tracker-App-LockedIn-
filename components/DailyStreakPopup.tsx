import { BorderRadius, Colors, Spacing, Typography } from "@/constants/design";
import { useApp } from "@/context/AppContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
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
import Animated, {
  FadeIn,
  SlideInUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  ZoomIn,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface DailyStreakPopupProps {
  visible: boolean;
  onClose: () => void;
}

export function DailyStreakPopup({ visible, onClose }: DailyStreakPopupProps) {
  const { currentStreak, longestStreak, getTasksForToday } = useApp();
  const flameRef = useRef<LottieView>(null);
  const confettiRef = useRef<LottieView>(null);
  const rayLightRef = useRef<LottieView>(null);

  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);

  const todayTasks = getTasksForToday();
  const isNewRecord = currentStreak > 0 && currentStreak === longestStreak;

  // Handle navigation with proper close
  const handleNavigate = () => {
    onClose();
    setTimeout(() => {
      router.push("/(tabs)/tasks");
    }, 100);
  };

  useEffect(() => {
    if (visible) {
      // Bounce animation for streak number
      scale.value = withSequence(
        withDelay(300, withSpring(1.3, { damping: 6 })),
        withSpring(1, { damping: 10 }),
      );

      // Glow pulsing
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1500 }),
          withTiming(0.4, { duration: 1500 }),
        ),
        -1,
        true,
      );

      // Play confetti for streaks > 0
      if (currentStreak > 0 && confettiRef.current) {
        setTimeout(() => confettiRef.current?.play(), 400);
      }

      // Play ray light
      if (rayLightRef.current) {
        rayLightRef.current.play();
      }
    }
  }, [visible]);

  const animatedNumberStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  // Get motivational message based on streak
  const getMessage = () => {
    if (currentStreak === 0)
      return { title: "Start Fresh!", subtitle: "Today is a new beginning" };
    if (currentStreak === 1)
      return {
        title: "Day One!",
        subtitle: "The journey begins with a single step",
      };
    if (currentStreak < 7)
      return { title: "Building Momentum!", subtitle: "Keep pushing forward" };
    if (currentStreak < 14)
      return { title: "One Week Strong!", subtitle: "You're on fire!" };
    if (currentStreak < 21)
      return { title: "Two Weeks!", subtitle: "Habit forming in progress" };
    if (currentStreak < 30)
      return { title: "Almost There!", subtitle: "A habit is being born" };
    if (currentStreak < 100)
      return { title: "Legendary!", subtitle: "Nothing can stop you" };
    return { title: "Unstoppable!", subtitle: "You're in the 1%" };
  };

  const message = getMessage();

  // Get streak tier color
  const getTierColor = () => {
    if (currentStreak >= 100) return "#FFD700"; // Gold
    if (currentStreak >= 30) return "#A78BFA"; // Epic Purple
    if (currentStreak >= 7) return "#60A5FA"; // Rare Blue
    return Colors.cyberLime; // Common
  };

  const tierColor = getTierColor();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        {/* Confetti on top */}
        {currentStreak > 0 && (
          <View style={styles.confetti} pointerEvents="none">
            <LottieView
              ref={confettiRef}
              source={require("@/assets/images/Confetti.json")}
              autoPlay={false}
              loop={false}
              style={StyleSheet.absoluteFill}
            />
          </View>
        )}

        <Pressable onPress={(e) => e.stopPropagation()}>
          <Animated.View
            entering={ZoomIn.springify().damping(12)}
            style={styles.popup}
          >
            <LinearGradient
              colors={[Colors.surfaceElevated, Colors.surface]}
              style={styles.popupGradient}
            >
              {/* Close button */}
              <Pressable
                style={styles.closeButton}
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </Pressable>

              {/* Flame with Ray Light Effect Behind */}
              <View style={styles.flameSection}>
                {/* Ray Light Effect - behind the streak */}
                <Animated.View
                  style={[styles.rayLightContainer, animatedGlowStyle]}
                >
                  <LottieView
                    ref={rayLightRef}
                    source={require("@/assets/images/Reward light effect.json")}
                    autoPlay
                    loop
                    style={styles.rayLight}
                  />
                </Animated.View>

                <View style={styles.flameContainer}>
                  <LottieView
                    ref={flameRef}
                    source={require("@/assets/images/flame.json")}
                    autoPlay
                    loop
                    style={styles.flame}
                  />
                </View>

                {/* Streak Number with ray effect behind */}
                <Animated.View
                  style={[styles.streakContainer, animatedNumberStyle]}
                >
                  <Text style={[styles.streakNumber, { color: tierColor }]}>
                    {currentStreak}
                  </Text>
                  <Text style={styles.streakLabel}>Day Streak</Text>
                </Animated.View>
              </View>

              {/* Message */}
              <Animated.View
                entering={FadeIn.delay(400)}
                style={styles.messageContainer}
              >
                <Text style={styles.messageTitle}>{message.title}</Text>
                <Text style={styles.messageSubtitle}>{message.subtitle}</Text>
              </Animated.View>

              {/* New Record Badge */}
              {isNewRecord && currentStreak > 1 && (
                <Animated.View
                  entering={SlideInUp.delay(600)}
                  style={styles.recordBadge}
                >
                  <Ionicons name="trophy" size={18} color={Colors.warning} />
                  <Text style={styles.recordText}>New Personal Record! 🎉</Text>
                </Animated.View>
              )}

              {/* Today's Tasks Preview - Pressable to navigate */}
              <Animated.View entering={FadeIn.delay(500)}>
                <Pressable style={styles.tasksPreview} onPress={handleNavigate}>
                  <View style={styles.tasksIcon}>
                    <Ionicons name="list" size={20} color={Colors.cyberLime} />
                  </View>
                  <View style={styles.tasksInfo}>
                    <Text style={styles.tasksTitle}>Today's Habits</Text>
                    <Text style={styles.tasksCount}>
                      {todayTasks.length}{" "}
                      {todayTasks.length === 1 ? "habit" : "habits"} waiting for
                      you
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={Colors.textMuted}
                  />
                </Pressable>
              </Animated.View>

              {/* Streak Tier */}
              <Animated.View
                entering={FadeIn.delay(700)}
                style={styles.tierContainer}
              >
                <View
                  style={[
                    styles.tierBadge,
                    { backgroundColor: `${tierColor}20` },
                  ]}
                >
                  <Text style={[styles.tierText, { color: tierColor }]}>
                    {currentStreak >= 100
                      ? "👑 Legendary"
                      : currentStreak >= 30
                        ? "💎 Epic"
                        : currentStreak >= 7
                          ? "⭐ Rising Star"
                          : "🌱 Beginner"}
                  </Text>
                </View>
              </Animated.View>
            </LinearGradient>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  confetti: {
    position: "absolute",
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    zIndex: 100,
    pointerEvents: "none",
  },
  popup: {
    width: SCREEN_WIDTH - Spacing.xl * 2,
    maxWidth: 380,
    zIndex: 50,
  },
  popupGradient: {
    borderRadius: BorderRadius["2xl"],
    padding: Spacing.xl,
    paddingTop: Spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  closeButton: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.md,
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },
  flameSection: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: Spacing.md,
    paddingTop: Spacing.lg,
  },
  rayLightContainer: {
    position: "absolute",
    width: 300,
    height: 300,
    justifyContent: "center",
    alignItems: "center",
  },
  rayLight: {
    width: "100%",
    height: "100%",
  },
  flameContainer: {
    width: 100,
    height: 100,
    marginBottom: Spacing.sm,
    zIndex: 2,
  },
  flame: {
    width: "100%",
    height: "100%",
  },
  streakContainer: {
    alignItems: "center",
    marginBottom: Spacing.md,
    zIndex: 2,
  },
  streakNumber: {
    fontSize: 72,
    fontFamily: Typography.fonts.number,
    lineHeight: 78,
  },
  streakLabel: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fonts.bodySemibold,
    color: Colors.textSecondary,
    marginTop: -Spacing.xs,
  },
  messageContainer: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  messageTitle: {
    fontSize: Typography.sizes["2xl"],
    fontFamily: Typography.fonts.heading,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  messageSubtitle: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: Spacing.md,
  },
  recordBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: `${Colors.warning}15`,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.lg,
  },
  recordText: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.bodySemibold,
    color: Colors.warning,
  },
  tasksPreview: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  tasksIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.cyberLimeLight,
    justifyContent: "center",
    alignItems: "center",
  },
  tasksInfo: {
    flex: 1,
  },
  tasksTitle: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.bodySemibold,
    color: Colors.textPrimary,
  },
  tasksCount: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
  },
  tierContainer: {
    marginTop: Spacing.xs,
  },
  tierBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  tierText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.bodySemibold,
  },
});
