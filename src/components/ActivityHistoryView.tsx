import React, { useState } from 'react';
import { Calendar as CalendarIcon, List, Search, Filter, Footprints, Flame, Clock, Heart, Edit3, Check, X } from 'lucide-react';
import { DayRecord, UserSettings, MoodType } from '../types';

interface ActivityHistoryViewProps {
  records: DayRecord[];
  settings: UserSettings;
  onUpdateDayRecord: (updated: DayRecord) => void;
  selectedRecordFromParent?: DayRecord | null;
}

export const ActivityHistoryView: React.FC<ActivityHistoryViewProps> = ({
  records,
  settings,
  onUpdateDayRecord,
  selectedRecordFromParent,
}) => {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedRecord, setSelectedRecord] = useState<DayRecord | null>(
    selectedRecordFromParent || records[0] || null
  );
  const [moodFilter, setMoodFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isEditingNote, setIsEditingNote] = useState<boolean>(false);
  const [editNoteText, setEditNoteText] = useState<string>('');

  const moodEmojis: Record<string, string> = {
    restorative: '🛋️ Rest & Restore',
    peaceful: '🌿 Gentle Stroll',
    reflective: '🧘 Mindful Walk',
    focused: '👟 Steady Strides',
    energetic: '⚡ Extra Mile',
    tired: '🌙 Quiet Night',
  };

  // Filtered records
  const filteredRecords = records.filter((r) => {
    if (moodFilter !== 'all' && r.mood !== moodFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchDate = r.date.toLowerCase().includes(q);
      const matchNote = (r.note || '').toLowerCase().includes(q);
      if (!matchDate && !matchNote) return false;
    }
    return true;
  });

  const handleOpenDay = (rec: DayRecord) => {
    setSelectedRecord(rec);
    setEditNoteText(rec.note || '');
    setIsEditingNote(false);
  };

  const handleSaveNote = () => {
    if (!selectedRecord) return;
    const updated: DayRecord = {
      ...selectedRecord,
      note: editNoteText,
    };
    setSelectedRecord(updated);
    onUpdateDayRecord(updated);
    setIsEditingNote(false);
  };

  const handleUpdateRecordMood = (m: MoodType) => {
    if (!selectedRecord) return;
    const updated: DayRecord = {
      ...selectedRecord,
      mood: m,
    };
    setSelectedRecord(updated);
    onUpdateDayRecord(updated);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-teal-500/5 p-4 sm:p-5 rounded-3xl border border-teal-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#3caaa7] uppercase tracking-wider">Activity Vault</span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-medium">{records.length} Recorded Days</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight mt-0.5">
            Full Activity History
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Every step, mood, and walking memory securely stored only on this device.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex bg-white/80 p-1 rounded-2xl border border-teal-200/60 shadow-2xs self-start sm:self-auto">
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              viewMode === 'calendar' ? 'bg-[#3caaa7] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Calendar</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              viewMode === 'list' ? 'bg-[#3caaa7] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>List Log</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-3xl border border-teal-100 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <div className="relative w-full max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by date or note keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-teal-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Mood:
          </span>
          {['all', 'peaceful', 'restorative', 'energetic', 'reflective', 'focused'].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMoodFilter(m)}
              className={`px-2.5 py-1 rounded-xl font-medium transition-all ${
                moodFilter === m
                  ? 'bg-teal-50 text-teal-800 border border-teal-200 font-bold'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {m === 'all' ? 'All Days' : m}
            </button>
          ))}
        </div>
      </div>

      {/* Main Layout: History Grid + Selected Day Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Calendar / List Log */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-3xl border border-teal-100 shadow-2xs">
          {viewMode === 'calendar' ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Walking Journal Grid
                </h3>
                <span className="text-[11px] text-slate-400">Click a day to inspect details</span>
              </div>

              {/* Grid of Days */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredRecords.map((r) => {
                  const isSelected = selectedRecord?.date === r.date;
                  const isTargetReached = r.steps >= r.target;
                  const dateObj = new Date(r.date + 'T12:00:00');

                  return (
                    <div
                      key={r.date}
                      onClick={() => handleOpenDay(r)}
                      className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#3caaa7] bg-teal-50/70 shadow-xs ring-2 ring-teal-300'
                          : 'border-slate-100 hover:border-teal-200 bg-slate-50/40 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">
                          {dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-xs">
                          {r.mood ? moodEmojis[r.mood]?.slice(0, 2) : '🌿'}
                        </span>
                      </div>

                      <div className="my-2">
                        <div className="text-lg font-black text-slate-800 font-mono">
                          {r.steps.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {r.distanceKm} km • {r.calories} kcal
                        </div>
                      </div>

                      <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.min(100, (r.steps / r.target) * 100)}%` }}
                          className={`h-full rounded-full ${
                            isTargetReached ? 'bg-teal-600' : 'bg-teal-300'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* List View */
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {filteredRecords.map((r) => {
                const isSelected = selectedRecord?.date === r.date;
                const isTargetReached = r.steps >= r.target;
                const dateObj = new Date(r.date + 'T12:00:00');

                return (
                  <div
                    key={r.date}
                    onClick={() => handleOpenDay(r)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-[#3caaa7] bg-teal-50/80 shadow-xs'
                        : 'border-slate-100 hover:border-teal-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                          isTargetReached ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {r.mood ? moodEmojis[r.mood]?.slice(0, 2) : '👣'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">
                          {dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">
                          {r.note || 'No note recorded.'}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-black text-slate-800 font-mono">
                        {r.steps.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {r.distanceKm} km • {r.activeMinutes}m
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Selected Day Inspector & Hourly Chart */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-3xl border border-teal-100 shadow-2xs space-y-5">
          {selectedRecord ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-[#3caaa7] uppercase tracking-wider">
                    Day Details
                  </span>
                  <h3 className="text-base font-extrabold text-slate-800">
                    {new Date(selectedRecord.date + 'T12:00:00').toLocaleDateString(undefined, {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </h3>
                </div>
                <div className="text-xl">
                  {selectedRecord.mood ? moodEmojis[selectedRecord.mood]?.slice(0, 2) : '🌿'}
                </div>
              </div>

              {/* Big steps counter */}
              <div className="bg-gradient-to-r from-teal-50 to-emerald-50 p-4 rounded-2xl border border-teal-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-teal-800 font-medium">Steps Taken</span>
                  <div className="text-3xl font-black text-slate-800 font-mono">
                    {selectedRecord.steps.toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 font-medium">Target</span>
                  <div className="text-sm font-bold text-teal-700">
                    {selectedRecord.target.toLocaleString()} steps
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {Math.round((selectedRecord.steps / selectedRecord.target) * 100)}% reached
                  </span>
                </div>
              </div>

              {/* 3 Metric Pills */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 mb-0.5">
                    <Footprints className="w-3 h-3 text-[#3caaa7]" />
                    Distance
                  </div>
                  <span className="text-xs font-bold text-slate-800 font-mono">
                    {settings.unit === 'mi' ? (selectedRecord.distanceKm * 0.621371).toFixed(2) : selectedRecord.distanceKm} {settings.unit}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 mb-0.5">
                    <Flame className="w-3 h-3 text-amber-500" />
                    Calories
                  </div>
                  <span className="text-xs font-bold text-slate-800 font-mono">
                    {selectedRecord.calories} kcal
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 mb-0.5">
                    <Clock className="w-3 h-3 text-indigo-500" />
                    Active Time
                  </div>
                  <span className="text-xs font-bold text-slate-800 font-mono">
                    {selectedRecord.activeMinutes} mins
                  </span>
                </div>
              </div>

              {/* 24-Hour Step Breakdown for Selected Day */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Hourly Step Distribution
                </h4>
                <div className="h-24 flex items-end gap-1 pt-3 pb-1 bg-slate-50/70 p-2 rounded-2xl border border-slate-100">
                  {selectedRecord.hourlySteps.map((steps, hour) => {
                    const maxH = Math.max(1, ...selectedRecord.hourlySteps);
                    const pct = Math.min(100, Math.round((steps / maxH) * 100));
                    return (
                      <div
                        key={hour}
                        className="flex-1 flex flex-col items-center group relative h-full justify-end"
                      >
                        <div className="absolute -top-6 hidden group-hover:flex bg-slate-800 text-white text-[9px] py-0.5 px-1 rounded z-20">
                          {hour}h: {steps}
                        </div>
                        <div
                          style={{ height: `${Math.max(4, pct)}%` }}
                          className={`w-full rounded-t-xs transition-all ${
                            steps > 0 ? 'bg-[#3caaa7]' : 'bg-slate-200'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mood Selector for this Day */}
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1.5">
                  Day's Mood:
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['peaceful', 'restorative', 'energetic', 'reflective', 'focused'] as MoodType[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleUpdateRecordMood(m)}
                      className={`text-[11px] py-1 px-2 rounded-xl border text-center transition-all ${
                        selectedRecord.mood === m
                          ? 'border-[#3caaa7] bg-teal-50 text-teal-900 font-bold'
                          : 'border-slate-200 hover:border-teal-200 text-slate-600'
                      }`}
                    >
                      {moodEmojis[m]?.split(' ')[0]} {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reflection / Walking Diary Note */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-700">Walking Reflection Note</span>
                  {!isEditingNote && (
                    <button
                      onClick={() => {
                        setEditNoteText(selectedRecord.note || '');
                        setIsEditingNote(true);
                      }}
                      className="text-xs text-teal-600 hover:text-teal-800 flex items-center gap-1 font-medium"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                  )}
                </div>

                {isEditingNote ? (
                  <div className="space-y-2">
                    <textarea
                      rows={3}
                      value={editNoteText}
                      onChange={(e) => setEditNoteText(e.target.value)}
                      placeholder="Write your thoughts about this walk..."
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-400"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={handleSaveNote}
                        className="py-1 px-3 bg-[#3caaa7] hover:bg-[#349693] text-white text-xs font-bold rounded-lg flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Save
                      </button>
                      <button
                        onClick={() => setIsEditingNote(false)}
                        className="py-1 px-2.5 bg-slate-100 text-slate-600 text-xs rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed italic">
                    "{selectedRecord.note || 'No notes added for this walk yet.'}"
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Select a date to view activity breakdown.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
