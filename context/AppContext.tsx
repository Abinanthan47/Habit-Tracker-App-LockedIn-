import { BADGE_DEFINITIONS } from '@/lib/badges';
import { getToday } from '@/lib/dates';
import * as storage from '@/lib/storage';
import type { Badge, CheatDayConfig, DayActivity, Goal, Task, TaskCompletion, UserProfile } from '@/types';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

interface AppContextType {
  // Data
  profile: UserProfile | null;
  tasks: Task[];
  completions: TaskCompletion[];
  goals: Goal[];
  badges: Badge[];
  cheatDayConfig: CheatDayConfig | null;
  activities: DayActivity[];
  
  // Loading states
  isLoading: boolean;
  
  // Computed values
  currentStreak: number;
  longestStreak: number;
  todayCompletionRate: number;
  
  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'order'>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (taskId: string, notes?: string) => Promise<void>;
  uncompleteTask: (taskId: string) => Promise<void>;
  reorderTasks: (taskIds: string[]) => Promise<void>;
  
  // Goal actions
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => Promise<Goal>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  updateGoalProgress: (id: string, value: number) => Promise<void>;
  
  // Profile actions
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  
  // Cheat day actions
  useCheatDay: () => Promise<boolean>;
  
  // Utility
  refreshData: () => Promise<void>;
  getTasksForToday: () => Task[];
  getCompletionsForDate: (date: string) => TaskCompletion[];
  getActivityForDate: (date: string) => DayActivity | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completions, setCompletions] = useState<TaskCompletion[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [cheatDayConfig, setCheatDayConfig] = useState<CheatDayConfig | null>(null);
  const [activities, setActivities] = useState<DayActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  
  // Calculate today's completion rate
  const todayCompletionRate = React.useMemo(() => {
    const today = getToday();
    const todayActivity = activities.find(a => a.date === today);
    return todayActivity?.completionRate || 0;
  }, [activities]);
  
  // Load all data on mount
  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const [
        loadedProfile,
        loadedTasks,
        loadedCompletions,
        loadedGoals,
        loadedBadges,
        loadedCheatConfig,
        loadedActivities,
        streak,
      ] = await Promise.all([
        storage.getProfile(),
        storage.getTasks(),
        storage.getCompletions(),
        storage.getGoals(),
        storage.getBadges(),
        storage.getCheatDayConfig(),
        storage.getActivities(),
        storage.calculateCurrentStreak(),
      ]);
      
      // Initialize badges if empty
      let finalBadges = loadedBadges;
      if (loadedBadges.length === 0) {
        finalBadges = BADGE_DEFINITIONS.map(b => ({ ...b, unlockedAt: undefined }));
        await storage.saveBadges(finalBadges);
      }
      
      setProfile(loadedProfile);
      setTasks(loadedTasks.sort((a, b) => a.order - b.order));
      setCompletions(loadedCompletions);
      setGoals(loadedGoals);
      setBadges(finalBadges);
      setCheatDayConfig(loadedCheatConfig);
      setActivities(loadedActivities);
      setCurrentStreak(streak);
      
      // Calculate longest streak
      const allStreaks = loadedActivities.reduce((max, _, index) => {
        // Simple calculation - could be optimized
        return Math.max(max, streak);
      }, streak);
      setLongestStreak(Math.max(allStreaks, streak));
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    refreshData();
  }, [refreshData]);
  
  // Update today's activity when completions change
  const updateTodayActivity = useCallback(async () => {
    const today = getToday();
    const todayTasks = getTasksForTodayInternal(tasks);
    const todayCompletions = completions.filter(c => c.date === today);
    
    if (todayTasks.length === 0) return;
    
    const completionRate = Math.round((todayCompletions.length / todayTasks.length) * 100);
    const isCheatDay = cheatDayConfig?.usedDates.includes(today) || false;
    
    const activity: DayActivity = {
      date: today,
      completionRate,
      tasksCompleted: todayCompletions.length,
      taskTotal: todayTasks.length,
      isCheatDay,
    };
    
    await storage.updateDayActivity(activity);
    setActivities(prev => {
      const index = prev.findIndex(a => a.date === today);
      if (index === -1) {
        return [...prev, activity];
      }
      const updated = [...prev];
      updated[index] = activity;
      return updated;
    });
    
    // Update streak
    const streak = await storage.calculateCurrentStreak();
    setCurrentStreak(streak);
    setLongestStreak(prev => Math.max(prev, streak));
  }, [tasks, completions, cheatDayConfig]);
  
  // Helper to get tasks for today based on frequency
  const getTasksForTodayInternal = (taskList: Task[]): Task[] => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    return taskList.filter(task => {
      if (task.frequency === 'daily') return true;
      if (task.frequency === 'custom' && task.customDays) {
        return task.customDays.includes(dayOfWeek);
      }
      if (task.frequency === 'weekly' && task.timesPerWeek) {
        // For weekly tasks, show every day (user can complete x times per week)
        return true;
      }
      return true;
    });
  };
  
  const getTasksForToday = useCallback(() => {
    return getTasksForTodayInternal(tasks);
  }, [tasks]);
  
  const getCompletionsForDate = useCallback((date: string) => {
    return completions.filter(c => c.date === date);
  }, [completions]);
  
  const getActivityForDate = useCallback((date: string) => {
    return activities.find(a => a.date === date);
  }, [activities]);
  
  // Task actions
  const addTask = useCallback(async (task: Omit<Task, 'id' | 'createdAt' | 'order'>) => {
    const newTask = await storage.addTask(task);
    setTasks(prev => [...prev, newTask].sort((a, b) => a.order - b.order));
    
    // Check for first habit badge
    if (tasks.length === 0) {
      const badge = badges.find(b => b.id === 'first_habit');
      if (badge && !badge.unlockedAt) {
        await storage.unlockBadge('first_habit');
        setBadges(prev => prev.map(b => 
          b.id === 'first_habit' ? { ...b, unlockedAt: new Date().toISOString() } : b
        ));
      }
    }
    
    return newTask;
  }, [tasks, badges]);
  
  const updateTaskAction = useCallback(async (id: string, updates: Partial<Task>) => {
    await storage.updateTask(id, updates);
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);
  
  const deleteTaskAction = useCallback(async (id: string) => {
    await storage.deleteTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);
  
  const completeTaskAction = useCallback(async (taskId: string, notes?: string) => {
    const today = getToday();
    const completion = await storage.completeTask(taskId, today, notes);
    setCompletions(prev => [...prev, completion]);
    
    // Award points
    const updatedProfile = await storage.awardPoints(10, currentStreak);
    setProfile(updatedProfile);
    
    // Update activity after state update
    setTimeout(() => updateTodayActivity(), 100);
  }, [currentStreak, updateTodayActivity]);
  
  const uncompleteTaskAction = useCallback(async (taskId: string) => {
    const today = getToday();
    await storage.uncompleteTask(taskId, today);
    setCompletions(prev => prev.filter(c => !(c.taskId === taskId && c.date === today)));
    
    // Update activity after state update
    setTimeout(() => updateTodayActivity(), 100);
  }, [updateTodayActivity]);
  
  const reorderTasksAction = useCallback(async (taskIds: string[]) => {
    await storage.reorderTasks(taskIds);
    setTasks(prev => {
      const reordered = taskIds.map((id, index) => {
        const task = prev.find(t => t.id === id);
        return task ? { ...task, order: index } : null;
      }).filter((t): t is Task => t !== null);
      return reordered;
    });
  }, []);
  
  // Goal actions
  const addGoalAction = useCallback(async (goal: Omit<Goal, 'id' | 'createdAt'>) => {
    const newGoal = await storage.addGoal(goal);
    setGoals(prev => [...prev, newGoal]);
    
    // Check for first goal badge
    if (goals.length === 0) {
      const badge = badges.find(b => b.id === 'first_goal');
      if (badge && !badge.unlockedAt) {
        await storage.unlockBadge('first_goal');
        setBadges(prev => prev.map(b => 
          b.id === 'first_goal' ? { ...b, unlockedAt: new Date().toISOString() } : b
        ));
      }
    }
    
    return newGoal;
  }, [goals, badges]);
  
  const updateGoalAction = useCallback(async (id: string, updates: Partial<Goal>) => {
    await storage.updateGoal(id, updates);
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  }, []);
  
  const deleteGoalAction = useCallback(async (id: string) => {
    await storage.deleteGoal(id);
    setGoals(prev => prev.filter(g => g.id !== id));
  }, []);
  
  const updateGoalProgress = useCallback(async (id: string, value: number) => {
    await storage.updateGoal(id, { currentValue: value });
    setGoals(prev => prev.map(g => g.id === id ? { ...g, currentValue: value } : g));
  }, []);
  
  // Profile actions
  const updateProfileAction = useCallback(async (updates: Partial<UserProfile>) => {
    const updated = await storage.updateProfile(updates);
    setProfile(updated);
  }, []);
  
  // Cheat day actions
  const useCheatDayAction = useCallback(async () => {
    const today = getToday();
    const success = await storage.useCheatDay(today);
    
    if (success) {
      const updatedConfig = await storage.getCheatDayConfig();
      setCheatDayConfig(updatedConfig);
      await updateTodayActivity();
    }
    
    return success;
  }, [updateTodayActivity]);
  
  return (
    <AppContext.Provider
      value={{
        profile,
        tasks,
        completions,
        goals,
        badges,
        cheatDayConfig,
        activities,
        isLoading,
        currentStreak,
        longestStreak,
        todayCompletionRate,
        addTask,
        updateTask: updateTaskAction,
        deleteTask: deleteTaskAction,
        completeTask: completeTaskAction,
        uncompleteTask: uncompleteTaskAction,
        reorderTasks: reorderTasksAction,
        addGoal: addGoalAction,
        updateGoal: updateGoalAction,
        deleteGoal: deleteGoalAction,
        updateGoalProgress,
        updateProfile: updateProfileAction,
        useCheatDay: useCheatDayAction,
        refreshData,
        getTasksForToday,
        getCompletionsForDate,
        getActivityForDate,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
