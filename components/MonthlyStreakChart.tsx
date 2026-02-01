import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useApp } from "@/context/AppContext";
import { getDaysInMonth, getMonthName, getToday } from "@/lib/dates";

const DAYS_OF_WEEK = ["M", "T", "W", "T", "F", "S", "S"];

// Neu Soft-Brutalism Colors
const COLORS = {
  bg: "#FFFFFF",
  text: "#1F2937",
  muted: "#9CA3AF",
  border: "#1F2937",
  primary: "#6366F1",
  // Streak levels based on task completion count
  level: {
    0: "#F3F4F6", // None
    1: "#D1FAE5", // 1 task
    2: "#A7F3D0", // 2 tasks
    3: "#6EE7B7", // 3 tasks
    4: "#34D399", // 4 tasks
    5: "#10B981", // 5+ tasks
  },
  cheat: "#FDE047",
};

interface MonthlyStreakChartProps {
  onDayPress?: (date: string) => void;
}

export function MonthlyStreakChart({ onDayPress }: MonthlyStreakChartProps) {
  const { completions, activities, cheatDayConfig } = useApp();

  const [viewDate, setViewDate] = useState(new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const today = getToday(); // Use local timezone

  const calendarData = useMemo(() => {
    const days = getDaysInMonth(year, month);

    // Use activities for completion rates (more accurate)
    const activityMap = new Map<string, { rate: number; count: number }>();
    activities.forEach((a) => {
      activityMap.set(a.date, {
        rate: a.completionRate,
        count: a.tasksCompleted,
      });
    });

    // Also count raw completions as backup
    const completionCounts = new Map<string, number>();
    completions.forEach((c) => {
      // Use the date field, not completedAt
      const date = c.date;
      completionCounts.set(date, (completionCounts.get(date) || 0) + 1);
    });

    const cheatDates = new Set(cheatDayConfig?.usedDates || []);

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const emptyStartSlots = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    const grid = [];
    for (let i = 0; i < emptyStartSlots; i++) {
      grid.push(null);
    }

    for (let i = 1; i <= days; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      const activity = activityMap.get(dateStr);
      const count = activity?.count || completionCounts.get(dateStr) || 0;
      const rate = activity?.rate || 0;
      const isCheat = cheatDates.has(dateStr);
      const isToday = dateStr === today;
      const isFuture = dateStr > today;

      // Determine level based on completion RATE (not count)
      let level = 0;
      if (isCheat) {
        level = -1; // Special for cheat
      } else if (rate >= 100) {
        level = 5;
      } else if (rate >= 80) {
        level = 4;
      } else if (rate >= 60) {
        level = 3;
      } else if (rate >= 40) {
        level = 2;
      } else if (rate > 0) {
        level = 1;
      }

      grid.push({
        day: i,
        date: dateStr,
        level,
        count,
        rate,
        isToday,
        isFuture,
      });
    }

    return grid;
  }, [year, month, completions, activities, cheatDayConfig, today]);

  const changeMonth = (offset: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + offset);
    if (newDate > new Date()) return;
    setViewDate(newDate);
  };

  const getColor = (level: number, isFuture: boolean) => {
    if (isFuture) return "#F9FAFB";
    if (level === -1) return COLORS.cheat;
    return COLORS.level[level as keyof typeof COLORS.level] || COLORS.level[0];
  };

  // Calculate stats for this month
  const stats = useMemo(() => {
    const activeDays = calendarData.filter(
      (d) => d && d.count > 0 && !d.isFuture,
    ).length;
    const totalTasks = calendarData.reduce(
      (sum, d) => sum + (d?.count || 0),
      0,
    );
    const perfectDays = calendarData.filter((d) => d && d.level >= 4).length;
    return { activeDays, totalTasks, perfectDays };
  }, [calendarData]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {getMonthName(month)} {year}
        </Text>
        <View style={styles.navRow}>
          <Pressable onPress={() => changeMonth(-1)} style={styles.navButton}>
            <Ionicons name="chevron-back" size={18} color={COLORS.text} />
          </Pressable>
          <Pressable
            onPress={() => changeMonth(1)}
            style={[
              styles.navButton,
              viewDate.getMonth() === new Date().getMonth() &&
                styles.navDisabled,
            ]}
          >
            <Ionicons name="chevron-forward" size={18} color={COLORS.text} />
          </Pressable>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.activeDays}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalTasks}</Text>
          <Text style={styles.statLabel}>Tasks</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: "#10B981" }]}>
            {stats.perfectDays}
          </Text>
          <Text style={styles.statLabel}>Perfect</Text>
        </View>
      </View>

      {/* Days Labels */}
      <View style={styles.daysRow}>
        {DAYS_OF_WEEK.map((day, i) => (
          <Text key={i} style={styles.dayLabel}>
            {day}
          </Text>
        ))}
      </View>

      {/* Grid */}
      <View style={styles.grid}>
        {calendarData.map((item, index) => (
          <Pressable
            key={index}
            style={[
              styles.cell,
              item && { backgroundColor: getColor(item.level, item.isFuture) },
              item?.isToday && styles.cellToday,
            ]}
            onPress={() => item && !item.isFuture && onDayPress?.(item.date)}
          >
            {item && item.count > 0 && !item.isFuture && (
              <Text style={styles.cellCount}>{item.count}</Text>
            )}
          </Pressable>
        ))}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendLabel}>Less</Text>
        <View
          style={[styles.legendDot, { backgroundColor: COLORS.level[0] }]}
        />
        <View
          style={[styles.legendDot, { backgroundColor: COLORS.level[1] }]}
        />
        <View
          style={[styles.legendDot, { backgroundColor: COLORS.level[3] }]}
        />
        <View
          style={[styles.legendDot, { backgroundColor: COLORS.level[5] }]}
        />
        <Text style={styles.legendLabel}>More</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 2.5,
    borderColor: "#1F2937",
    shadowColor: "#1F2937",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2937",
  },
  navRow: {
    flexDirection: "row",
    gap: 6,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  navDisabled: {
    opacity: 0.3,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2937",
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: "#E5E7EB",
  },
  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  dayLabel: {
    width: 32,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "700",
    color: "#9CA3AF",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },
  cell: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  cellToday: {
    borderWidth: 2,
    borderColor: "#6366F1",
  },
  cellCount: {
    fontSize: 10,
    fontWeight: "700",
    color: "#1F2937",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
    gap: 6,
  },
  legendLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 4,
  },
});
