import { DayRecord, UserSettings } from '../types';

const STORAGE_KEY_RECORDS = 'zinmebo_records_v1';
const STORAGE_KEY_SETTINGS = 'zinmebo_settings_v1';

export const DEFAULT_SETTINGS: UserSettings = {
  dailyTarget: 6000,
  weeklyTarget: 42000,
  unit: 'km',
  strideLengthM: 0.76, // ~76cm average stride
  weightKg: 68,
  soundEnabled: true,
  autoTrackingEnabled: true,
  userName: 'Walker',
};

// Format date as YYYY-MM-DD
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Generate realistic 24-hour step distribution
function generateHourlyDistribution(totalSteps: number): number[] {
  const hours = new Array(24).fill(0);
  if (totalSteps <= 0) return hours;

  // Active hours typically between 7am and 21pm
  const activeWeights = [
    0, 0, 0, 0, 0, 0, // 00-05
    0.02, 0.08, 0.12, 0.08, 0.06, 0.07, // 06-11
    0.10, 0.07, 0.06, 0.08, 0.10, 0.12, // 12-17
    0.09, 0.08, 0.05, 0.03, 0.01, 0 // 18-23
  ];

  let allocated = 0;
  for (let i = 0; i < 24; i++) {
    const raw = Math.round(totalSteps * activeWeights[i]);
    hours[i] = raw;
    allocated += raw;
  }
  // Adjust difference to hour 17 (commute/evening walk)
  hours[17] += (totalSteps - allocated);
  if (hours[17] < 0) hours[17] = 0;
  return hours;
}

export function calculateDistanceKm(steps: number, strideLengthM: number): number {
  return parseFloat(((steps * strideLengthM) / 1000).toFixed(2));
}

export function calculateCalories(steps: number, weightKg: number): number {
  // Approximate standard formula: ~0.04 - 0.05 kcal per step based on body weight
  const factor = (weightKg / 70) * 0.042;
  return Math.round(steps * factor);
}

export function calculateActiveMinutes(steps: number): number {
  // Average comfortable walking cadence is ~100 steps per minute
  return Math.round(steps / 105);
}

// Seed the past 14 days if not present
export function generateSeedData(): DayRecord[] {
  const records: DayRecord[] = [];
  const today = new Date();

  // Varying realistic gentle step counts
  const seedSteps = [
    4320, // Today so far
    6480, // Yesterday (peaceful)
    7200, // 2 days ago (energetic)
    3150, // 3 days ago (restorative / rest day)
    5900, // 4 days ago
    8420, // 5 days ago (extra mile)
    5100, // 6 days ago
    6300, // 7 days ago
    4800, // 8 days ago
    7540, // 9 days ago
    2900, // 10 days ago (rainy gentle rest)
    6890, // 11 days ago
    5400, // 12 days ago
    7120, // 13 days ago
  ];

  const moods: DayRecord['mood'][] = [
    'peaceful',
    'restorative',
    'energetic',
    'tired',
    'reflective',
    'energetic',
    'peaceful',
    'focused',
    'restorative',
    'energetic',
    'peaceful',
    'reflective',
    'peaceful',
    'energetic'
  ];

  const notes = [
    "Today's mindful walk around the park.",
    "Breezy evening stroll under the trees. Felt very grounding.",
    "Walked with a friend after work. Conversation flew by.",
    "Rest day: listened to my body and took it slow with hot chamomile tea.",
    "Gentle morning commute on foot.",
    "Sunny weekend wander through the local market.",
    "Lunch break wander to clear my head.",
    "Listened to a gentle podcast while stepping.",
    "Steady pace around the neighborhood.",
    "Extra mile feeling inspired!",
    "Quiet rainy day, stretched at home.",
    "Post-dinner peaceful stride.",
    "Easy morning walk before work.",
    "Fresh autumn air and vibrant leaves."
  ];

  for (let i = 0; i < seedSteps.length; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = formatDate(d);
    const steps = seedSteps[i];

    records.push({
      date: dateStr,
      steps,
      hourlySteps: generateHourlyDistribution(steps),
      distanceKm: calculateDistanceKm(steps, DEFAULT_SETTINGS.strideLengthM),
      calories: calculateCalories(steps, DEFAULT_SETTINGS.weightKg),
      activeMinutes: calculateActiveMinutes(steps),
      target: DEFAULT_SETTINGS.dailyTarget,
      mood: moods[i],
      note: notes[i]
    });
  }

  return records;
}

