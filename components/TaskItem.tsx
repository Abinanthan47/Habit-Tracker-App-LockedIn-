import type { Task } from '@/types';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Neu Soft-Brutalism Colors
const COLORS = {
  text: '#1F2937',
  textMuted: '#6B7280',
  border: '#1F2937',
  white: '#FFFFFF',
};

const CATEGORY_STYLES: Record<string, { bg: string; icon: keyof typeof Ionicons.glyphMap }> = {
  health: { bg: '#86EFAC', icon: 'heart' },
  work: { bg: '#93C5FD', icon: 'briefcase' },
  personal: { bg: '#FDE047', icon: 'person' },
  learning: { bg: '#C4B5FD', icon: 'book' },
  fitness: { bg: '#FDBA74', icon: 'barbell' },
  mindfulness: { bg: '#F9A8D4', icon: 'leaf' },
};

interface TaskItemProps {
  task: Task;
  isCompleted: boolean;
  streak?: number;
  onToggle: () => void;
  onDelete?: () => void;
}

export function TaskItem({ 
  task, 
  isCompleted, 
  streak = 0, 
  onToggle,
}: TaskItemProps) {
  const scale = useSharedValue(1);
  const checkScale = useSharedValue(isCompleted ? 1 : 0);
  
  React.useEffect(() => {
    checkScale.value = withSpring(isCompleted ? 1 : 0, {
      damping: 12,
      stiffness: 150,
    });
  }, [isCompleted, checkScale]);
  
  const handleToggle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    scale.value = withSequence(
      withTiming(0.92, { duration: 80 }),
      withSpring(1, { damping: 10, stiffness: 300 })
    );
    
    onToggle();
  }, [onToggle, scale]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value,
  }));
  
  const style = CATEGORY_STYLES[task.category] || CATEGORY_STYLES.personal;
  
  return (
    <AnimatedPressable
      onPress={handleToggle}
      style={[
        styles.container, 
        { backgroundColor: isCompleted ? '#E5E7EB' : style.bg },
        animatedStyle
      ]}
    >
      {/* Icon */}
      <View style={styles.iconContainer}>
        <Ionicons name={style.icon} size={20} color={COLORS.text} />
      </View>
      
      {/* Checkbox */}
      <View style={[styles.checkOutline, isCompleted && styles.checkOutlineCompleted]}>
        {isCompleted ? (
          <View style={styles.checkFill}>
            <Ionicons name="checkmark" size={14} color={COLORS.white} />
          </View>
        ) : null}
      </View>
      
      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.name, isCompleted && styles.completedText]} numberOfLines={2}>
          {task.name}
        </Text>
        <View style={styles.metaRow}>
          <Ionicons 
            name={task.timeOfDay === 'morning' ? 'sunny' : task.timeOfDay === 'evening' ? 'moon' : 'time'} 
            size={12} 
            color={isCompleted ? '#9CA3AF' : '#4B5563'} 
          />
          <Text style={[styles.meta, isCompleted && styles.metaCompleted]}>
            {task.timeOfDay.charAt(0).toUpperCase() + task.timeOfDay.slice(1)}
          </Text>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '48%',
    aspectRatio: 0.95,
    borderRadius: 22,
    padding: 14,
    marginBottom: 14,
    justifyContent: 'space-between',
    borderWidth: 2.5,
    borderColor: '#1F2937',
    shadowColor: '#1F2937',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkOutline: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2.5,
    borderColor: 'rgba(31,41,55,0.3)',
    backgroundColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkOutlineCompleted: {
    borderColor: '#1F2937',
    backgroundColor: '#1F2937',
  },
  checkFill: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    marginTop: 'auto',
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    lineHeight: 20,
    marginBottom: 6,
  },
  completedText: {
    color: '#6B7280',
    textDecorationLine: 'line-through',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  meta: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '600',
  },
  metaCompleted: {
    color: '#9CA3AF',
  },
});
