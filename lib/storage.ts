import type { AppData, Badge, CheatDayConfig, DayActivity, Goal, Task, TaskCompletion, UserProfile } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEYS = {
  PROFILE: '@lockedin_profile',
  TASKS: '@lockedin_tasks',
  COMPLETIONS: '@lockedin_completions',
  GOALS: '@lockedin_goals',
  BADGES: '@lockedin_badges',
  CHEAT_DAYS: '@lockedin_cheat_days',
  ACTIVITIES: '@lockedin_activities',
};

// Default data
const getDefaultProfile = (): UserProfile => ({
  id: uuidv4(),
  displayName: 'Achiever',
  level: 1,
  points: 0,
  pointsToNextLevel: 100,
  createdAt: new Date().toISOString(),
});

const getDefaultCheatDayConfig = (): CheatDayConfig => ({
  maxPerMonth: 4,
  usedThisMonth: 0,
  lastResetDate: new Date().toISOString().split('T')[0],
  usedDates: [],
});

// Generic storage operations
async function getItem<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key}:`, error);
    return defaultValue;
  }
}

async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key}:`, error);
  }
}

// Profile operations
export async function getProfile(): Promise<UserProfile> {
  return getItem(STORAGE_KEYS.PROFILE, getDefaultProfile());
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  await setItem(STORAGE_KEYS.PROFILE, profile);
}

export async function updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
  const profile = await getProfile();
  const updated = { ...profile, ...updates };
  await saveProfile(updated);
  return updated;
}

// Task operations
export async function getTasks(): Promise<Task[]> {
  return getItem(STORAGE_KEYS.TASKS, []);
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  await setItem(STORAGE_KEYS.TASKS, tasks);
}

export async function addTask(task: Omit<Task, 'id' | 'createdAt' | 'order'>): Promise<Task> {
  const tasks = await getTasks();
  const newTask: Task = {
    ...task,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    order: tasks.length,
  };
  await saveTasks([...tasks, newTask]);
  return newTask;
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
  const tasks = await getTasks();
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) return null;
  
  tasks[index] = { ...tasks[index], ...updates };
  await saveTasks(tasks);
  return tasks[index];
}

export async function deleteTask(id: string): Promise<boolean> {
  const tasks = await getTasks();
  const filtered = tasks.filter(t => t.id !== id);
  if (filtered.length === tasks.length) return false;
  
  await saveTasks(filtered);
  return true;
}

export async function reorderTasks(taskIds: string[]): Promise<void> {
  const tasks = await getTasks();
  const reordered = taskIds.map((id, index) => {
    const task = tasks.find(t => t.id === id);
    return task ? { ...task, order: index } : null;
  }).filter((t): t is Task => t !== null);
  
  await saveTasks(reordered);
}

// Completion operations
export async function getCompletions(): Promise<TaskCompletion[]> {
  return getItem(STORAGE_KEYS.COMPLETIONS, []);
}

export async function saveCompletions(completions: TaskCompletion[]): Promise<void> {
  await setItem(STORAGE_KEYS.COMPLETIONS, completions);
}

export async function completeTask(taskId: string, date: string, notes?: string): Promise<TaskCompletion> {
  const completions = await getCompletions();
  const completion: TaskCompletion = {
    id: uuidv4(),
    taskId,
    date,
    completedAt: new Date().toISOString(),
    notes,
  };
  await saveCompletions([...completions, completion]);
  return completion;
}

export async function uncompleteTask(taskId: string, date: string): Promise<boolean> {
  const completions = await getCompletions();
  const filtered = completions.filter(c => !(c.taskId === taskId && c.date === date));
  if (filtered.length === completions.length) return false;
  
  await saveCompletions(filtered);
  return true;
}

export async function getCompletionsForDate(date: string): Promise<TaskCompletion[]> {
  const completions = await getCompletions();
  return completions.filter(c => c.date === date);
}

export async function isTaskCompletedOnDate(taskId: string, date: string): Promise<boolean> {
  const completions = await getCompletions();
  return completions.some(c => c.taskId === taskId && c.date === date);
}

// Goal operations
export async function getGoals(): Promise<Goal[]> {
  return getItem(STORAGE_KEYS.GOALS, []);
}

export async function saveGoals(goals: Goal[]): Promise<void> {
  await setItem(STORAGE_KEYS.GOALS, goals);
}

export async function addGoal(goal: Omit<Goal, 'id' | 'createdAt'>): Promise<Goal> {
  const goals = await getGoals();
  const newGoal: Goal = {
    ...goal,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };
  await saveGoals([...goals, newGoal]);
  return newGoal;
}

export async function updateGoal(id: string, updates: Partial<Goal>): Promise<Goal | null> {
  const goals = await getGoals();
  const index = goals.findIndex(g => g.id === id);
  if (index === -1) return null;
  
  goals[index] = { ...goals[index], ...updates };
  await saveGoals(goals);
  return goals[index];
}

