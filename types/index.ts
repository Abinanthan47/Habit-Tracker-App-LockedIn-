// Task/Habit Types
export type TimeOfDay = "morning" | "afternoon" | "evening" | "anytime";
export type TaskCategory =
  | "health"
  | "work"
  | "personal"
  | "learning"
  | "fitness"
  | "mindfulness";
export type TaskFrequency = "daily" | "weekly" | "monthly" | "custom";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  name: string;
  category: TaskCategory;
  timeOfDay: TimeOfDay;
  frequency: TaskFrequency;
  priority?: TaskPriority;
  customDays?: number[]; // 0-6 for Sunday-Saturday
  timesPerWeek?: number;
  createdAt: string;
  notes?: string;
  reminderTime?: string;
  linkedGoalId?: string;
  order: number;
}

export interface TaskCompletion {
  id: string;
  taskId: string;
  date: string; // YYYY-MM-DD
  completedAt: string;
  notes?: string;
}

// Goal Types
export interface Milestone {
  id: string;
  title: string;
  targetDate: string;
  targetValue: number;
  currentValue: number;
  isCompleted: boolean;
}

// Goal Item - for tracking individual items (books, podcasts, etc.)
export interface GoalItem {
  id: string;
  goalId: string;
  title: string;
  description?: string;
  completedAt?: string;
  rating?: number; // 1-5 stars
  notes?: string;
  createdAt: string;
}

export interface ProgressUpdate {
  id: string;
  goalId: string;
  value: number;
  notes?: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  year: number;
  icon?: string; // Emoji
  targetType: "numeric" | "items";
  targetValue: number;
  currentValue: number;
  unit?: string;
  milestones: Milestone[];
  linkedTaskIds: string[];
  createdAt: string;
  isArchived: boolean;
  trackItems?: boolean;
  items?: GoalItem[];
  progressUpdates?: ProgressUpdate[];
}

// Badge Types
export type BadgeRarity = "common" | "rare" | "epic" | "legendary";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: BadgeRarity;
  requirement: string;
  unlockedAt?: string;
}

// User Profile Types
export interface UserProfile {
  id: string;
  displayName: string;
  email?: string;
  avatar?: string;
  level: number;
  points: number;
  pointsToNextLevel: number;
  createdAt: string;
  timezone?: string;
}

// Streak Types
export interface DayActivity {
  date: string; // YYYY-MM-DD
  completionRate: number; // 0-100
  tasksCompleted: number;
  taskTotal: number;
  isCheatDay: boolean;
}

// Cheat Day Types
export interface CheatDayConfig {
  maxPerMonth: number;
  usedThisMonth: number;
  lastResetDate: string;
  usedDates: string[];
}

// Statistics Types
export interface Statistics {
  currentStreak: number;
  longestStreak: number;
  totalTasksCompleted: number;
  totalDaysTracked: number;
  successRate: number;
  bestDay: string; // day of week
  bestTime: TimeOfDay;
  bestHabit: string;
  worstHabit: string;
}

// App Data Structure
export interface AppData {
  profile: UserProfile;
  tasks: Task[];
  completions: TaskCompletion[];
  goals: Goal[];
  goalItems: GoalItem[];
  progressUpdates: ProgressUpdate[];
  badges: Badge[];
  cheatDayConfig: CheatDayConfig;
  activities: DayActivity[];
}

// Date utility type
export type DateString = string; // YYYY-MM-DD format
