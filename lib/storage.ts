/**
 * Storage Layer for LockedIn Habit Tracker
 *
 * This module re-exports all database operations from database.ts
 * The API remains identical to the previous AsyncStorage implementation
 * so that AppContext.tsx requires no changes.
 *
 * Migration from AsyncStorage to SQLite is handled automatically
 * on first load via the migrateFromAsyncStorage function.
 */

// Re-export all database functions - maintains the same API
export {
  addGoal,
  addGoalItem,
  addProgressUpdate,
  addTask,
  // Points and leveling
  awardPoints,

  // Streak calculation
  calculateCurrentStreak,

  // Data management
  clearAllData,
  completeTask,
  deleteGoal,
  deleteGoalItem,
  deleteProgressUpdate,
  deleteTask,
  exportAllData,
  // Activity operations
  getActivities,
  // Badge operations
  getBadges,
  // Cheat Day operations
  getCheatDayConfig,
  // Completion operations
  getCompletions,
  getCompletionsForDate,
  // Database access
  getDatabase,
  // Goal Item operations
  getGoalItems,
  getGoalItemsForGoal,
  // Goal operations
  getGoals,
  // Profile operations
  getProfile,
  // Progress Update operations
  getProgressUpdates,
  getProgressUpdatesForGoal,
  // Task operations
  getTasks,
  importAllData,
  isTaskCompletedOnDate,
  // Migration
  migrateFromAsyncStorage,
  reorderTasks,
  saveActivities,
  saveBadges,
  saveCompletions,
  saveGoalItems,
  saveGoals,
  saveProfile,
  saveProgressUpdates,
  saveTasks,
  uncompleteTask,
  unlockBadge,
  updateDayActivity,
  updateGoal,
  updateGoalItem,
  updateProfile,
  updateTask,
  useCheatDay,
} from "./database";
