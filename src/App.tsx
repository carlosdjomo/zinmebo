import React, { useState, useEffect } from 'react';
import { Footprints, Target, Calendar, Sparkles, ShieldCheck, Heart } from 'lucide-react';
import { DayRecord, UserSettings, MoodType } from './types';
import {
  loadRecords,
  saveRecords,
  loadSettings,
  saveSettings,
  getTodayRecord,
  getWeeklyStats,
  formatDate,
  calculateDistanceKm,
  calculateCalories,
  calculateActiveMinutes,
} from './utils/storage';
import { Header } from './components/Header';
import { TodayView } from './components/TodayView';
import { WeeklyView } from './components/WeeklyView';
import { ActivityHistoryView } from './components/ActivityHistoryView';
import { CompanionView } from './components/CompanionView';
import { PrivacyModal } from './components/PrivacyModal';
import { TargetSettingsModal } from './components/TargetSettingsModal';
import { ActiveWalkModal } from './components/ActiveWalkModal';

export default function App() {
  const [records, setRecords] = useState<DayRecord[]>([]);
  const [settings, setSettings] = useState<UserSettings>(loadSettings());
  const [currentTab, setCurrentTab] = useState<'today' | 'weekly' | 'history' | 'companion' | 'privacy'>('today');
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isActiveWalkOpen, setIsActiveWalkOpen] = useState(false);
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<DayRecord | null>(null);

  // Initialize records from local vault
  useEffect(() => {
    const loaded = loadRecords();
    setRecords(loaded);
  }, []);

  const todayRecord = getTodayRecord(records);
  const weeklyStats = getWeeklyStats(records);

  // Update today's steps
  const handleUpdateTodaySteps = (newSteps: number) => {
    const todayStr = formatDate(new Date());
    const distKm = calculateDistanceKm(newSteps, settings.strideLengthM);
    const calories = calculateCalories(newSteps, settings.weightKg);
    const activeMins = calculateActiveMinutes(newSteps);

    const updated = records.map((r) => {
      if (r.date === todayStr) {
        // Also update current hour bucket in hourlySteps
        const currentHour = new Date().getHours();
        const newHourly = [...r.hourlySteps];
        const prevTotal = r.hourlySteps.reduce((a, b) => a + b, 0);
        const diff = newSteps - prevTotal;
        newHourly[currentHour] = Math.max(0, (newHourly[currentHour] || 0) + diff);

        return {
          ...r,
          steps: newSteps,
          distanceKm: distKm,
          calories,
          activeMinutes: activeMins,
          hourlySteps: newHourly,
        };
      }
      return r;
    });

    setRecords(updated);
    saveRecords(updated);
  };

  // Update today's mood
  const handleUpdateTodayMood = (mood: MoodType) => {
    const todayStr = formatDate(new Date());
    const updated = records.map((r) => (r.date === todayStr ? { ...r, mood } : r));
    setRecords(updated);
    saveRecords(updated);
  };

  // Update today's note
  const handleUpdateTodayNote = (note: string) => {
    const todayStr = formatDate(new Date());
    const updated = records.map((r) => (r.date === todayStr ? { ...r, note } : r));
    setRecords(updated);
    saveRecords(updated);
  };

  // Update any historical day record
  const handleUpdateDayRecord = (updatedRecord: DayRecord) => {
    const updated = records.map((r) => (r.date === updatedRecord.date ? updatedRecord : r));
    setRecords(updated);
    saveRecords(updated);
  };

  // Completed an active walking session
  const handleCompleteActiveWalk = (stepsAdded: number, durationMinutes: number) => {
    if (stepsAdded <= 0) return;
    const currentSteps = todayRecord.steps;
    handleUpdateTodaySteps(currentSteps + stepsAdded);
  };

  // Save new settings
  const handleSaveSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Select a day from Weekly chart to inspect in History
  const handleSelectDayFromWeekly = (rec: DayRecord) => {
    setSelectedRecordForDetail(rec);
    setCurrentTab('history');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f3faf9] text-slate-800">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onStartWalk={() => setIsActiveWalkOpen(true)}
        settings={settings}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-5 pb-20 md:pb-10">
        {currentTab === 'today' && (
          <TodayView
            todayRecord={todayRecord}
            settings={settings}
            weeklyAvg={weeklyStats.averageSteps}
            onUpdateSteps={handleUpdateTodaySteps}
            onUpdateMood={handleUpdateTodayMood}
            onUpdateNote={handleUpdateTodayNote}
            onStartWalk={() => setIsActiveWalkOpen(true)}
            onGoToCompanion={() => setCurrentTab('companion')}
          />
        )}

        {currentTab === 'weekly' && (
          <WeeklyView
            records={records}
            settings={settings}
            onOpenTargetSettings={() => setIsSettingsOpen(true)}
            onSelectDay={handleSelectDayFromWeekly}
          />
        )}

        {currentTab === 'history' && (
          <ActivityHistoryView
            records={records}
            settings={settings}
            onUpdateDayRecord={handleUpdateDayRecord}
            selectedRecordFromParent={selectedRecordForDetail}
          />
        )}

        {currentTab === 'companion' && (
          <CompanionView
            todayRecord={todayRecord}
            settings={settings}
            weeklyAvg={weeklyStats.averageSteps}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-teal-100/80 px-2 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setCurrentTab('today')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            currentTab === 'today' ? 'text-[#3caaa7] font-bold' : 'text-slate-400'
          }`}
        >
          <Footprints className="w-5 h-5" />
          <span className="text-[10px]">Today</span>
        </button>

        <button
          onClick={() => setCurrentTab('weekly')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            currentTab === 'weekly' ? 'text-[#3caaa7] font-bold' : 'text-slate-400'
          }`}
        >
          <Target className="w-5 h-5" />
          <span className="text-[10px]">Weekly</span>
        </button>

        <button
          onClick={() => setCurrentTab('history')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            currentTab === 'history' ? 'text-[#3caaa7] font-bold' : 'text-slate-400'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px]">History</span>
        </button>

        <button
          onClick={() => setCurrentTab('companion')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            currentTab === 'companion' ? 'text-[#3caaa7] font-bold' : 'text-slate-400'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px]">Inspiration</span>
        </button>

        <button
          onClick={() => setIsPrivacyOpen(true)}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-slate-400 hover:text-teal-600 transition-all"
        >
          <ShieldCheck className="w-5 h-5" />
          <span className="text-[10px]">Vault</span>
        </button>
      </div>

      {/* Global Modals */}
      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        records={records}
        settings={settings}
        onRecordsImported={(imported) => {
          setRecords(imported);
          saveRecords(imported);
        }}
        onPurge={() => {
          setRecords(loadRecords());
          setSettings(loadSettings());
        }}
      />

      <TargetSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

      <ActiveWalkModal
        isOpen={isActiveWalkOpen}
        onClose={() => setIsActiveWalkOpen(false)}
        onCompleteWalk={handleCompleteActiveWalk}
        settings={settings}
      />

      {/* Footer */}
      <footer className="hidden md:block py-6 border-t border-teal-100/60 bg-white/40 text-center text-xs text-slate-400">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <img
              src="/assets/aistudio/Zinmebo_app_icon_d2f433df.png"
              alt="Zinmebo"
              className="w-5 h-5 rounded-md"
            />
            <span className="font-semibold text-slate-600">Zinmebo</span>
            <span>•</span>
            <span className="italic">walk your way to greatness</span>
          </div>
          <div>
            <span>© 2026 Carlos Djomo, Ph.D - All rights reserved</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
