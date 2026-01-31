import type { Goal } from '@/types';
import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';

const AnimatedView = Animated.createAnimatedComponent(View);

// Neu Soft-Brutalism Colors
const COLORS = {
  text: '#1F2937',
  muted: '#6B7280',
  primary: '#6366F1',
  border: '#1F2937',
  green: '#86EFAC',
  yellow: '#FDE047',
  pink: '#F9A8D4',
  blue: '#93C5FD',
};

const GOAL_COLORS = [COLORS.yellow, COLORS.green, COLORS.pink, COLORS.blue];

interface GoalCardProps {
  goal: Goal;
  onPress?: () => void;
  onUpdateProgress?: (value: number) => void;
}

export function GoalCard({ goal, onPress, onUpdateProgress }: GoalCardProps) {
  const progressPercent = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
  const progressWidth = useSharedValue(0);
  
  React.useEffect(() => {
    progressWidth.value = withSpring(progressPercent, {
      damping: 20,
      stiffness: 100,
    });
  }, [progressPercent, progressWidth]);
  
  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));
  
  const isCompleted = goal.currentValue >= goal.targetValue;
  const colorIndex = goal.title.length % GOAL_COLORS.length;
  const cardColor = GOAL_COLORS[colorIndex];
  
  return (
    <Pressable onPress={onPress} style={[styles.container, { backgroundColor: cardColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Text style={styles.emoji}>{getGoalEmoji(goal.title)}</Text>
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>{goal.title}</Text>
          <Text style={styles.subtitle}>{goal.unit || 'Progress'}</Text>
        </View>
        {isCompleted && (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          </View>
        )}
      </View>
      
      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <AnimatedView style={[styles.progressFill, progressStyle]} />
        </View>
        <Text style={styles.progressText}>
          {goal.currentValue} / {goal.targetValue}
        </Text>
      </View>

      {/* Actions */}
      {onUpdateProgress && !isCompleted && (
        <View style={styles.actions}>
          <Pressable 
            style={styles.decrementButton}
            onPress={() => onUpdateProgress(Math.max(0, goal.currentValue - 1))}
          >
            <Ionicons name="remove" size={18} color={COLORS.text} />
          </Pressable>
          <Pressable 
            style={styles.incrementButton}
            onPress={() => onUpdateProgress(goal.currentValue + 1)}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      )}
    </Pressable>
  );
}

function getGoalEmoji(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes('read')) return '📚';
  if (lower.includes('workout') || lower.includes('gym')) return '💪';
  if (lower.includes('run')) return '🏃';
  if (lower.includes('code')) return '💻';
  if (lower.includes('money') || lower.includes('save')) return '💰';
  if (lower.includes('meditat')) return '🧘';
  return '🎯';
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 2.5,
    borderColor: '#1F2937',
    shadowColor: '#1F2937',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emoji: {
    fontSize: 22,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '600',
    marginTop: 2,
  },
  completedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    marginBottom: 14,
  },
  progressBar: {
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#1F2937',
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1F2937',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  decrementButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 2,
    borderColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  incrementButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#6366F1',
    borderWidth: 2,
    borderColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
