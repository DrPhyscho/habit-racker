import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit } from '../types/habit';

const HABITS_STORAGE_KEY = '@habits';

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ completedCount: 0, totalCount: 0, streak: 0 });

  useEffect(() => {
    loadHabits();
  }, []);

  useEffect(() => {
    updateProgress(habits);
  }, [habits]);

  const loadHabits = async () => {
    try {
      setLoading(true);
      const storedHabits = await AsyncStorage.getItem(HABITS_STORAGE_KEY);
      const parsedHabits = storedHabits ? JSON.parse(storedHabits) : [];
      setHabits(parsedHabits);
      updateProgress(parsedHabits);
    } catch (e) {
      setError('Failed to load habits');
      console.error('Error loading habits:', e);
    } finally {
      setLoading(false);
    }
  };

  const addHabit = async (habitData: Omit<Habit, 'id' | 'createdAt' | 'updatedAt' | 'completedDates'>) => {
    try {
      const newHabit: Habit = {
        ...habitData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedDates: [],
      };

      const updatedHabits = [...habits, newHabit];
      await AsyncStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(updatedHabits));
      setHabits(updatedHabits);
      updateProgress(updatedHabits);
      return true;
    } catch (e) {
      setError('Failed to add habit');
      console.error('Error adding habit:', e);
      return false;
    }
  };

  const completeHabit = async (id: string) => {
    try {
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];

      const updatedHabits = habits.map(habit => {
        if (habit.id !== id) return habit;

        // ✅ Get the scheduled days for this habit
        const scheduledDays = habit.frequency.map(day => day.toLowerCase());
        const currentDay = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

        // ✅ Find the most recent scheduled day before today
        let lastScheduledDate = new Date(today);
        while (!scheduledDays.includes(lastScheduledDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase())) {
          lastScheduledDate.setDate(lastScheduledDate.getDate() - 1);
        }
        const scheduledDateString = lastScheduledDate.toISOString().split('T')[0];

        // ✅ Mark as late if the habit was done after the scheduled date
        const isLate = scheduledDateString !== todayString;

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
      updateProgress(updatedHabits);
    } catch (e) {
      console.error('Error completing habit:', e);
    }
  };

  const deleteHabit = async (id: string) => {
    try {
      const updatedHabits = habits.filter(habit => habit.id !== id);
      await AsyncStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(updatedHabits));
      setHabits(updatedHabits);
      updateProgress(updatedHabits);
    } catch (e) {
      console.error('Error deleting habit:', e);
    }
  };

  const updateProgress = (updatedHabits: Habit[]) => {
    const todayString = new Date().toISOString().split('T')[0];

    const completedCount = updatedHabits.filter(habit =>
      habit.completedDates.some(entry => entry.completedDate === todayString)
    ).length;

    const totalCount = updatedHabits.length;
    const streak = completedCount > 0 ? (progress.streak || 0) + 1 : 0;

    setProgress({ completedCount, totalCount, streak });
  };

  const getWeeklyProgress = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start of the week (Sunday)

    const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return weekDays.map((day, index) => {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + index);
      const dayString = dayDate.toISOString().split('T')[0];

      const habitsForDay = habits.filter(habit => habit.frequency.includes(day));
      const completedForDay = habitsForDay.filter(habit =>
        habit.completedDates.some(entry => entry.scheduledDate === dayString || entry.completedDate === dayString)
      );

      const lateCount = completedForDay.filter(habit =>
        habit.completedDates.some(entry => entry.completedDate !== entry.scheduledDate)
      ).length;

      return {
        day,
        progress: habitsForDay.length > 0 ? completedForDay.length / habitsForDay.length : 0,
        lateCompletions: lateCount,
      };
    });
  };

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
