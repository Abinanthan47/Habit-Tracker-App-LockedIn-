/**
 * SQLite Database Module for LockedIn Habit Tracker
 * Provides CRUD operations with proper relational database storage
 */

import type {
  AppData,
  Badge,
  CheatDayConfig,
  DayActivity,
  Goal,
  GoalItem,
  ProgressUpdate,
  Task,
  TaskCompletion,
  UserProfile,
} from "@/types";
import * as SQLite from "expo-sqlite";
import { v4 as uuidv4 } from "uuid";

// Database instance
let db: SQLite.SQLiteDatabase | null = null;
let dbInitPromise: Promise<SQLite.SQLiteDatabase> | null = null;

// Get database instance (opens if not already open)
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  // Return existing database if already initialized
  if (db) {
    return db;
  }

  // If initialization is in progress, wait for it
  if (dbInitPromise) {
    return dbInitPromise;
  }

  // Start initialization
  dbInitPromise = (async () => {
    try {
      const database = await SQLite.openDatabaseAsync("lockedin.db");
      db = database;
      await initializeTables(database);
      return database;
    } catch (error) {
      dbInitPromise = null;
      throw error;
    }
  })();

  return dbInitPromise;
}

// Initialize all tables
async function initializeTables(
  database: SQLite.SQLiteDatabase,
): Promise<void> {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    -- User profile table
    CREATE TABLE IF NOT EXISTS user_profiles (
      id TEXT PRIMARY KEY,
      display_name TEXT NOT NULL,
      email TEXT,
      avatar TEXT,
      level INTEGER DEFAULT 1,
      points INTEGER DEFAULT 0,
      points_to_next_level INTEGER DEFAULT 100,
      created_at TEXT NOT NULL,
      timezone TEXT
    );

    -- Tasks/Habits table
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      time_of_day TEXT NOT NULL,
      frequency TEXT NOT NULL,
      priority TEXT,
      custom_days TEXT,
      times_per_week INTEGER,
      notes TEXT,
      reminder_time TEXT,
      linked_goal_id TEXT,
      task_order INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );

    -- Task completions table
    CREATE TABLE IF NOT EXISTS task_completions (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      date TEXT NOT NULL,
      completed_at TEXT NOT NULL,
      notes TEXT,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );

    -- Goals table
    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      year INTEGER NOT NULL,
      icon TEXT,
      target_type TEXT NOT NULL,
      target_value INTEGER NOT NULL,
      current_value INTEGER DEFAULT 0,
      unit TEXT,
      milestones TEXT,
      linked_task_ids TEXT,
      is_archived INTEGER DEFAULT 0,
      track_items INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    -- Goal items table
    CREATE TABLE IF NOT EXISTS goal_items (
      id TEXT PRIMARY KEY,
      goal_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      completed_at TEXT,
      rating INTEGER,
      notes TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
    );

    -- Progress updates table
    CREATE TABLE IF NOT EXISTS progress_updates (
      id TEXT PRIMARY KEY,
      goal_id TEXT NOT NULL,
      value INTEGER NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
    );

    -- Badges table
    CREATE TABLE IF NOT EXISTS badges (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT NOT NULL,
      rarity TEXT NOT NULL,
      requirement TEXT,
      unlocked_at TEXT
    );

    -- Day activities table (for streaks/heatmap)
    CREATE TABLE IF NOT EXISTS day_activities (
      date TEXT PRIMARY KEY,
      completion_rate INTEGER NOT NULL,
      tasks_completed INTEGER NOT NULL,
      task_total INTEGER NOT NULL,
      is_cheat_day INTEGER DEFAULT 0
    );

    -- Cheat day config table (single row)
    CREATE TABLE IF NOT EXISTS cheat_day_config (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      max_per_month INTEGER DEFAULT 4,
      used_this_month INTEGER DEFAULT 0,
      last_reset_date TEXT NOT NULL,
      used_dates TEXT
    );

    -- Create indexes for better query performance
    CREATE INDEX IF NOT EXISTS idx_task_completions_date ON task_completions(date);
    CREATE INDEX IF NOT EXISTS idx_task_completions_task_id ON task_completions(task_id);
    CREATE INDEX IF NOT EXISTS idx_goal_items_goal_id ON goal_items(goal_id);
    CREATE INDEX IF NOT EXISTS idx_progress_updates_goal_id ON progress_updates(goal_id);
    CREATE INDEX IF NOT EXISTS idx_day_activities_date ON day_activities(date);
  `);

  console.log("[Database] Tables initialized successfully");
}

// ============================================
// PROFILE OPERATIONS
// ============================================

const getDefaultProfile = (): UserProfile => ({
  id: uuidv4(),
  displayName: "Achiever",
  level: 1,
  points: 0,
  pointsToNextLevel: 100,
  createdAt: new Date().toISOString(),
});

export async function getProfile(): Promise<UserProfile> {
  const database = await getDatabase();
  const result = await database.getFirstAsync<{
    id: string;
    display_name: string;
    email: string | null;
    avatar: string | null;
    level: number;
    points: number;
    points_to_next_level: number;
    created_at: string;
    timezone: string | null;
  }>("SELECT * FROM user_profiles LIMIT 1");

  if (!result) {
    const defaultProfile = getDefaultProfile();
    await saveProfile(defaultProfile);
    return defaultProfile;
  }

  return {
    id: result.id,
    displayName: result.display_name,
    email: result.email || undefined,
    avatar: result.avatar || undefined,
    level: result.level,
    points: result.points,
    pointsToNextLevel: result.points_to_next_level,
    createdAt: result.created_at,
    timezone: result.timezone || undefined,
  };
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT OR REPLACE INTO user_profiles 
     (id, display_name, email, avatar, level, points, points_to_next_level, created_at, timezone)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      profile.id,
      profile.displayName,
      profile.email || null,
      profile.avatar || null,
      profile.level,
      profile.points,
      profile.pointsToNextLevel,
      profile.createdAt,
      profile.timezone || null,
    ],
  );
}

export async function updateProfile(
  updates: Partial<UserProfile>,
): Promise<UserProfile> {
  const profile = await getProfile();
  const updated = { ...profile, ...updates };
  await saveProfile(updated);
  return updated;
}

// ============================================
// TASK OPERATIONS
// ============================================

export async function getTasks(): Promise<Task[]> {
  const database = await getDatabase();
  const results = await database.getAllAsync<{
    id: string;
    name: string;
    category: string;
    time_of_day: string;
    frequency: string;
    priority: string | null;
    custom_days: string | null;
    times_per_week: number | null;
    notes: string | null;
    reminder_time: string | null;
    linked_goal_id: string | null;
    task_order: number;
    created_at: string;
  }>("SELECT * FROM tasks ORDER BY task_order ASC");

  return results.map((row) => ({
    id: row.id,
    name: row.name,
    category: row.category as Task["category"],
    timeOfDay: row.time_of_day as Task["timeOfDay"],
    frequency: row.frequency as Task["frequency"],
    priority: (row.priority as Task["priority"]) || undefined,
    customDays: row.custom_days ? JSON.parse(row.custom_days) : undefined,
    timesPerWeek: row.times_per_week || undefined,
    notes: row.notes || undefined,
    reminderTime: row.reminder_time || undefined,
    linkedGoalId: row.linked_goal_id || undefined,
    order: row.task_order,
    createdAt: row.created_at,
  }));
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  const database = await getDatabase();
  await database.runAsync("DELETE FROM tasks");

  for (const task of tasks) {
    await database.runAsync(
      `INSERT INTO tasks 
       (id, name, category, time_of_day, frequency, priority, custom_days, times_per_week, notes, reminder_time, linked_goal_id, task_order, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        task.id,
        task.name,
        task.category,
        task.timeOfDay,
        task.frequency,
        task.priority || null,
        task.customDays ? JSON.stringify(task.customDays) : null,
        task.timesPerWeek || null,
        task.notes || null,
        task.reminderTime || null,
        task.linkedGoalId || null,
        task.order,
        task.createdAt,
      ],
    );
  }
}