export async function deleteGoal(id: string): Promise<boolean> {
  const goals = await getGoals();
  const filtered = goals.filter(g => g.id !== id);
  if (filtered.length === goals.length) return false;
  
  await saveGoals(filtered);
  return true;
}

// Badge operations
export async function getBadges(): Promise<Badge[]> {
  return getItem(STORAGE_KEYS.BADGES, []);
}

export async function saveBadges(badges: Badge[]): Promise<void> {
  await setItem(STORAGE_KEYS.BADGES, badges);
}

export async function unlockBadge(badgeId: string): Promise<Badge | null> {
  const badges = await getBadges();
  const index = badges.findIndex(b => b.id === badgeId);
  if (index === -1) return null;
  
  badges[index] = { ...badges[index], unlockedAt: new Date().toISOString() };
  await saveBadges(badges);
  return badges[index];
}

// Cheat Day operations
export async function getCheatDayConfig(): Promise<CheatDayConfig> {
  const config = await getItem(STORAGE_KEYS.CHEAT_DAYS, getDefaultCheatDayConfig());
  
  // Reset monthly count if needed
  const now = new Date();
  const lastReset = new Date(config.lastResetDate);
  if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
    config.usedThisMonth = 0;
    config.lastResetDate = now.toISOString().split('T')[0];
    await setItem(STORAGE_KEYS.CHEAT_DAYS, config);
  }
  
  return config;
}

export async function useCheatDay(date: string): Promise<boolean> {
  const config = await getCheatDayConfig();
  
  if (config.usedThisMonth >= config.maxPerMonth) return false;
  
  // Check if used yesterday (no consecutive cheat days)
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  if (config.usedDates.includes(yesterdayStr)) return false;
  
  config.usedThisMonth++;
  config.usedDates.push(date);
  await setItem(STORAGE_KEYS.CHEAT_DAYS, config);
  return true;
}

// Activity operations
export async function getActivities(): Promise<DayActivity[]> {
  return getItem(STORAGE_KEYS.ACTIVITIES, []);
}

export async function saveActivities(activities: DayActivity[]): Promise<void> {
  await setItem(STORAGE_KEYS.ACTIVITIES, activities);
}

export async function updateDayActivity(activity: DayActivity): Promise<void> {
  const activities = await getActivities();
  const index = activities.findIndex(a => a.date === activity.date);
  
  if (index === -1) {
    activities.push(activity);
  } else {
    activities[index] = activity;
  }
  
  await saveActivities(activities);
}

// Points and leveling
const POINTS_PER_TASK = 10;
const STREAK_BONUS_MULTIPLIER = 1.5;
const LEVEL_XP_MULTIPLIER = 100;

export async function awardPoints(basePoints: number, currentStreak: number): Promise<UserProfile> {
  const profile = await getProfile();
  const streakMultiplier = currentStreak >= 7 ? STREAK_BONUS_MULTIPLIER : 1;
  const earnedPoints = Math.floor(basePoints * streakMultiplier);
  
  let newPoints = profile.points + earnedPoints;
  let newLevel = profile.level;
  let newPointsToNext = profile.pointsToNextLevel;
  
  // Level up logic
  while (newPoints >= newPointsToNext) {
    newPoints -= newPointsToNext;
    newLevel++;
    newPointsToNext = newLevel * LEVEL_XP_MULTIPLIER;
  }
  
  const updated = {
    ...profile,
    points: newPoints,
    level: newLevel,
    pointsToNextLevel: newPointsToNext,
  };
  
  await saveProfile(updated);
  return updated;
}

// Streak calculation
export async function calculateCurrentStreak(): Promise<number> {
  const activities = await getActivities();
  const config = await getCheatDayConfig();
  
  if (activities.length === 0) return 0;
  
  // Sort by date descending
  const sorted = [...activities].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  let streak = 0;
  const today = new Date();
  let checkDate = new Date(today.toISOString().split('T')[0]);
  
  for (let i = 0; i < 365; i++) {
    const dateStr = checkDate.toISOString().split('T')[0];
    const activity = sorted.find(a => a.date === dateStr);
    
    if (!activity) {
      // Check if it's a cheat day
      if (config.usedDates.includes(dateStr)) {
        streak++;
      } else {
        break;
      }
    } else if (activity.completionRate >= 50) {
      streak++;
    } else if (config.usedDates.includes(dateStr)) {
      streak++;
    } else {
      break;
    }
    
    checkDate.setDate(checkDate.getDate() - 1);
  }
  
  return streak;
}

// Clear all data (for development/testing)
export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
}

// Export all data
export async function exportAllData(): Promise<AppData> {
  const [profile, tasks, completions, goals, badges, cheatDayConfig, activities] = await Promise.all([
    getProfile(),
    getTasks(),
    getCompletions(),
    getGoals(),
    getBadges(),
    getCheatDayConfig(),
    getActivities(),
  ]);
  
  return { profile, tasks, completions, goals, badges, cheatDayConfig, activities };
}
