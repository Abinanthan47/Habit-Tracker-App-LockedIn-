import { BorderRadius, Colors, Spacing, Typography } from "@/constants/design";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

// Common emoji categories for goals/habits
const EMOJI_CATEGORIES = {
  Goals: ["🎯", "🏆", "⭐", "💎", "🚀", "🔥", "💪", "🏋️", "🎖️", "🥇"],
  Health: ["💪", "🏃", "🧘", "🍎", "🥗", "💊", "🛁", "😴", "🧠", "❤️"],
  Learning: ["📚", "📖", "✍️", "💻", "🎓", "🧪", "📐", "🔬", "📝", "🎨"],
  Finance: ["💰", "💵", "📈", "🏦", "💳", "🪙", "📊", "💹", "🏠", "🛒"],
  Productivity: ["⏰", "📅", "✅", "📋", "🗂️", "📌", "💼", "🖥️", "📱", "⚡"],
  Lifestyle: ["🏠", "🚗", "✈️", "🎵", "🎮", "📷", "🎬", "☕", "🍳", "🌱"],
  Mindfulness: ["🧘", "🙏", "🌿", "☀️", "🌙", "🌈", "🦋", "🕊️", "💭", "💆"],
  Social: ["👥", "💬", "❤️", "🤝", "👨‍👩‍👧‍👦", "📞", "💌", "🎉", "🎁", "👋"],
};

interface EmojiPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
  selectedEmoji?: string;
}

export function EmojiPicker({
  visible,
  onClose,
  onSelect,
  selectedEmoji,
}: EmojiPickerProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<keyof typeof EMOJI_CATEGORIES>("Goals");

  const categories = Object.keys(
    EMOJI_CATEGORIES,
  ) as (keyof typeof EMOJI_CATEGORIES)[];
  const emojis = EMOJI_CATEGORIES[selectedCategory];

  const handleSelect = (emoji: string) => {
    onSelect(emoji);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={styles.container}
          onPress={(e) => e.stopPropagation()}
        >
          <Animated.View entering={FadeIn} style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.handle} />
              <Text style={styles.title}>Choose Icon</Text>
            </View>

            {/* Category Tabs */}
            <FlatList
              horizontal
              data={categories}
              keyExtractor={(item) => item}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContent}
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.categoryTab,
                    selectedCategory === item && styles.categoryTabActive,
                  ]}
                  onPress={() => setSelectedCategory(item)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === item && styles.categoryTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              )}
            />

            {/* Emoji Grid */}
            <View style={styles.emojiGrid}>
              {emojis.map((emoji, index) => (
                <Pressable
                  key={index}
                  style={[
                    styles.emojiButton,
                    selectedEmoji === emoji && styles.emojiButtonSelected,
                  ]}
                  onPress={() => handleSelect(emoji)}
                >
                  <Text style={styles.emoji}>{emoji}</Text>
                </Pressable>
              ))}
            </View>

            {/* Cancel Button */}
            <Pressable style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius["2xl"],
    borderTopRightRadius: BorderRadius["2xl"],
    maxHeight: "70%",
  },
  content: {
    paddingBottom: Spacing["3xl"],
  },
  header: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderDefault,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.borderDefault,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fonts.heading,
    color: Colors.textPrimary,
  },
  categoriesContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  categoryTab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceElevated,
    marginRight: Spacing.sm,
  },
  categoryTabActive: {
    backgroundColor: Colors.cyberLime,
  },
  categoryText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.bodySemibold,
    color: Colors.textSecondary,
  },
  categoryTextActive: {
    color: Colors.background,
  },
  emojiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    justifyContent: "flex-start",
    gap: Spacing.md,
  },
  emojiButton: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  emojiButtonSelected: {
    borderColor: Colors.cyberLime,
    backgroundColor: Colors.cyberLimeLight,
  },
  emoji: {
    fontSize: 28,
  },
  cancelButton: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surfaceElevated,
    alignItems: "center",
  },
  cancelText: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.bodySemibold,
    color: Colors.textSecondary,
  },
});