export async function addTask(
  task: Omit<Task, "id" | "createdAt" | "order">,
): Promise<Task> {
  const database = await getDatabase();
  const tasks = await getTasks();

  const newTask: Task = {
    ...task,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    order: tasks.length,
  };

  await database.runAsync(
    `INSERT INTO tasks 
     (id, name, category, time_of_day, frequency, priority, custom_days, times_per_week, notes, reminder_time, linked_goal_id, task_order, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      newTask.id,
      newTask.name,
      newTask.category,
      newTask.timeOfDay,
      newTask.frequency,
      newTask.priority || null,
      newTask.customDays ? JSON.stringify(newTask.customDays) : null,
      newTask.timesPerWeek || null,
      newTask.notes || null,
      newTask.reminderTime || null,
      newTask.linkedGoalId || null,
      newTask.order,
      newTask.createdAt,
    ],
  );

  return newTask;
}

export async function updateTask(
  id: string,
  updates: Partial<Task>,
): Promise<Task | null> {
  const tasks = await getTasks();
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return null;

  const updatedTask = { ...tasks[index], ...updates };
  const database = await getDatabase();

  await database.runAsync(
    `UPDATE tasks SET 
     name = ?, category = ?, time_of_day = ?, frequency = ?, priority = ?, 
     custom_days = ?, times_per_week = ?, notes = ?, reminder_time = ?, 
     linked_goal_id = ?, task_order = ?
     WHERE id = ?`,
    [
      updatedTask.name,
      updatedTask.category,
      updatedTask.timeOfDay,
      updatedTask.frequency,
      updatedTask.priority || null,
      updatedTask.customDays ? JSON.stringify(updatedTask.customDays) : null,
      updatedTask.timesPerWeek || null,
      updatedTask.notes || null,
      updatedTask.reminderTime || null,
      updatedTask.linkedGoalId || null,
      updatedTask.order,
      id,
    ],
  );

  return updatedTask;
}

export async function deleteTask(id: string): Promise<boolean> {
  const database = await getDatabase();
  const result = await database.runAsync("DELETE FROM tasks WHERE id = ?", [
    id,
  ]);
  return (result.changes ?? 0) > 0;
}

export async function reorderTasks(taskIds: string[]): Promise<void> {
  const database = await getDatabase();

  for (let i = 0; i < taskIds.length; i++) {
    await database.runAsync("UPDATE tasks SET task_order = ? WHERE id = ?", [
      i,
      taskIds[i],
    ]);
  }
}

// ============================================
// TASK COMPLETION OPERATIONS
// ============================================

export async function getCompletions(): Promise<TaskCompletion[]> {
  const database = await getDatabase();
  const results = await database.getAllAsync<{
    id: string;
    task_id: string;
    date: string;
    completed_at: string;
    notes: string | null;
  }>("SELECT * FROM task_completions ORDER BY completed_at DESC");

  return results.map((row) => ({
    id: row.id,
    taskId: row.task_id,
    date: row.date,
    completedAt: row.completed_at,
    notes: row.notes || undefined,
  }));
}

export async function saveCompletions(
  completions: TaskCompletion[],
): Promise<void> {
  const database = await getDatabase();
  await database.runAsync("DELETE FROM task_completions");

  for (const c of completions) {
    await database.runAsync(
      `INSERT INTO task_completions (id, task_id, date, completed_at, notes) VALUES (?, ?, ?, ?, ?)`,
      [c.id, c.taskId, c.date, c.completedAt, c.notes || null],
    );
  }
}

export async function completeTask(
  taskId: string,
  date: string,
  notes?: string,
): Promise<TaskCompletion> {
  const database = await getDatabase();
  const completion: TaskCompletion = {
    id: uuidv4(),
    taskId,
    date,
    completedAt: new Date().toISOString(),
    notes,
  };

  await database.runAsync(
    `INSERT INTO task_completions (id, task_id, date, completed_at, notes) VALUES (?, ?, ?, ?, ?)`,
    [
      completion.id,
      completion.taskId,
      completion.date,
      completion.completedAt,
      completion.notes || null,
    ],
  );

  return completion;
}

export async function uncompleteTask(
  taskId: string,
  date: string,
): Promise<boolean> {
  const database = await getDatabase();
  const result = await database.runAsync(
    "DELETE FROM task_completions WHERE task_id = ? AND date = ?",
    [taskId, date],
  );
  return (result.changes ?? 0) > 0;
}

export async function getCompletionsForDate(
  date: string,
): Promise<TaskCompletion[]> {
  const database = await getDatabase();
  const results = await database.getAllAsync<{
    id: string;
    task_id: string;
    date: string;
    completed_at: string;
    notes: string | null;
  }>("SELECT * FROM task_completions WHERE date = ?", [date]);

  return results.map((row) => ({
    id: row.id,
    taskId: row.task_id,
    date: row.date,
    completedAt: row.completed_at,
    notes: row.notes || undefined,
  }));
}

export async function isTaskCompletedOnDate(
  taskId: string,
  date: string,
): Promise<boolean> {
  const database = await getDatabase();
  const result = await database.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM task_completions WHERE task_id = ? AND date = ?",
    [taskId, date],
  );
  return (result?.count ?? 0) > 0;
}

// ============================================
// GOAL OPERATIONS
// ============================================

export async function getGoals(): Promise<Goal[]> {
  const database = await getDatabase();
  const results = await database.getAllAsync<{
    id: string;
    title: string;
    description: string | null;
    year: number;
    icon: string | null;
    target_type: string;
    target_value: number;
    current_value: number;
    unit: string | null;
    milestones: string | null;
    linked_task_ids: string | null;
    is_archived: number;
    track_items: number;
    created_at: string;
  }>("SELECT * FROM goals ORDER BY created_at DESC");

  return results.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description || "",
    year: row.year,
    icon: row.icon || undefined,
    targetType: row.target_type as Goal["targetType"],
    targetValue: row.target_value,
    currentValue: row.current_value,
    unit: row.unit || undefined,
    milestones: row.milestones ? JSON.parse(row.milestones) : [],
    linkedTaskIds: row.linked_task_ids ? JSON.parse(row.linked_task_ids) : [],
    isArchived: row.is_archived === 1,
    trackItems: row.track_items === 1,
    createdAt: row.created_at,
  }));
}

export async function saveGoals(goals: Goal[]): Promise<void> {
  const database = await getDatabase();
  await database.runAsync("DELETE FROM goals");

  for (const goal of goals) {
    await database.runAsync(
      `INSERT INTO goals 
       (id, title, description, year, icon, target_type, target_value, current_value, unit, milestones, linked_task_ids, is_archived, track_items, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        goal.id,
        goal.title,
        goal.description,
        goal.year,
        goal.icon || null,
        goal.targetType,
        goal.targetValue,
        goal.currentValue,
        goal.unit || null,
        goal.milestones ? JSON.stringify(goal.milestones) : null,
        goal.linkedTaskIds ? JSON.stringify(goal.linkedTaskIds) : null,
        goal.isArchived ? 1 : 0,
        goal.trackItems ? 1 : 0,
        goal.createdAt,
      ],
    );
  }
}