export function loadRecords(): DayRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECORDS);
    if (!raw) {
      const seeded = generateSeedData();
      saveRecords(seeded);
      return seeded;
    }
    const parsed: DayRecord[] = JSON.parse(raw);
    const todayStr = formatDate(new Date());
    // Ensure today exists
    if (!parsed.some(r => r.date === todayStr)) {
      parsed.unshift({
        date: todayStr,
        steps: 0,
        hourlySteps: new Array(24).fill(0),
        distanceKm: 0,
        calories: 0,
        activeMinutes: 0,
        target: DEFAULT_SETTINGS.dailyTarget,
        mood: 'peaceful',
        note: 'Starting fresh today.'
      });
      saveRecords(parsed);
    }
    return parsed;
  } catch (e) {
    console.error('Failed to load records from localStorage', e);
    return generateSeedData();
  }
}

export function saveRecords(records: DayRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save records to localStorage', e);
  }
}

export function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings) {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to localStorage', e);
  }
}

export function getTodayRecord(records: DayRecord[]): DayRecord {
  const todayStr = formatDate(new Date());
  const found = records.find(r => r.date === todayStr);
  if (found) return found;

  const newToday: DayRecord = {
    date: todayStr,
    steps: 0,
    hourlySteps: new Array(24).fill(0),
    distanceKm: 0,
    calories: 0,
    activeMinutes: 0,
    target: DEFAULT_SETTINGS.dailyTarget,
    mood: 'peaceful',
  };
  return newToday;
}

// Weekly calculation: past 7 days (including today)
export function getWeeklyStats(records: DayRecord[]) {
  const today = new Date();
  const past7Days: DayRecord[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i)); // Chronological order (6 days ago -> today)
    const dateStr = formatDate(d);
    const rec = records.find(r => r.date === dateStr);
    if (rec) {
      past7Days.push(rec);
    } else {
      past7Days.push({
        date: dateStr,
        steps: 0,
        hourlySteps: new Array(24).fill(0),
        distanceKm: 0,
        calories: 0,
        activeMinutes: 0,
        target: DEFAULT_SETTINGS.dailyTarget,
        mood: 'peaceful'
      });
    }
  }

  const totalSteps = past7Days.reduce((sum, r) => sum + r.steps, 0);
  const totalDistance = past7Days.reduce((sum, r) => sum + r.distanceKm, 0);
  const totalCalories = past7Days.reduce((sum, r) => sum + r.calories, 0);
  const totalActiveMins = past7Days.reduce((sum, r) => sum + r.activeMinutes, 0);

  const averageSteps = Math.round(totalSteps / 7);
  const activeDaysCount = past7Days.filter(r => r.steps > 500).length;
  const bestDay = [...past7Days].sort((a, b) => b.steps - a.steps)[0];

  return {
    past7Days,
    totalSteps,
    averageSteps,
    totalDistance: parseFloat(totalDistance.toFixed(2)),
    totalCalories,
    totalActiveMins,
    activeDaysCount,
    bestDay
  };
}

// Export as JSON file
export function exportToJSON(records: DayRecord[], settings: UserSettings) {
  const data = {
    exportDate: new Date().toISOString(),
    appName: "Zinmebo",
    privacyStatus: "100% On-Device Local Vault",
    settings,
    records
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `zinmebo_backup_${formatDate(new Date())}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Export as CSV file
export function exportToCSV(records: DayRecord[]) {
  const headers = ['Date', 'Steps', 'Target', 'Distance_km', 'Calories_kcal', 'Active_Minutes', 'Mood', 'Note'];
  const rows = records.map(r => [
    r.date,
    r.steps,
    r.target,
    r.distanceKm,
    r.calories,
    r.activeMinutes,
    r.mood || '',
    `"${(r.note || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `zinmebo_activity_${formatDate(new Date())}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// Reset data
export function purgeLocalVault() {
  localStorage.removeItem(STORAGE_KEY_RECORDS);
  localStorage.removeItem(STORAGE_KEY_SETTINGS);
}
