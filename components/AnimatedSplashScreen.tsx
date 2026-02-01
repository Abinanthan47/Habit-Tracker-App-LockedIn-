import { BorderRadius, Colors, Spacing, Typography } from "@/constants/design";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface SplashScreenProps {
  onAnimationComplete?: () => void;
}

export function AnimatedSplashScreen({
  onAnimationComplete,
}: SplashScreenProps) {
  const flameRef = useRef<LottieView>(null);

  // Animation values
  const logoScale = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);
  const titleOpacity = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);
  const ringScale = useSharedValue(0);
  const ringOpacity = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    // Orchestrated animation sequence

    // Step 1: Logo appears with bounce
    logoOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));
    logoScale.value = withDelay(
      200,
      withSpring(1, { damping: 10, stiffness: 100 }),
    );

    // Step 2: Glow effect
    glowOpacity.value = withDelay(400, withTiming(0.8, { duration: 600 }));

    // Step 3: Ring expands
    ringScale.value = withDelay(500, withSpring(1, { damping: 15 }));
    ringOpacity.value = withDelay(500, withTiming(1, { duration: 300 }));

    // Step 4: Title slides up
    titleOpacity.value = withDelay(700, withTiming(1, { duration: 400 }));
    titleTranslateY.value = withDelay(700, withSpring(0, { damping: 12 }));

    // Step 5: Tagline fades in
    taglineOpacity.value = withDelay(900, withTiming(1, { duration: 400 }));

    // Step 6: Progress bar
    progressWidth.value = withDelay(
      1000,
      withTiming(100, {
        duration: 1500,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
    );

    // Complete animation and notify parent
    const timer = setTimeout(() => {
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const animatedLogoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const animatedRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const animatedTitleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: titleTranslateY.value }],
    opacity: titleOpacity.value,
  }));

  const animatedTaglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0A0A0A", "#111111", "#0A0A0A"]}
        locations={[0, 0.5, 1]}
        style={styles.gradient}
      >
        {/* Background glow effect */}
        <Animated.View style={[styles.glowContainer, animatedGlowStyle]}>
          <LinearGradient
            colors={["transparent", `${Colors.cyberLime}15`, "transparent"]}
            style={styles.glow}
          />
        </Animated.View>

        {/* Outer ring */}
        <Animated.View style={[styles.outerRing, animatedRingStyle]}>
          <LinearGradient
            colors={[
              `${Colors.cyberLime}40`,
              "transparent",
              `${Colors.cyberLime}20`,
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ringGradient}
          />
        </Animated.View>

        {/* Logo container with flame */}
        <Animated.View style={[styles.logoContainer, animatedLogoStyle]}>
          <View style={styles.logoCircle}>
            <Image
              source={require("@/assets/images/app-icon.png")}
              style={styles.logoImage}
              contentFit="contain"
            />
            {/* Flame overlay */}
            <View style={styles.flameOverlay}>
              <LottieView
                ref={flameRef}
                source={require("@/assets/images/flame.json")}
                autoPlay
                loop
                style={styles.flame}
              />
            </View>
          </View>
        </Animated.View>

        {/* App name */}
        <Animated.View style={[styles.titleContainer, animatedTitleStyle]}>
          <Text style={styles.title}>
            <Text style={styles.titleAccent}>LOCKED</Text>
            <Text style={styles.titleWhite}>IN</Text>
          </Text>
        </Animated.View>

        {/* Tagline */}
        <Animated.View style={[styles.taglineContainer, animatedTaglineStyle]}>
          <Text style={styles.tagline}>Build habits. Unlock potential.</Text>
        </Animated.View>

        {/* Loading progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressBar, animatedProgressStyle]}>
              <LinearGradient
                colors={[Colors.cyberLime, "#B8E600"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.progressGradient}
              />
            </Animated.View>
          </View>
        </View>

        {/* Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>v1.0.0</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  glowContainer: {
    position: "absolute",
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  glow: {
    width: SCREEN_WIDTH * 1.5,
    height: SCREEN_WIDTH * 1.5,
    borderRadius: SCREEN_WIDTH,
  },
  outerRing: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: "hidden",
  },
  ringGradient: {
    flex: 1,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: `${Colors.cyberLime}30`,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing["2xl"],
  },
  logoCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: Colors.cyberLime,
    overflow: "hidden",
    shadowColor: Colors.cyberLime,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logoImage: {
    width: 110,
    height: 110,
  },
  flameOverlay: {
    position: "absolute",
    bottom: -10,
    width: 50,
    height: 50,
  },
  flame: {
    width: "100%",
    height: "100%",
  },
  titleContainer: {
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 42,
    fontFamily: Typography.fonts.heading,
    letterSpacing: 3,
  },
  titleAccent: {
    color: Colors.cyberLime,
  },
  titleWhite: {
    color: Colors.textPrimary,
  },
  taglineContainer: {
    marginBottom: Spacing["3xl"],
  },
  tagline: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  progressContainer: {
    position: "absolute",
    bottom: 100,
    width: SCREEN_WIDTH - Spacing.xl * 2,
    maxWidth: 300,
  },
  progressTrack: {
    height: 4,
    backgroundColor: Colors.borderDefault,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  progressGradient: {
    flex: 1,
  },
  versionContainer: {
    position: "absolute",
    bottom: Spacing.xl,
  },
  versionText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: Colors.textMuted,
  },
});