export async function addGoal(
  goal: Omit<Goal, "id" | "createdAt">,
): Promise<Goal> {
  const database = await getDatabase();
  const newGoal: Goal = {
    ...goal,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };

  await database.runAsync(
    `INSERT INTO goals 
     (id, title, description, year, icon, target_type, target_value, current_value, unit, milestones, linked_task_ids, is_archived, track_items, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      newGoal.id,
      newGoal.title,
      newGoal.description,
      newGoal.year,
      newGoal.icon || null,
      newGoal.targetType,
      newGoal.targetValue,
      newGoal.currentValue,
      newGoal.unit || null,
      newGoal.milestones ? JSON.stringify(newGoal.milestones) : null,
      newGoal.linkedTaskIds ? JSON.stringify(newGoal.linkedTaskIds) : null,
      newGoal.isArchived ? 1 : 0,
      newGoal.trackItems ? 1 : 0,
      newGoal.createdAt,
    ],
  );

  return newGoal;
}

export async function updateGoal(
  id: string,
  updates: Partial<Goal>,
): Promise<Goal | null> {
  const goals = await getGoals();
  const index = goals.findIndex((g) => g.id === id);
  if (index === -1) return null;

  const updatedGoal = { ...goals[index], ...updates };
  const database = await getDatabase();

  await database.runAsync(
    `UPDATE goals SET 
     title = ?, description = ?, year = ?, icon = ?, target_type = ?, target_value = ?, 
     current_value = ?, unit = ?, milestones = ?, linked_task_ids = ?, is_archived = ?, track_items = ?
     WHERE id = ?`,
    [
      updatedGoal.title,
      updatedGoal.description,
      updatedGoal.year,
      updatedGoal.icon || null,
      updatedGoal.targetType,
      updatedGoal.targetValue,
      updatedGoal.currentValue,
      updatedGoal.unit || null,
      updatedGoal.milestones ? JSON.stringify(updatedGoal.milestones) : null,
      updatedGoal.linkedTaskIds
        ? JSON.stringify(updatedGoal.linkedTaskIds)
        : null,
      updatedGoal.isArchived ? 1 : 0,
      updatedGoal.trackItems ? 1 : 0,
      id,
    ],
  );

  return updatedGoal;
}

export async function deleteGoal(id: string): Promise<boolean> {
  const database = await getDatabase();
  // Foreign key cascade will delete goal_items and progress_updates
  const result = await database.runAsync("DELETE FROM goals WHERE id = ?", [
    id,
  ]);
  return (result.changes ?? 0) > 0;
}

// ============================================
// GOAL ITEM OPERATIONS
// ============================================

export async function getGoalItems(): Promise<GoalItem[]> {
  const database = await getDatabase();
  const results = await database.getAllAsync<{
    id: string;
    goal_id: string;
    title: string;
    description: string | null;
    completed_at: string | null;
    rating: number | null;
    notes: string | null;
    created_at: string;
  }>("SELECT * FROM goal_items ORDER BY created_at DESC");

  return results.map((row) => ({
    id: row.id,
    goalId: row.goal_id,
    title: row.title,
    description: row.description || undefined,
    completedAt: row.completed_at || undefined,
    rating: row.rating || undefined,
    notes: row.notes || undefined,
    createdAt: row.created_at,
  }));
}

export async function saveGoalItems(items: GoalItem[]): Promise<void> {
  const database = await getDatabase();
  await database.runAsync("DELETE FROM goal_items");

  for (const item of items) {
    await database.runAsync(
      `INSERT INTO goal_items (id, goal_id, title, description, completed_at, rating, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.id,
        item.goalId,
        item.title,
        item.description || null,
        item.completedAt || null,
        item.rating || null,
        item.notes || null,
        item.createdAt,
      ],
    );
  }
}

