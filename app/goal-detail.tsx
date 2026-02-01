import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { EmojiPicker } from "@/components/EmojiPicker";
import { BorderRadius, Colors, Spacing, Typography } from "@/constants/design";
import { useApp } from "@/context/AppContext";
import type { GoalItem } from "@/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function GoalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    goals,
    goalItems,
    progressUpdates: allUpdates,
    updateGoal,
    deleteGoal,
    addGoalItem,
    updateGoalItem,
    deleteGoalItem,
    getGoalItems,
    addProgressUpdate,
    deleteProgressUpdate,
    getProgressUpdates,
  } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemNotes, setNewItemNotes] = useState("");
  const [progressValue, setProgressValue] = useState("");
  const [completeOnAdd, setCompleteOnAdd] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const goal = useMemo(() => goals.find((g) => g.id === id), [goals, id]);
  const items = useMemo(() => getGoalItems(id || ""), [getGoalItems, id]);
  const updates = useMemo(
    () => getProgressUpdates(id || ""),
    [getProgressUpdates, id],
  );

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      // Uncompleted first, then by date (most recent first)
      if (a.completedAt && !b.completedAt) return 1;
      if (!a.completedAt && b.completedAt) return -1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [items]);

  const sortedUpdates = useMemo(() => {
    return [...updates].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [updates]);

  const completedCount = useMemo(
    () => items.filter((i) => i.completedAt).length,
    [items],
  );

  if (!goal) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Goal not found</Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const effectiveCurrentValue = goal.trackItems
    ? completedCount
    : goal.currentValue;

  const progress = Math.min(
    Math.round((effectiveCurrentValue / goal.targetValue) * 100),
    100,
  );
  const isCompleted = effectiveCurrentValue >= goal.targetValue;

  const handleAddAction = async () => {
    if (goal.targetType === "numeric") {
      if (!progressValue || isNaN(parseFloat(progressValue))) return;

      setIsSubmitting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      try {
        await addProgressUpdate({
          goalId: goal.id,
          value: parseFloat(progressValue),
          notes: newItemNotes.trim() || undefined,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setProgressValue("");
        setNewItemNotes("");
        setShowAddModal(false);
      } catch (error) {
        console.error("Error adding progress update:", error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      if (!newItemTitle.trim()) return;

      setIsSubmitting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      try {
        await addGoalItem({
          goalId: goal.id,
          title: newItemTitle.trim(),
          notes: newItemNotes.trim() || undefined,
          completedAt: completeOnAdd ? new Date().toISOString() : undefined,
        });

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setNewItemTitle("");
        setNewItemNotes("");
        setShowAddModal(false);
        setCompleteOnAdd(true); // Reset for next time
      } catch (error) {
        console.error("Error adding goal item:", error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleToggleItem = async (item: GoalItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    await updateGoalItem(item.id, {
      completedAt: item.completedAt ? undefined : new Date().toISOString(),
    });
  };

  const handleDeleteUpdate = (update: any) => {
    Alert.alert(
      "Delete Update",
      `Remove progress update of ${update.value}${goal.unit || ""}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await deleteProgressUpdate(update.id);
          },
        },
      ],
    );
  };

  const handleDeleteItem = (item: GoalItem) => {
    Alert.alert("Delete Item", `Remove "${item.title}" from your list?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await deleteGoalItem(item.id);
        },
      },
    ]);
  };

  const handleDeleteGoal = () => {
    Alert.alert(
      "Delete Goal",
      "This will permanently delete the goal and all its logged history. You cannot undo this.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Goal",
          style: "destructive",
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            await deleteGoal(goal.id);
            router.back();
          },
        },
      ],
    );
  };

  const handleUpdateEmoji = async (emoji: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await updateGoal(goal.id, { icon: emoji });
  };

  const getItemSuggestion = (): string => {
    const title = goal.title.toLowerCase();
    if (title.includes("book") || title.includes("read"))
      return "e.g. Atomic Habits";
    if (title.includes("podcast") || title.includes("listen"))
      return "e.g. The Huberman Lab #12";
    if (title.includes("movie") || title.includes("watch"))
      return "e.g. Inception";
    if (title.includes("course") || title.includes("learn"))
      return "e.g. React Native Masterclass";
    return "e.g. Task completed...";
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Header with Gradient Background */}
      <LinearGradient
        colors={[Colors.surface, Colors.background]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <Pressable
            style={styles.backButtonHeader}
            onPress={() => router.back()}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={Colors.textPrimary}
            />
          </Pressable>
          <Text style={styles.headerTitle}>Goal Details</Text>
          <Pressable style={styles.optionsButton} onPress={handleDeleteGoal}>
            <Ionicons name="trash-outline" size={20} color={Colors.error} />
          </Pressable>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Goal Card */}
        <Animated.View entering={FadeInDown.delay(100)}>
          <LinearGradient
            colors={["rgba(205, 255, 0, 0.15)", "rgba(205, 255, 0, 0.02)"]}
            style={styles.mainCard}
          >
            <View style={styles.mainCardHeader}>
              <Pressable
                style={[
                  styles.glowIcon,
                  isCompleted && styles.glowIconCompleted,
                ]}
                onPress={() => setShowEmojiPicker(true)}
              >
                <Text style={styles.goalIconEmoji}>{goal.icon || "🎯"}</Text>
                <View style={styles.editIconBadge}>
                  <Ionicons name="pencil" size={10} color={Colors.background} />
                </View>
              </Pressable>
              <View style={styles.mainCardInfo}>
                <Text style={styles.goalName}>{goal.title}</Text>
                <View style={styles.badgeRow}>
                  <View
                    style={[
                      styles.typeBadge,
                      { backgroundColor: `${Colors.info}20` },
                    ]}
                  >
                    <Text
                      style={[styles.typeBadgeText, { color: Colors.info }]}
                    >
                      {goal.year} Goal
                    </Text>
                  </View>
                  {isCompleted && (
                    <View
                      style={[
                        styles.typeBadge,
                        { backgroundColor: `${Colors.success}20` },
                      ]}
                    >
                      <Text
                        style={[
                          styles.typeBadgeText,
                          { color: Colors.success },
                        ]}
                      >
                        Completed
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            <View style={styles.progressSection}>
              <View style={styles.progressTextRow}>
                <View style={styles.progressValues}>
                  <Text style={styles.currentVal}>{effectiveCurrentValue}</Text>
                  <Text style={styles.targetVal}>
                    {" "}
                    / {goal.targetValue} {goal.unit}
                  </Text>
                </View>
                <Text style={styles.progressPercent}>{progress}%</Text>
              </View>

              <View style={styles.progressBarBg}>
                <LinearGradient
                  colors={
                    isCompleted
                      ? [Colors.success, "#22C55E"]
                      : [Colors.cyberLime, "#B8E600"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.progressBarFill,
                    { width: `${Math.max(progress, 3)}%` },
                  ]}
                />
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Action Bar */}
        <Animated.View
          entering={FadeInDown.delay(200)}
          style={styles.actionsBar}
        >
          <Pressable
            style={styles.addItemAction}
            onPress={() => setShowAddModal(true)}
          >
            <LinearGradient
              colors={[Colors.cyberLime, "#B8E600"]}
              style={styles.addItemGradient}
            >
              <Ionicons name="add" size={20} color={Colors.background} />
              <Text style={styles.addItemText}>
                {goal.targetType === "numeric" ? "Update Progress" : "Add Item"}
              </Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* Progress History or Checklist */}
        <Animated.View entering={FadeInDown.delay(300)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {goal.targetType === "numeric"
                ? "Progress History"
                : "Item Checklist"}
            </Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>
                {goal.targetType === "numeric"
                  ? `${updates.length} Updates`
                  : `${items.length} Items`}
              </Text>
            </View>
          </View>

          {goal.targetType === "numeric" ? (
            sortedUpdates.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="trending-up-outline"
                  size={48}
                  color={Colors.textMuted}
                />
                <Text style={styles.emptyTitle}>No progress tracked yet</Text>
                <Text style={styles.emptySubtitle}>
                  Add your achievements periodically to see your progress grow.
                </Text>
                <Pressable
                  style={styles.emptyButton}
                  onPress={() => setShowAddModal(true)}
                >
                  <Text style={styles.emptyButtonText}>Add First Update</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.logList}>
                {sortedUpdates.map((update, index) => (
                  <Animated.View
                    key={update.id}
                    entering={FadeInRight.delay(400 + index * 50)}
                  >
                    <Pressable
                      style={styles.logCard}
                      onLongPress={() => handleDeleteUpdate(update)}
                    >
                      <View style={styles.logLeft}>
                        <View style={styles.updateValueBadge}>
                          <Text style={styles.updateValueText}>
                            +{update.value}
                          </Text>
                        </View>
                        <View style={styles.logInfo}>
                          <Text style={styles.logTitle}>Progress Update</Text>
                          {update.notes && (
                            <Text style={styles.logNotes} numberOfLines={2}>
                              {update.notes}
                            </Text>
                          )}
                          <Text style={styles.logDate}>
                            {new Date(update.createdAt).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </Text>
                        </View>
                      </View>
                      <Pressable
                        style={styles.deleteLogBtn}
                        onPress={() => handleDeleteUpdate(update)}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={16}
                          color={Colors.textMuted}
                        />
                      </Pressable>
                    </Pressable>
                  </Animated.View>
                ))}
              </View>
            )
          ) : sortedItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="list-outline"
                size={48}
                color={Colors.textMuted}
              />
              <Text style={styles.emptyTitle}>Your checklist is empty</Text>
              <Text style={styles.emptySubtitle}>
                List down all the items you need to complete for this goal.
              </Text>
              <Pressable
                style={styles.emptyButton}
                onPress={() => setShowAddModal(true)}
              >
                <Text style={styles.emptyButtonText}>Add First Item</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.logList}>
              {sortedItems.map((item, index) => (
                <Animated.View
                  key={item.id}
                  entering={FadeInRight.delay(400 + index * 50)}
                >
                  <Pressable
                    style={styles.logCard}
                    onLongPress={() => handleDeleteItem(item)}
                  >
                    <View style={styles.logLeft}>
                      <Pressable
                        style={[
                          styles.logCheckbox,
                          item.completedAt && styles.logCheckboxActive,
                        ]}
                        onPress={() => handleToggleItem(item)}
                      >
                        {item.completedAt && (
                          <Ionicons
                            name="checkmark"
                            size={14}
                            color={Colors.background}
                          />
                        )}
                      </Pressable>
                      <View style={styles.logInfo}>
                        <Text
                          style={[
                            styles.logTitle,
                            item.completedAt && styles.logTitleCompleted,
                          ]}
                          numberOfLines={1}
                        >
                          {item.title}
                        </Text>
                        {item.notes && (
                          <Text style={styles.logNotes} numberOfLines={2}>
                            {item.notes}
                          </Text>
                        )}
                        <Text style={styles.logDate}>
                          {new Date(item.createdAt).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </Text>
                      </View>
                    </View>
                    <Pressable
                      style={styles.deleteLogBtn}
                      onPress={() => handleDeleteItem(item)}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={16}
                        color={Colors.textMuted}
                      />
                    </Pressable>
                  </Pressable>
                </Animated.View>
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Add Log Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <Pressable
            style={styles.modalCloseArea}
            onPress={() => setShowAddModal(false)}
          />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>
              {goal.targetType === "numeric"
                ? "Update Progress"
                : "Add New Item"}
            </Text>
            <Text style={styles.modalDesc}>
              {goal.targetType === "numeric"
                ? `Enter how much you achieved toward your ${goal.targetValue}${goal.unit || ""} target.`
                : "Add an individual item you want to track for this goal."}
            </Text>

            {goal.targetType === "numeric" ? (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Value to Add ({goal.unit || "units"})
                </Text>
                <TextInput
                  style={[styles.input, styles.valueInput]}
                  value={progressValue}
                  onChangeText={setProgressValue}
                  placeholder="e.g. 10"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="number-pad"
                  autoFocus
                />
              </View>
            ) : (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Item Name</Text>
                <TextInput
                  style={styles.input}
                  value={newItemTitle}
                  onChangeText={setNewItemTitle}
                  placeholder={getItemSuggestion()}
                  placeholderTextColor={Colors.textMuted}
                  autoFocus
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newItemNotes}
                onChangeText={setNewItemNotes}
                placeholder="Optional details or thoughts..."
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={3}
              />
            </View>

            {goal.targetType === "items" && (
              <Pressable
                style={styles.modalToggleRow}
                onPress={() => {
                  setCompleteOnAdd(!completeOnAdd);
                  Haptics.selectionAsync();
                }}
              >
                <View style={styles.modalToggleInfo}>
                  <Text style={styles.modalToggleLabel}>Mark as Completed</Text>
                  <Text style={styles.modalToggleDesc}>
                    Add this item directly to your progress
                  </Text>
                </View>
                <View
                  style={[
                    styles.toggleSwitch,
                    completeOnAdd && styles.toggleSwitchActive,
                  ]}
                >
                  <View
                    style={[
                      styles.toggleKnob,
                      completeOnAdd && styles.toggleKnobActive,
                    ]}
                  />
                </View>
              </Pressable>
            )}

            <View style={styles.modalFooter}>
              <Pressable
                style={styles.modalCancel}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.modalSubmit,
                  ((goal.targetType === "numeric"
                    ? !progressValue
                    : !newItemTitle.trim()) ||
                    isSubmitting) &&
                    styles.modalSubmitDisabled,
                ]}
                onPress={handleAddAction}
                disabled={
                  (goal.targetType === "numeric"
                    ? !progressValue
                    : !newItemTitle.trim()) || isSubmitting
                }
              >
                <LinearGradient
                  colors={[Colors.cyberLime, "#B8E600"]}
                  style={styles.modalSubmitGradient}
                >
                  <Text style={styles.modalSubmitText}>
                    {isSubmitting
                      ? "Saving..."
                      : goal.targetType === "numeric"
                        ? "Add Progress"
                        : "Add Item"}
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Emoji Picker Modal */}
      <EmojiPicker
        visible={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        onSelect={handleUpdateEmoji}
        selectedEmoji={goal.icon}
      />
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButtonHeader: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fonts.heading,
    color: Colors.textPrimary,
  },
  optionsButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  mainCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.cyberLime,
    marginBottom: Spacing.lg,
  },
  mainCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  glowIcon: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.cyberLimeLight,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.cyberLime,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  glowIconCompleted: {
    backgroundColor: Colors.success,
  },
  editIconBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.cyberLime,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  mainCardInfo: {
    flex: 1,
  },
  goalName: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.fonts.heading,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  goalIconEmoji: {
    fontSize: 28,
  },
  badgeRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  typeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  typeBadgeText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodySemibold,
    textTransform: "uppercase",
  },
  progressSection: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  progressTextRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: Spacing.sm,
  },
  progressValues: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  currentVal: {
    fontSize: Typography.sizes["3xl"],
    fontFamily: Typography.fonts.number,
    color: Colors.textPrimary,
  },
  targetVal: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  progressPercent: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fonts.number,
    color: Colors.cyberLime,
  },
  progressBarBg: {
    height: 12,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: BorderRadius.full,
  },
  actionsBar: {
    marginBottom: Spacing.xl,
  },
  addItemAction: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  addItemGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  addItemText: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.bodySemibold,
    color: Colors.background,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fonts.heading,
    color: Colors.textPrimary,
  },
  countBadge: {
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  countText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodySemibold,
    color: Colors.textSecondary,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    borderStyle: "dashed",
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fonts.heading,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  emptySubtitle: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
  emptyButton: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.cyberLime,
  },
  emptyButtonText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.bodySemibold,
    color: Colors.cyberLime,
  },
  logList: {
    gap: Spacing.md,
  },
  logCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  logLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  logCheckbox: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    borderColor: Colors.borderDefault,
    marginTop: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  logCheckboxActive: {
    backgroundColor: Colors.cyberLime,
    borderColor: Colors.cyberLime,
  },
  logInfo: {
    flex: 1,
  },
  logTitle: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.bodyMedium,
    color: Colors.textPrimary,
  },
  logTitleCompleted: {
    textDecorationLine: "line-through",
    color: Colors.textSecondary,
  },
  logNotes: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.body,
    color: Colors.textMuted,
    marginTop: 2,
  },
  logDate: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.number,
    color: Colors.textMuted,
    marginTop: 6,
  },
  deleteLogBtn: {
    padding: Spacing.sm,
  },
  updateValueBadge: {
    backgroundColor: Colors.cyberLimeLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.cyberLime,
    minWidth: 50,
    alignItems: "center",
  },
  updateValueText: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.number,
    color: Colors.cyberLime,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  errorText: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  backButton: {
    backgroundColor: Colors.cyberLime,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  backButtonText: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.bodySemibold,
    color: Colors.background,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalCloseArea: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius["2xl"],
    borderTopRightRadius: BorderRadius["2xl"],
    padding: Spacing.xl,
    paddingBottom: Spacing["4xl"],
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.borderDefault,
    borderRadius: BorderRadius.full,
    alignSelf: "center",
    marginBottom: Spacing.xl,
  },
  modalTitle: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.fonts.heading,
    color: Colors.textPrimary,
  },
  modalDesc: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
    marginTop: 4,
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
    padding: Spacing.lg,
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.body,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  valueInput: {
    fontSize: Typography.sizes["2xl"],
    fontFamily: Typography.fonts.number,
    textAlign: "center",
    paddingVertical: Spacing.xl,
  },
  modalToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surfaceElevated,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  modalToggleInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  modalToggleLabel: {
    color: Colors.textPrimary,
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.bodySemibold,
  },
  modalToggleDesc: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    marginTop: 2,
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.surfaceHover,
    padding: 2,
  },
  toggleSwitchActive: {
    backgroundColor: Colors.cyberLime,
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.textSecondary,
  },
  toggleKnobActive: {
    transform: [{ translateX: 20 }],
    backgroundColor: Colors.background,
  },
  modalFooter: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  modalCancel: {
    flex: 1,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surfaceElevated,
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.bodySemibold,
    color: Colors.textSecondary,
  },
  modalSubmit: {
    flex: 2,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  modalSubmitGradient: {
    paddingVertical: Spacing.lg,
    alignItems: "center",
  },
  modalSubmitText: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.bodySemibold,
    color: Colors.background,
  },
  modalSubmitDisabled: {
    opacity: 0.5,
  },
});
