export type MoodType = 'peaceful' | 'energetic' | 'restorative' | 'tired' | 'reflective' | 'focused';

export interface DayRecord {
  date: string; // YYYY-MM-DD
  steps: number;
  hourlySteps: number[]; // 24 numbers
  distanceKm: number;
  calories: number;
  activeMinutes: number;
  target: number;
  mood?: MoodType;
  note?: string;
}

export interface UserSettings {
  dailyTarget: number;
  weeklyTarget: number;
  unit: 'km' | 'mi';
  strideLengthM: number;
  weightKg: number;
  soundEnabled: boolean;
  autoTrackingEnabled: boolean;
  userName: string;
}

export interface CompanionMessage {
  id: string;
  sender: 'zinmebo' | 'user';
  text: string;
  timestamp: number;
  vibe?: 'restorative' | 'celebratory' | 'encouraging' | 'cozy';
}

export interface MindfulPractice {
  id: string;
  title: string;
  duration: string;
  description: string;
  steps: string[];
}