export async function addGoalItem(
  item: Omit<GoalItem, "id" | "createdAt">,
): Promise<GoalItem> {
  const database = await getDatabase();
  const newItem: GoalItem = {
    ...item,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };

  await database.runAsync(
    `INSERT INTO goal_items (id, goal_id, title, description, completed_at, rating, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      newItem.id,
      newItem.goalId,
      newItem.title,
      newItem.description || null,
      newItem.completedAt || null,
      newItem.rating || null,
      newItem.notes || null,
      newItem.createdAt,
    ],
  );

  return newItem;
}

export async function updateGoalItem(
  id: string,
  updates: Partial<GoalItem>,
): Promise<GoalItem | null> {
  const items = await getGoalItems();
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) return null;

  const updatedItem = { ...items[index], ...updates };
  const database = await getDatabase();

  await database.runAsync(
    `UPDATE goal_items SET 
     title = ?, description = ?, completed_at = ?, rating = ?, notes = ?
     WHERE id = ?`,
    [
      updatedItem.title,
      updatedItem.description || null,
      updatedItem.completedAt || null,
      updatedItem.rating || null,
      updatedItem.notes || null,
      id,
    ],
  );

  return updatedItem;
}

export async function deleteGoalItem(id: string): Promise<boolean> {
  const database = await getDatabase();
  const result = await database.runAsync(
    "DELETE FROM goal_items WHERE id = ?",
    [id],
  );
  return (result.changes ?? 0) > 0;
}

export async function getGoalItemsForGoal(goalId: string): Promise<GoalItem[]> {
  const database = await getDatabase();
  const results = await database.getAllAsync<{
    id: string;
    goal_id: string;
    title: string;
    description: string | null;
    completed_at: string | null;
    rating: number | null;
    notes: string | null;
    created_at: string;
  }>("SELECT * FROM goal_items WHERE goal_id = ? ORDER BY created_at DESC", [
    goalId,
  ]);

  return results.map((row) => ({
    id: row.id,
    goalId: row.goal_id,
    title: row.title,
    description: row.description || undefined,
    completedAt: row.completed_at || undefined,
    rating: row.rating || undefined,
    notes: row.notes || undefined,
    createdAt: row.created_at,
  }));
}

// ============================================
// PROGRESS UPDATE OPERATIONS
// ============================================

export async function getProgressUpdates(): Promise<ProgressUpdate[]> {
  const database = await getDatabase();
  const results = await database.getAllAsync<{
    id: string;
    goal_id: string;
    value: number;
    notes: string | null;
    created_at: string;
  }>("SELECT * FROM progress_updates ORDER BY created_at DESC");

  return results.map((row) => ({
    id: row.id,
    goalId: row.goal_id,
    value: row.value,
    notes: row.notes || undefined,
    createdAt: row.created_at,
  }));
}

export async function saveProgressUpdates(
  updates: ProgressUpdate[],
): Promise<void> {
  const database = await getDatabase();
  await database.runAsync("DELETE FROM progress_updates");

  for (const update of updates) {
    await database.runAsync(
      `INSERT INTO progress_updates (id, goal_id, value, notes, created_at) VALUES (?, ?, ?, ?, ?)`,
      [
        update.id,
        update.goalId,
        update.value,
        update.notes || null,
        update.createdAt,
      ],
    );
  }
}

export async function addProgressUpdate(
  update: Omit<ProgressUpdate, "id" | "createdAt">,
): Promise<ProgressUpdate> {
  const database = await getDatabase();
  const newUpdate: ProgressUpdate = {
    ...update,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };

  await database.runAsync(
    `INSERT INTO progress_updates (id, goal_id, value, notes, created_at) VALUES (?, ?, ?, ?, ?)`,
    [
      newUpdate.id,
      newUpdate.goalId,
      newUpdate.value,
      newUpdate.notes || null,
      newUpdate.createdAt,
    ],
  );

  return newUpdate;
}

export async function deleteProgressUpdate(id: string): Promise<boolean> {
  const database = await getDatabase();
  const result = await database.runAsync(
    "DELETE FROM progress_updates WHERE id = ?",
    [id],
  );
  return (result.changes ?? 0) > 0;
}

export async function getProgressUpdatesForGoal(
  goalId: string,
): Promise<ProgressUpdate[]> {
  const database = await getDatabase();
  const results = await database.getAllAsync<{
    id: string;
    goal_id: string;
    value: number;
    notes: string | null;
    created_at: string;
  }>(
    "SELECT * FROM progress_updates WHERE goal_id = ? ORDER BY created_at DESC",
    [goalId],
  );

  return results.map((row) => ({
    id: row.id,
    goalId: row.goal_id,
    value: row.value,
    notes: row.notes || undefined,
    createdAt: row.created_at,
  }));
}

// ============================================
// BADGE OPERATIONS
// ============================================

export async function getBadges(): Promise<Badge[]> {
  const database = await getDatabase();
  const results = await database.getAllAsync<{
    id: string;
    name: string;
    description: string | null;
    icon: string;
    rarity: string;
    requirement: string | null;
    unlocked_at: string | null;
  }>("SELECT * FROM badges");

  return results.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description || "",
    icon: row.icon,
    rarity: row.rarity as Badge["rarity"],
    requirement: row.requirement || "",
    unlockedAt: row.unlocked_at || undefined,
  }));
}

export async function saveBadges(badges: Badge[]): Promise<void> {
  const database = await getDatabase();
  await database.runAsync("DELETE FROM badges");

  for (const badge of badges) {
    await database.runAsync(
      `INSERT INTO badges (id, name, description, icon, rarity, requirement, unlocked_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        badge.id,
        badge.name,
        badge.description,
        badge.icon,
        badge.rarity,
        badge.requirement,
        badge.unlockedAt || null,
      ],
    );
  }
}

