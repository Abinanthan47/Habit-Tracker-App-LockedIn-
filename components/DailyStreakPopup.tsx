import { Colors, BorderRadius, Spacing, Typography } from '@/constants/design';
import { useApp } from '@/context/AppContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import React, { useEffect, useRef } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { 
  FadeIn, 
  ZoomIn,
  SlideInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface DailyStreakPopupProps {
  visible: boolean;
  onClose: () => void;
}

export function DailyStreakPopup({ visible, onClose }: DailyStreakPopupProps) {
  const { currentStreak, longestStreak, getTasksForToday } = useApp();
  const flameRef = useRef<LottieView>(null);
  const confettiRef = useRef<LottieView>(null);
  const rewardLightRef = useRef<LottieView>(null);
  
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);
  const glowOpacity = useSharedValue(0.3);

  const todayTasks = getTasksForToday();
  const isNewRecord = currentStreak > 0 && currentStreak === longestStreak;

  useEffect(() => {
    if (visible) {
      // Bounce animation for streak number
      scale.value = withSequence(
        withDelay(300, withSpring(1.3, { damping: 6 })),
        withSpring(1, { damping: 10 })
      );
      
      // Glow pulsing
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 1500 }),
          withTiming(0.3, { duration: 1500 })
        ),
        -1,
        true
      );
      
      // Play confetti for streaks > 0
      if (currentStreak > 0 && confettiRef.current) {
        setTimeout(() => confettiRef.current?.play(), 400);
      }
      
      // Play reward light
      if (rewardLightRef.current) {
        rewardLightRef.current.play();
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
    if (currentStreak === 0) return { title: "Start Fresh!", subtitle: "Today is a new beginning", emoji: "🌟" };
    if (currentStreak === 1) return { title: "Day One!", subtitle: "The journey of a thousand miles begins with a single step", emoji: "🚀" };
    if (currentStreak < 7) return { title: "Building Momentum!", subtitle: "Keep pushing forward", emoji: "💪" };
    if (currentStreak < 14) return { title: "One Week Strong!", subtitle: "You're on fire!", emoji: "🔥" };
    if (currentStreak < 21) return { title: "Two Weeks!", subtitle: "Habit forming in progress", emoji: "⚡" };
    if (currentStreak < 30) return { title: "Almost There!", subtitle: "A habit is being born", emoji: "🌱" };
    if (currentStreak < 100) return { title: "Legendary!", subtitle: "Nothing can stop you", emoji: "🏆" };
    return { title: "Unstoppable!", subtitle: "You're in the 1%", emoji: "👑" };
  };

  const message = getMessage();

  // Get streak tier color
  const getTierColor = () => {
    if (currentStreak >= 100) return '#FFD700'; // Gold
    if (currentStreak >= 30) return '#A78BFA'; // Epic Purple
    if (currentStreak >= 7) return '#60A5FA'; // Rare Blue
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
      <View style={styles.backdrop}>
        {/* Background Reward Light Effect */}
        <Animated.View style={[styles.rewardLightContainer, animatedGlowStyle]}>
          <LottieView
            ref={rewardLightRef}
            source={require('@/assets/images/Reward light effect.json')}
            autoPlay
            loop
            style={styles.rewardLight}
          />
        </Animated.View>

        {/* Confetti */}
        {currentStreak > 0 && (
          <LottieView
            ref={confettiRef}
            source={require('@/assets/images/Confetti.json')}
            autoPlay={false}
            loop={false}
            style={styles.confetti}
          />
        )}

        <Animated.View 
          entering={ZoomIn.springify().damping(12)}
          style={styles.popup}
        >
          <LinearGradient
            colors={[Colors.surfaceElevated, Colors.surface]}
            style={styles.popupGradient}
          >
            {/* Close button */}
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={22} color={Colors.textMuted} />
            </Pressable>

            {/* Emoji Badge */}
            <Animated.View 
              entering={FadeIn.delay(200)}
              style={styles.emojiBadge}
            >
              <Text style={styles.emoji}>{message.emoji}</Text>
            </Animated.View>

            {/* Flame animation */}
            <View style={styles.flameContainer}>
              <LottieView
                ref={flameRef}
                source={require('@/assets/images/flame.json')}
                autoPlay
                loop
                style={styles.flame}
              />
            </View>

            {/* Streak Number */}
            <Animated.View style={[styles.streakContainer, animatedNumberStyle]}>
              <Text style={[styles.streakNumber, { color: tierColor }]}>{currentStreak}</Text>
              <Text style={styles.streakLabel}>Day Streak</Text>
            </Animated.View>

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
                <Text style={styles.recordText}>New Personal Record!</Text>
                <Text style={styles.recordEmoji}>🎉</Text>
              </Animated.View>
            )}

            {/* Today's Tasks Preview */}
            <Animated.View 
              entering={FadeIn.delay(500)}
              style={styles.tasksPreview}
            >
              <View style={styles.tasksIcon}>
                <Ionicons name="list" size={20} color={Colors.cyberLime} />
              </View>
              <View style={styles.tasksInfo}>
                <Text style={styles.tasksTitle}>Today's Habits</Text>
                <Text style={styles.tasksCount}>
                  {todayTasks.length} {todayTasks.length === 1 ? 'habit' : 'habits'} waiting for you
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </Animated.View>

            {/* CTA Button */}
            <Animated.View entering={FadeIn.delay(700)} style={styles.ctaContainer}>
              <Pressable style={styles.ctaButton} onPress={onClose}>
                <LinearGradient
                  colors={[Colors.cyberLime, '#B8E600']}
                  style={styles.ctaGradient}
                >
                  <Text style={styles.ctaText}>Let's Crush It!</Text>
                  <Ionicons name="flash" size={20} color={Colors.background} />
                </LinearGradient>
              </Pressable>
            </Animated.View>

            {/* Streak Tier */}
            <Animated.View entering={FadeIn.delay(800)} style={styles.tierContainer}>
              <View style={[styles.tierBadge, { backgroundColor: `${tierColor}20` }]}>
                <Text style={[styles.tierText, { color: tierColor }]}>
                  {currentStreak >= 100 ? '👑 Legendary' : 
                   currentStreak >= 30 ? '💎 Epic' : 
                   currentStreak >= 7 ? '⭐ Rising Star' : '🌱 Beginner'}
                </Text>
              </View>
            </Animated.View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardLightContainer: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardLight: {
    width: SCREEN_WIDTH * 1.5,
    height: SCREEN_WIDTH * 1.5,
  },
  confetti: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    zIndex: 100,
  },
  popup: {
    width: SCREEN_WIDTH - Spacing.xl * 2,
    maxWidth: 380,
    zIndex: 50,
  },
  popupGradient: {
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.xl,
    paddingTop: Spacing['3xl'],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  emojiBadge: {
    position: 'absolute',
    top: -20,
    left: '50%',
    marginLeft: -24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.cyberLime,
  },
  emoji: {
    fontSize: 24,
  },
  flameContainer: {
    width: 90,
    height: 90,
    marginBottom: Spacing.sm,
  },
  flame: {
    width: '100%',
    height: '100%',
  },
  streakContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  streakNumber: {
    fontSize: 80,
    fontFamily: Typography.fonts.number,
    lineHeight: 85,
  },
  streakLabel: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fonts.bodySemibold,
    color: Colors.textSecondary,
    marginTop: -Spacing.xs,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  messageTitle: {
    fontSize: Typography.sizes['2xl'],
    fontFamily: Typography.fonts.heading,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  messageSubtitle: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
  },
  recordBadge: {
    flexDirection: 'row',
    alignItems: 'center',
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
  recordEmoji: {
    fontSize: 18,
  },
  tasksPreview: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  tasksIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.cyberLimeLight,
    justifyContent: 'center',
    alignItems: 'center',
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
  ctaContainer: {
    width: '100%',
    marginBottom: Spacing.md,
  },
  ctaButton: {
    width: '100%',
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
  },
  ctaText: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fonts.heading,
    color: Colors.background,
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
