import type { Badge, BadgeRarity } from '@/types';

export const BADGE_DEFINITIONS: Omit<Badge, 'unlockedAt'>[] = [
  // Streak Milestones
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Complete a 7-day streak',
    icon: '🔥',
    rarity: 'common',
    requirement: 'streak:7',
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Complete a 30-day streak',
    icon: '⚡',
    rarity: 'rare',
    requirement: 'streak:30',
  },
  {
    id: 'streak_100',
    name: 'Century Champion',
    description: 'Complete a 100-day streak',
    icon: '💎',
    rarity: 'epic',
    requirement: 'streak:100',
  },
  {
    id: 'streak_365',
    name: 'Year Legend',
    description: 'Complete a 365-day streak',
    icon: '👑',
    rarity: 'legendary',
    requirement: 'streak:365',
  },
  
  // Perfect Periods
  {
    id: 'perfect_week',
    name: 'Perfect Week',
    description: 'Complete all tasks for 7 consecutive days',
    icon: '⭐',
    rarity: 'common',
    requirement: 'perfect:week',
  },
  {
    id: 'perfect_month',
    name: 'Perfect Month',
    description: 'Complete all tasks for a full month',
    icon: '🌟',
    rarity: 'rare',
    requirement: 'perfect:month',
  },
  
  // Task Milestones
  {
    id: 'tasks_10',
    name: 'Getting Started',
    description: 'Complete 10 tasks',
    icon: '🎯',
    rarity: 'common',
    requirement: 'tasks:10',
  },
  {
    id: 'tasks_100',
    name: 'Task Tackler',
    description: 'Complete 100 tasks',
    icon: '🏆',
    rarity: 'rare',
    requirement: 'tasks:100',
  },
  {
    id: 'tasks_500',
    name: 'Productivity Pro',
    description: 'Complete 500 tasks',
    icon: '🚀',
    rarity: 'epic',
    requirement: 'tasks:500',
  },
  {
    id: 'tasks_1000',
    name: 'Task Titan',
    description: 'Complete 1000 tasks',
    icon: '💫',
    rarity: 'legendary',
    requirement: 'tasks:1000',
  },
  
  // Time-based
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete all morning tasks before 8 AM',
    icon: '🌅',
    rarity: 'common',
    requirement: 'time:morning',
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Complete evening tasks consistently',
    icon: '🦉',
    rarity: 'common',
    requirement: 'time:evening',
  },
  
  // Special
  {
    id: 'first_habit',
    name: 'First Step',
    description: 'Create your first habit',
    icon: '👣',
    rarity: 'common',
    requirement: 'habits:1',
  },
  {
    id: 'first_goal',
    name: 'Dreamer',
    description: 'Create your first year goal',
    icon: '🎯',
    rarity: 'common',
    requirement: 'goals:1',
  },
  {
    id: 'comeback',
    name: 'Comeback Kid',
    description: 'Return after missing a week',
    icon: '💪',
    rarity: 'rare',
    requirement: 'special:comeback',
  },
  {
    id: 'no_cheat',
    name: 'Iron Will',
    description: 'Complete a month without using cheat days',
    icon: '🛡️',
    rarity: 'epic',
    requirement: 'special:nocheat',
  },
];

export const BADGE_RARITY_COLORS: Record<BadgeRarity, string> = {
  common: '#6E7681',
  rare: '#58A6FF',
  epic: '#A371F7',
  legendary: '#F0883E',
};

export const LEVEL_TITLES: Record<number, string> = {
  1: 'Beginner',
  2: 'Starter',
  3: 'Apprentice',
  4: 'Habit Builder',
  5: 'Consistent',
  6: 'Dedicated',
  7: 'Committed',
  8: 'Focused',
  9: 'Driven',
  10: 'Achiever',
  11: 'Champion',
  12: 'Master',
  13: 'Expert',
  14: 'Elite',
  15: 'Legend',
  16: 'Mythic',
  17: 'Transcendent',
  18: 'Godlike',
  19: 'Ultimate',
  20: 'Supreme',
};

export function getLevelTitle(level: number): string {
  if (level >= 20) return LEVEL_TITLES[20];
  return LEVEL_TITLES[level] || 'Beginner';
}

export function getPointsForLevel(level: number): number {
  return level * 100;
}

export function getTotalPointsForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += getPointsForLevel(i);
  }
  return total;
}