export async function unlockBadge(badgeId: string): Promise<Badge | null> {
  const database = await getDatabase();
  const unlockedAt = new Date().toISOString();

  await database.runAsync("UPDATE badges SET unlocked_at = ? WHERE id = ?", [
    unlockedAt,
    badgeId,
  ]);

  const result = await database.getFirstAsync<{
    id: string;
    name: string;
    description: string | null;
    icon: string;
    rarity: string;
    requirement: string | null;
    unlocked_at: string | null;
  }>("SELECT * FROM badges WHERE id = ?", [badgeId]);

  if (!result) return null;

  return {
    id: result.id,
    name: result.name,
    description: result.description || "",
    icon: result.icon,
    rarity: result.rarity as Badge["rarity"],
    requirement: result.requirement || "",
    unlockedAt: result.unlocked_at || undefined,
  };
}

// ============================================
// CHEAT DAY OPERATIONS
// ============================================

const getDefaultCheatDayConfig = (): CheatDayConfig => ({
  maxPerMonth: 4,
  usedThisMonth: 0,
  lastResetDate: new Date().toISOString().split("T")[0],
  usedDates: [],
});

export async function getCheatDayConfig(): Promise<CheatDayConfig> {
  const database = await getDatabase();
  const result = await database.getFirstAsync<{
    id: number;
    max_per_month: number;
    used_this_month: number;
    last_reset_date: string;
    used_dates: string | null;
  }>("SELECT * FROM cheat_day_config WHERE id = 1");

  if (!result) {
    const defaultConfig = getDefaultCheatDayConfig();
    await saveCheatDayConfig(defaultConfig);
    return defaultConfig;
  }

  const config: CheatDayConfig = {
    maxPerMonth: result.max_per_month,
    usedThisMonth: result.used_this_month,
    lastResetDate: result.last_reset_date,
    usedDates: result.used_dates ? JSON.parse(result.used_dates) : [],
  };

  // Reset monthly count if needed
  const now = new Date();
  const lastReset = new Date(config.lastResetDate);
  if (
    now.getMonth() !== lastReset.getMonth() ||
    now.getFullYear() !== lastReset.getFullYear()
  ) {
    config.usedThisMonth = 0;
    config.lastResetDate = now.toISOString().split("T")[0];
    await saveCheatDayConfig(config);
  }

  return config;
}

