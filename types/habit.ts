export interface Habit {
  id: string;
  name: string;
  description: string;
  frequency: string[];
  reminderTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SleepLog {
  id: string;
  date: string;
  duration: number;
  quality: number;
  notes?: string;
}

export interface MeditationSession {
  id: string;
  date: string;
  duration: number;
  type: string;
  notes?: string;
}