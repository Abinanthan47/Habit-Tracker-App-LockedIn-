import { useApp } from '@/context/AppContext';
import { getContributionChartDates, getMonthName } from '@/lib/dates';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const CELL_SIZE = 12;
const CELL_GAP = 3;
const CELL_TOTAL = CELL_SIZE + CELL_GAP;
const DAYS_OF_WEEK = ['', 'M', '', 'W', '', 'F', ''];

type StreakLevel = 0 | 1 | 2 | 3 | 4 | 'cheat';

const STREAK_COLORS: Record<StreakLevel, string> = {
  0: '#161B22',
  1: '#0E4429',
  2: '#006D32',
  3: '#26A641',
  4: '#39D353',
  cheat: '#F0883E',
};

interface ContributionChartProps {
  year?: number;
  onDayPress?: (date: string) => void;
}

export function ContributionChart({ year = new Date().getFullYear(), onDayPress }: ContributionChartProps) {
  const { activities, cheatDayConfig } = useApp();
  
  const chartData = useMemo(() => {
    const dates = getContributionChartDates(year);
    const activityMap = new Map(activities.map(a => [a.date, a]));
    const cheatDays = new Set(cheatDayConfig?.usedDates || []);
    
    // Group by week
    const weeks: Map<number, { date: string; level: StreakLevel; dayIndex: number }[]> = new Map();
    
    dates.forEach(({ date, weekIndex, dayIndex }) => {
      const activity = activityMap.get(date);
      const isCheatDay = cheatDays.has(date);
      
      let level: StreakLevel = 0;
      
      if (isCheatDay) {
        level = 'cheat';
      } else if (activity) {
        const rate = activity.completionRate;
        if (rate >= 100) level = 4;
        else if (rate >= 75) level = 3;
        else if (rate >= 50) level = 2;
        else if (rate > 0) level = 1;
      }
      
      if (!weeks.has(weekIndex)) {
        weeks.set(weekIndex, []);
      }
      weeks.get(weekIndex)!.push({ date, level, dayIndex });
    });
    
    return weeks;
  }, [year, activities, cheatDayConfig]);
  
  const monthLabels = useMemo(() => {
    const labels: { month: string; weekIndex: number }[] = [];
    const dates = getContributionChartDates(year);
    let currentMonth = -1;
    
    dates.forEach(({ date, weekIndex }) => {
      const month = new Date(date).getMonth();
      if (month !== currentMonth) {
        currentMonth = month;
        labels.push({ month: getMonthName(month), weekIndex });
      }
    });
    
    return labels;
  }, [year]);
  
  const weeks = Array.from(chartData.entries()).sort((a, b) => a[0] - b[0]);
  
  return (
    <View style={styles.container}>
      {/* Month labels */}
      <View style={styles.monthLabelsContainer}>
        <View style={styles.dayLabelsSpacer} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.monthLabels}>
            {monthLabels.map((label, index) => (
              <Text
                key={index}
                style={[
                  styles.monthLabel,
                  { left: label.weekIndex * CELL_TOTAL }
                ]}
              >
                {label.month}
              </Text>
            ))}
          </View>
        </ScrollView>
      </View>
      
      {/* Grid */}
      <View style={styles.gridContainer}>
        {/* Day labels */}
        <View style={styles.dayLabels}>
          {DAYS_OF_WEEK.map((day, index) => (
            <Text key={index} style={styles.dayLabel}>
              {day}
            </Text>
          ))}
        </View>
        
        {/* Contribution cells */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.weeksContainer}>
            {weeks.map(([weekIndex, days]) => (
              <View key={weekIndex} style={styles.week}>
                {days.map(({ date, level, dayIndex }) => (
                  <Pressable
                    key={date}
                    onPress={() => onDayPress?.(date)}
                    style={[
                      styles.cell,
                      { 
                        backgroundColor: STREAK_COLORS[level],
                        top: dayIndex * CELL_TOTAL,
                      }
                    ]}
                  />
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
      
      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendText}>Less</Text>
        {([0, 1, 2, 3, 4] as const).map((level) => (
          <View
            key={level}
            style={[styles.legendCell, { backgroundColor: STREAK_COLORS[level] }]}
          />
        ))}
        <Text style={styles.legendText}>More</Text>
        <View style={styles.legendSpacer} />
        <View style={[styles.legendCell, { backgroundColor: STREAK_COLORS.cheat }]} />
        <Text style={styles.legendText}>Cheat</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  monthLabelsContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  dayLabelsSpacer: {
    width: 24,
  },
  monthLabels: {
    flexDirection: 'row',
    height: 16,
    position: 'relative',
    width: 53 * CELL_TOTAL, // Max weeks in year
  },
  monthLabel: {
    position: 'absolute',
    color: '#8B949E',
    fontSize: 10,
  },
  gridContainer: {
    flexDirection: 'row',
  },
  dayLabels: {
    width: 24,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  dayLabel: {
    color: '#8B949E',
    fontSize: 10,
    height: CELL_TOTAL,
    textAlignVertical: 'center',
    lineHeight: CELL_TOTAL,
  },
  scrollContent: {
    paddingRight: 16,
  },
  weeksContainer: {
    flexDirection: 'row',
    height: 7 * CELL_TOTAL,
  },
  week: {
    width: CELL_TOTAL,
    height: 7 * CELL_TOTAL,
    position: 'relative',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 2,
    position: 'absolute',
    left: 0,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingRight: 8,
    gap: 4,
  },
  legendText: {
    color: '#8B949E',
    fontSize: 10,
    marginHorizontal: 4,
  },
  legendCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 2,
  },
  legendSpacer: {
    width: 16,
  },
});