export async function saveCheatDayConfig(
  config: CheatDayConfig,
): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT OR REPLACE INTO cheat_day_config (id, max_per_month, used_this_month, last_reset_date, used_dates)
     VALUES (1, ?, ?, ?, ?)`,
    [
      config.maxPerMonth,
      config.usedThisMonth,
      config.lastResetDate,
      JSON.stringify(config.usedDates),
    ],
  );
}

export async function useCheatDay(date: string): Promise<boolean> {
  const config = await getCheatDayConfig();

  if (config.usedThisMonth >= config.maxPerMonth) return false;

  // Check if used yesterday (no consecutive cheat days)
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];
  if (config.usedDates.includes(yesterdayStr)) return false;

  config.usedThisMonth++;
  config.usedDates.push(date);
  await saveCheatDayConfig(config);
  return true;
}

// ============================================
// ACTIVITY OPERATIONS
// ============================================

export async function getActivities(): Promise<DayActivity[]> {
  const database = await getDatabase();
  const results = await database.getAllAsync<{
    date: string;
    completion_rate: number;
    tasks_completed: number;
    task_total: number;
    is_cheat_day: number;
  }>("SELECT * FROM day_activities ORDER BY date DESC");

  return results.map((row) => ({
    date: row.date,
    completionRate: row.completion_rate,
    tasksCompleted: row.tasks_completed,
    taskTotal: row.task_total,
    isCheatDay: row.is_cheat_day === 1,
  }));
}

export async function saveActivities(activities: DayActivity[]): Promise<void> {
  const database = await getDatabase();
  await database.runAsync("DELETE FROM day_activities");

  for (const activity of activities) {
    await database.runAsync(
      `INSERT INTO day_activities (date, completion_rate, tasks_completed, task_total, is_cheat_day)
       VALUES (?, ?, ?, ?, ?)`,
      [
        activity.date,
        activity.completionRate,
        activity.tasksCompleted,
        activity.taskTotal,
        activity.isCheatDay ? 1 : 0,
      ],
    );
  }
}

export async function updateDayActivity(activity: DayActivity): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT OR REPLACE INTO day_activities (date, completion_rate, tasks_completed, task_total, is_cheat_day)
     VALUES (?, ?, ?, ?, ?)`,
    [
      activity.date,
      activity.completionRate,
      activity.tasksCompleted,
      activity.taskTotal,
      activity.isCheatDay ? 1 : 0,
    ],
  );
}

