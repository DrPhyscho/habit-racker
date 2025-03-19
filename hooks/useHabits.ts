import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit } from '../types/habit';

const HABITS_STORAGE_KEY = '@habits';

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ completedCount: 0, totalCount: 0, streak: 0 });

  const loadHabits = useCallback(async () => {
    try {
      setLoading(true);
      const storedHabits = await AsyncStorage.getItem(HABITS_STORAGE_KEY);
      const parsedHabits = storedHabits ? JSON.parse(storedHabits) : [];
      setHabits(parsedHabits);
    } catch (e) {
      setError('Failed to load habits');
      console.error('Error loading habits:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const addHabit = useCallback(
    async (habitData: Omit<Habit, 'id' | 'createdAt' | 'updatedAt' | 'completedDates'>) => {
      try {
        const now = new Date();
        const newHabit: Habit = {
          ...habitData,
          id: Date.now().toString(),
          createdAt: now.toISOString(), // Store in ISO format (without Z)
          updatedAt: now.toISOString(),
          completedDates: [],
        };

        const updatedHabits = [...habits, newHabit];
        await AsyncStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(updatedHabits));
        setHabits(updatedHabits);
        return true;
      } catch (e) {
        setError('Failed to add habit');
        console.error('Error adding habit:', e);
        return false;
      }
    },
    [habits]
  );

  const completeHabit = useCallback(
    async (id: string) => {
      try {
        const today = new Date();
        const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD
        const scheduledDays = habits.find(h => h.id === id)?.frequency.map(day => day.toLowerCase()) || [];

        let lastScheduledDate = new Date(today);
        while (!scheduledDays.includes(
          lastScheduledDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
        )) {
          lastScheduledDate.setDate(lastScheduledDate.getDate() - 1);
        }
        const scheduledDateString = lastScheduledDate.toISOString().split('T')[0];
        const isLate = todayString !== scheduledDateString;

        const updatedHabits = habits.map((habit) => {
          if (habit.id !== id) return habit;

          const alreadyCompleted = habit.completedDates.some(
            (entry) => entry.completedDate === todayString
          );

          if (alreadyCompleted) {
            return habit;
          }

          return {
            ...habit,
            completedDates: [
              ...habit.completedDates,
              { scheduledDate: scheduledDateString, completedDate: todayString, isLate },
            ],
            updatedAt: today.toISOString(),
          };
        });

        await AsyncStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(updatedHabits));
        setHabits(updatedHabits);
      } catch (e) {
        console.error('Error completing habit:', e);
      }
    },
    [habits]
  );

  const deleteHabit = useCallback(
    async (id: string) => {
      try {
        const updatedHabits = habits.filter((habit) => habit.id !== id);
        await AsyncStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(updatedHabits));
        setHabits(updatedHabits);
      } catch (e) {
        console.error('Error deleting habit:', e);
      }
    },
    [habits]
  );

  const getWeeklyProgress = useCallback(
    () => {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());

      const weekDays = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ];

      return weekDays.map((day, index) => {
        const dayDate = new Date(startOfWeek);
        dayDate.setDate(startOfWeek.getDate() + index);
        const dayString = dayDate.toISOString().split('T')[0];

        const habitsForDay = habits.filter((habit) => habit.frequency.includes(day));
        const completedForDay = habitsForDay.filter((habit) =>
          habit.completedDates.some(
            (entry) => entry.scheduledDate === dayString || entry.completedDate === dayString
          )
        );

        const lateCount = completedForDay.filter((habit) =>
          habit.completedDates.some((entry) => entry.completedDate !== entry.scheduledDate)
        ).length;

        return {
          day,
          progress: habitsForDay.length > 0 ? completedForDay.length / habitsForDay.length : 0,
          lateCompletions: lateCount,
        };
      });
    },
    [habits]
  );

  const calculateStreak = useCallback(() => {
    if (!habits || habits.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let currentStreak = 0;
    let currentDate = new Date(today);

    const allCompletedDates = habits
      .reduce((acc: Date[], habit) => {
        const habitCompletedDates = habit.completedDates.map((c) => {
          const date = new Date(c.completedDate);
          date.setHours(0, 0, 0, 0);
          return date;
        });
        return acc.concat(habitCompletedDates);
      }, [])
      .sort((a, b) => b.getTime() - a.getTime());

    if (allCompletedDates.length === 0) return 0;

    let lastCompletionDate = allCompletedDates[0];

    for (let i = 0; i < allCompletedDates.length; i++) {
      const completionDate = allCompletedDates[i];

      const timeDiff = currentDate.getTime() - completionDate.getTime();
      const diffDays = Math.floor(timeDiff / (1000 * 3600 * 24));

      if (diffDays === 0 || diffDays === 1) {
        currentStreak++;
        currentDate = new Date(completionDate);
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    return currentStreak;
  }, [habits]);

  const updateProgress = useCallback(
    (updatedHabits: Habit[]) => {
      const todayString = new Date().toISOString().split('T')[0];

      const completedCount = updatedHabits
        .filter((habit) =>
          habit.completedDates.some((entry) => entry.completedDate === todayString)
        )
        .length;

      const totalCount = updatedHabits.length;
      const streak = calculateStreak();

      setProgress({ completedCount, totalCount, streak });
    },
    [calculateStreak]
  );

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  useEffect(() => {
    updateProgress(habits);
  }, [habits, updateProgress]);

  return {
    habits,
    addHabit,
    completeHabit,
    deleteHabit,
    loadHabits,
    updateProgress,
    getWeeklyProgress,
    progress,
    loading,
    error,
  };
}
