import type { Badge } from "@/types";

export const BADGE_DEFINITIONS: Omit<Badge, "unlockedAt">[] = [
  // 🔥 Streak Milestones
  {
    id: "streak_7",
    name: "Streak Mode",
    description: "Lock in a 7-day streak",
    icon: "🔥",
    rarity: "common",
    requirement: "streak:7",
  },
  {
    id: "streak_21",
    name: "Locked In",
    description: "Hold a 21-day streak",
    icon: "⚡",
    rarity: "common",
    requirement: "streak:21",
  },
  {
    id: "streak_30",
    name: "Momentum Beast",
    description: "Crush a 30-day streak",
    icon: "🚀",
    rarity: "rare",
    requirement: "streak:30",
  },
  {
    id: "streak_100",
    name: "Unbreakable",
    description: "Maintain a 100-day streak",
    icon: "💎",
    rarity: "epic",
    requirement: "streak:100",
  },
  {
    id: "streak_365",
    name: "Built Different",
    description: "A full year. No excuses.",
    icon: "👑",
    rarity: "legendary",
    requirement: "streak:365",
  },

  // ⭐ Perfect Periods
  {
    id: "perfect_week",
    name: "Flawless Run",
    description: "Perfect execution for 7 days straight",
    icon: "⭐",
    rarity: "common",
    requirement: "perfect:week",
  },
  {
    id: "perfect_month",
    name: "Zero Misses",
    description: "A flawless month. No slips.",
    icon: "🌟",
    rarity: "rare",
    requirement: "perfect:month",
  },

  // 🎯 Task Milestones
  {
    id: "tasks_10",
    name: "Warm Up",
    description: "Complete 10 tasks",
    icon: "🎯",
    rarity: "common",
    requirement: "tasks:10",
  },
  {
    id: "tasks_100",
    name: "Executioner",
    description: "Complete 100 tasks",
    icon: "🏆",
    rarity: "rare",
    requirement: "tasks:100",
  },
  {
    id: "tasks_500",
    name: "Output Machine",
    description: "500 tasks destroyed",
    icon: "🚀",
    rarity: "epic",
    requirement: "tasks:500",
  },
  {
    id: "tasks_1000",
    name: "Relentless",
    description: "1,000 tasks. No mercy.",
    icon: "💫",
    rarity: "legendary",
    requirement: "tasks:1000",
  },

  // ⏰ Time-based
  {
    id: "early_bird",
    name: "5AM Energy",
    description: "Finish morning tasks before 8 AM",
    icon: "🌅",
    rarity: "common",
    requirement: "time:morning",
  },
  {
    id: "night_owl",
    name: "Midnight Grind",
    description: "Dominate your nights consistently",
    icon: "🦉",
    rarity: "common",
    requirement: "time:evening",
  },

  // 🧩 Special
  {
    id: "first_habit",
    name: "Day Zero",
    description: "Create your first habit",
    icon: "👣",
    rarity: "common",
    requirement: "habits:1",
  },
  {
    id: "first_goal",
    name: "Vision Locked",
    description: "Set your first long-term goal",
    icon: "🎯",
    rarity: "common",
    requirement: "goals:1",
  },
  {
    id: "comeback",
    name: "Bounce Back",
    description: "Fall. Return stronger.",
    icon: "💪",
    rarity: "rare",
    requirement: "special:comeback",
  },
  {
    id: "no_cheat",
    name: "No Mercy",
    description: "A full month. Zero cheat days.",
    icon: "🛡️",
    rarity: "epic",
    requirement: "special:nocheat",
  },
];

// Rarity colors for badge display
export const BADGE_RARITY_COLORS: Record<
  import("@/types").BadgeRarity,
  string
> = {
  common: "#9CA3AF",
  rare: "#60A5FA",
  epic: "#A78BFA",
  legendary: "#FBBF24",
};

// Level titles for profile
export const LEVEL_TITLES: Record<number, string> = {
  1: "Beginner",
  2: "Starter",
  3: "Apprentice",
  4: "Habit Builder",
  5: "Consistent",
  6: "Dedicated",
  7: "Committed",
  8: "Focused",
  9: "Driven",
  10: "Achiever",
  11: "Champion",
  12: "Master",
  13: "Expert",
  14: "Elite",
  15: "Legend",
  16: "Mythic",
  17: "Transcendent",
  18: "Godlike",
  19: "Ultimate",
  20: "Supreme",
};

export function getLevelTitle(level: number): string {
  if (level >= 20) return LEVEL_TITLES[20];
  return LEVEL_TITLES[level] || "Beginner";
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