// ============================================
// POINTS AND LEVELING
// ============================================

const STREAK_BONUS_MULTIPLIER = 1.5;
const LEVEL_XP_MULTIPLIER = 100;

export async function awardPoints(
  basePoints: number,
  currentStreak: number,
): Promise<UserProfile> {
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

// ============================================
// STREAK CALCULATION
// ============================================

export async function calculateCurrentStreak(): Promise<number> {
  const activities = await getActivities();
  const config = await getCheatDayConfig();

  if (activities.length === 0) return 0;

  // Sort by date descending
  const sorted = [...activities].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  let streak = 0;
  const today = new Date();
  let checkDate = new Date(today.toISOString().split("T")[0]);

  for (let i = 0; i < 365; i++) {
    const dateStr = checkDate.toISOString().split("T")[0];
    const activity = sorted.find((a) => a.date === dateStr);

    if (!activity) {
      // Check if it's a cheat day
      if (config.usedDates.includes(dateStr)) {
        streak++;
      } else if (i === 0) {
        // First day (today) - allow no activity yet
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      } else {
        break;
      }
    } else if (activity.completionRate >= 50) {
      streak++;
    } else if (config.usedDates.includes(dateStr)) {
      streak++;
    } else if (i === 0) {
      // Today with low completion - still count previous days
      checkDate.setDate(checkDate.getDate() - 1);
      continue;
    } else {
      break;
    }

    checkDate.setDate(checkDate.getDate() - 1);
  }

  return streak;
}

// ============================================
// DATA EXPORT/IMPORT/CLEAR
// ============================================

export async function clearAllData(): Promise<void> {
  const database = await getDatabase();
  await database.execAsync(`
    DELETE FROM task_completions;
    DELETE FROM goal_items;
    DELETE FROM progress_updates;
    DELETE FROM tasks;
    DELETE FROM goals;
    DELETE FROM badges;
    DELETE FROM day_activities;
    DELETE FROM cheat_day_config;
    DELETE FROM user_profiles;
  `);
}

export async function exportAllData(): Promise<AppData> {
  const [
    profile,
    tasks,
    completions,
    goals,
    goalItems,
    progressUpdates,
    badges,
    cheatDayConfig,
    activities,
  ] = await Promise.all([
    getProfile(),
    getTasks(),
    getCompletions(),
    getGoals(),
    getGoalItems(),
    getProgressUpdates(),
    getBadges(),
    getCheatDayConfig(),
    getActivities(),
  ]);

  return {
    profile,
    tasks,
    completions,
    goals,
    goalItems,
    progressUpdates,
    badges,
    cheatDayConfig,
    activities,
  };
}

export async function importAllData(
  data: Partial<AppData & { progressUpdates: ProgressUpdate[] }>,
): Promise<void> {
  if (data.profile) await saveProfile(data.profile);
  if (data.tasks) await saveTasks(data.tasks);
  if (data.completions) await saveCompletions(data.completions);
  if (data.goals) await saveGoals(data.goals);
  if (data.goalItems) await saveGoalItems(data.goalItems);
  if (data.progressUpdates) await saveProgressUpdates(data.progressUpdates);
  if (data.badges) await saveBadges(data.badges);
  if (data.cheatDayConfig) await saveCheatDayConfig(data.cheatDayConfig);
  if (data.activities) await saveActivities(data.activities);
}

// ============================================
// MIGRATION FROM ASYNC STORAGE
// ============================================

export async function migrateFromAsyncStorage(): Promise<boolean> {
  try {
    // Dynamic import to avoid bundling AsyncStorage if not needed
    const AsyncStorage = (
      await import("@react-native-async-storage/async-storage")
    ).default;

    const STORAGE_KEYS = {
      PROFILE: "@lockedin_profile",
      TASKS: "@lockedin_tasks",
      COMPLETIONS: "@lockedin_completions",
      GOALS: "@lockedin_goals",
      GOAL_ITEMS: "@lockedin_goal_items",
      PROGRESS_UPDATES: "@lockedin_progress_updates",
      BADGES: "@lockedin_badges",
      CHEAT_DAYS: "@lockedin_cheat_days",
      ACTIVITIES: "@lockedin_activities",
      MIGRATED: "@lockedin_migrated_to_sqlite",
    };

    // Check if already migrated
    const migrated = await AsyncStorage.getItem(STORAGE_KEYS.MIGRATED);
    if (migrated === "true") {
      console.log("[Migration] Already migrated to SQLite");
      return false;
    }

    console.log("[Migration] Starting migration from AsyncStorage to SQLite");

    // Load all data from AsyncStorage
    const profileData = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE);
    const tasksData = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
    const completionsData = await AsyncStorage.getItem(
      STORAGE_KEYS.COMPLETIONS,
    );
    const goalsData = await AsyncStorage.getItem(STORAGE_KEYS.GOALS);
    const goalItemsData = await AsyncStorage.getItem(STORAGE_KEYS.GOAL_ITEMS);
    const progressUpdatesData = await AsyncStorage.getItem(
      STORAGE_KEYS.PROGRESS_UPDATES,
    );
    const badgesData = await AsyncStorage.getItem(STORAGE_KEYS.BADGES);
    const cheatDaysData = await AsyncStorage.getItem(STORAGE_KEYS.CHEAT_DAYS);
    const activitiesData = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVITIES);

    // Import into SQLite
    if (profileData) {
      await saveProfile(JSON.parse(profileData));
      console.log("[Migration] Profile migrated");
    }

    if (tasksData) {
      await saveTasks(JSON.parse(tasksData));
      console.log("[Migration] Tasks migrated");
    }

    if (completionsData) {
      await saveCompletions(JSON.parse(completionsData));
      console.log("[Migration] Completions migrated");
    }

    if (goalsData) {
      await saveGoals(JSON.parse(goalsData));
      console.log("[Migration] Goals migrated");
    }

    if (goalItemsData) {
      await saveGoalItems(JSON.parse(goalItemsData));
      console.log("[Migration] Goal items migrated");
    }

    if (progressUpdatesData) {
      await saveProgressUpdates(JSON.parse(progressUpdatesData));
      console.log("[Migration] Progress updates migrated");
    }

    if (badgesData) {
      await saveBadges(JSON.parse(badgesData));
      console.log("[Migration] Badges migrated");
    }

    if (cheatDaysData) {
      await saveCheatDayConfig(JSON.parse(cheatDaysData));
      console.log("[Migration] Cheat day config migrated");
    }

    if (activitiesData) {
      await saveActivities(JSON.parse(activitiesData));
      console.log("[Migration] Activities migrated");
    }

    // Mark as migrated
    await AsyncStorage.setItem(STORAGE_KEYS.MIGRATED, "true");
    console.log("[Migration] Migration complete!");

    return true;
  } catch (error) {
    console.error("[Migration] Error migrating from AsyncStorage:", error);
    return false;
  }
}
