import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { formatDate, getDayName } from "@/lib/dates";

// Neo-Brutalism Vibrant Colors
const COLORS = {
  bg: "#C1FF72",
  pastelGreen: "#C1FF72",
  pastelPink: "#FFB1D8",
  pastelBlue: "#A0D7FF",
  pastelYellow: "#FDFD96",
  pastelPurple: "#C5B4E3",
  white: "#FFFFFF",
  black: "#000000",
  muted: "rgba(0,0,0,0.6)",
};

export default function DayDetailScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const { tasks, getCompletionsForDate, getActivityForDate, cheatDayConfig } =
    useApp();

  if (!date) {
    return (
      <SafeAreaView
        style={styles.container}
        edges={["top", "left", "right", "bottom"]}
      >
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={COLORS.black} />
          <Text style={styles.errorText}>No date provided</Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const completions = getCompletionsForDate(date);
  const activity = getActivityForDate(date);
  const isCheatDay = cheatDayConfig?.usedDates.includes(date);

  const completedTaskIds = new Set(completions.map((c) => c.taskId));
  const tasksForDay = tasks;

  const completedTasks = tasksForDay.filter((t) => completedTaskIds.has(t.id));
  const incompleteTasks = tasksForDay.filter(
    (t) => !completedTaskIds.has(t.id) && completions.length > 0,
  );

  const dateObj = new Date(date);
  const todayStr = formatDate(new Date());
  const isToday = todayStr === date;
  const isPast = dateObj < new Date(todayStr);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.closeButton} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={COLORS.black} />
        </Pressable>
        <Text style={styles.headerTitle}>DAY DETAILS</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Date Header */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.dateCard}>
          <View style={styles.dateContainer}>
            <Text style={styles.dayNumber}>{dateObj.getDate()}</Text>
            <View>
              <Text style={styles.dayName}>{getDayName(dateObj.getDay())}</Text>
              <Text style={styles.monthYear}>
                {dateObj.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </Text>
            </View>
          </View>

          <View style={styles.badgesRow}>
            {isToday && (
              <View style={styles.todayBadge}>
                <Text style={styles.todayBadgeText}>TODAY</Text>
              </View>
            )}

            {isCheatDay && (
              <View style={styles.cheatBadge}>
                <Text style={styles.cheatBadgeText}>🛡️ CHEAT</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Activity Summary */}
        {activity ? (
          <Animated.View
            entering={FadeInDown.delay(200)}
            style={styles.summaryCard}
          >
            <View style={styles.summaryRow}>
              <View style={styles.summaryStat}>
                <Text style={styles.summaryValue}>
                  {activity.completionRate}%
                </Text>
                <Text style={styles.summaryLabel}>COMPLETION</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryStat}>
                <Text style={styles.summaryValue}>
                  {activity.tasksCompleted}
                </Text>
                <Text style={styles.summaryLabel}>COMPLETED</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryStat}>
                <Text style={styles.summaryValue}>{activity.taskTotal}</Text>
                <Text style={styles.summaryLabel}>TOTAL</Text>
              </View>
            </View>

            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${activity.completionRate}%` },
                  isCheatDay && styles.progressFillCheat,
                ]}
              />
            </View>
          </Animated.View>
        ) : (
          <Animated.View
            entering={FadeInDown.delay(200)}
            style={styles.noActivityCard}
          >
            <Text style={styles.noActivityIcon}>📅</Text>
            <Text style={styles.noActivityText}>
              {isPast ? "No activity recorded" : "No data yet"}
            </Text>
            {!isPast && !isToday && (
              <Text style={styles.noActivitySubtext}>
                Complete tasks on this day to see activity
              </Text>
            )}
          </Animated.View>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <Animated.View
            entering={FadeInDown.delay(300)}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>
              ✅ Completed ({completedTasks.length})
            </Text>
            {completedTasks.map((task) => {
              const completion = completions.find((c) => c.taskId === task.id);
              return (
                <View key={task.id} style={styles.taskItem}>
                  <View
                    style={[styles.taskIndicator, styles.completedIndicator]}
                  />
                  <View style={styles.taskContent}>
                    <Text style={styles.taskName}>{task.name}</Text>
                    <Text style={styles.taskMeta}>
                      {task.category} •{" "}
                      {completion?.completedAt
                        ? new Date(completion.completedAt).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "numeric",
                              minute: "2-digit",
                            },
                          )
                        : task.timeOfDay}
                    </Text>
                    {completion?.notes && (
                      <Text style={styles.taskNotes}>{completion.notes}</Text>
                    )}
                  </View>
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={COLORS.pastelGreen}
                  />
                </View>
              );
            })}
          </Animated.View>
        )}

        {/* Incomplete Tasks */}
        {incompleteTasks.length > 0 &&
          activity &&
          activity.completionRate > 0 && (
            <Animated.View
              entering={FadeInDown.delay(400)}
              style={styles.section}
            >
              <Text style={styles.sectionTitle}>
                ❌ Missed ({incompleteTasks.length})
              </Text>
              {incompleteTasks.map((task) => (
                <View
                  key={task.id}
                  style={[styles.taskItem, styles.taskItemMissed]}
                >
                  <View
                    style={[styles.taskIndicator, styles.missedIndicator]}
                  />
                  <View style={styles.taskContent}>
                    <Text style={[styles.taskName, styles.missedTaskName]}>
                      {task.name}
                    </Text>
                    <Text style={styles.taskMeta}>
                      {task.category} • {task.timeOfDay}
                    </Text>
                  </View>
                  <Ionicons
                    name="close-circle"
                    size={24}
                    color={COLORS.pastelPink}
                  />
                </View>
              ))}
            </Animated.View>
          )}
      </ScrollView>

      {/* Footer */}
      <SafeAreaView edges={["bottom"]} style={styles.footerSafeArea}>
        <View style={styles.footer}>
          <Pressable style={styles.doneButton} onPress={() => router.back()}>
            <Text style={styles.doneButtonText}>DONE</Text>
          </Pressable>
        </View>
      </SafeAreaView>
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.black,
  },
  closeButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 3,
    borderColor: COLORS.black,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.black,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.black,
    letterSpacing: 0.5,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.black,
    marginTop: 12,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.black,
    shadowColor: COLORS.black,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.black,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 20,
  },
  dateCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: COLORS.black,
    shadowColor: COLORS.black,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 12,
  },
  dayNumber: {
    fontSize: 52,
    fontWeight: "900",
    color: COLORS.black,
  },
  dayName: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.black,
  },
  monthYear: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.muted,
    marginTop: 2,
  },
  badgesRow: {
    flexDirection: "row",
    gap: 8,
  },
  todayBadge: {
    backgroundColor: COLORS.pastelGreen,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: COLORS.black,
  },
  todayBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: COLORS.black,
  },
  cheatBadge: {
    backgroundColor: COLORS.pastelYellow,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: COLORS.black,
  },
  cheatBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: COLORS.black,
  },
  summaryCard: {
    backgroundColor: COLORS.pastelPurple,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: COLORS.black,
    shadowColor: COLORS.black,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  summaryStat: {
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.black,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.muted,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  summaryDivider: {
    width: 2,
    backgroundColor: COLORS.black,
    opacity: 0.2,
  },
  progressBar: {
    height: 16,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.black,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.pastelGreen,
    borderRadius: 6,
  },
  progressFillCheat: {
    backgroundColor: COLORS.pastelYellow,
  },
  noActivityCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 40,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: COLORS.black,
    borderStyle: "dashed",
    alignItems: "center",
  },
  noActivityIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  noActivityText: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.black,
  },
  noActivitySubtext: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 6,
    textAlign: "center",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.black,
    marginBottom: 12,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: COLORS.black,
    shadowColor: COLORS.black,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  taskItemMissed: {
    backgroundColor: "#FFF0F0",
  },
  taskIndicator: {
    width: 4,
    height: "100%",
    minHeight: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  completedIndicator: {
    backgroundColor: COLORS.pastelGreen,
  },
  missedIndicator: {
    backgroundColor: COLORS.pastelPink,
  },
  taskContent: {
    flex: 1,
  },
  taskName: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.black,
    marginBottom: 3,
  },
  missedTaskName: {
    textDecorationLine: "line-through",
    opacity: 0.7,
  },
  taskMeta: {
    fontSize: 11,
    color: COLORS.muted,
    textTransform: "capitalize",
  },
  taskNotes: {
    fontSize: 12,
    color: COLORS.muted,
    fontStyle: "italic",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  footerSafeArea: {
    backgroundColor: COLORS.bg,
  },
  footer: {
    padding: 20,
    paddingTop: 12,
    borderTopWidth: 3,
    borderTopColor: COLORS.black,
  },
  doneButton: {
    backgroundColor: COLORS.black,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 3,
    borderColor: COLORS.black,
    shadowColor: COLORS.black,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  doneButtonText: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.white,
    letterSpacing: 0.5,
  },
});
