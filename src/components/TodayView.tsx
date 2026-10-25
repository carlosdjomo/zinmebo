import React, { useState, useEffect } from 'react';
import { Footprints, Flame, Clock, Sparkles, RefreshCw, Volume2, Plus, Heart, ChevronRight, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DayRecord, UserSettings, MoodType } from '../types';
import { calculateDistanceKm, calculateCalories, calculateActiveMinutes } from '../utils/storage';
import { sounds } from '../utils/audio';

import { InspirationalQuote, getRandomQuote } from '../data/quotes';

interface TodayViewProps {
  todayRecord: DayRecord;
  settings: UserSettings;
  weeklyAvg: number;
  onUpdateSteps: (newSteps: number) => void;
  onUpdateMood: (mood: MoodType) => void;
  onUpdateNote: (note: string) => void;
  onStartWalk: () => void;
  onGoToCompanion: () => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  todayRecord,
  settings,
  weeklyAvg,
  onUpdateSteps,
  onUpdateMood,
  onUpdateNote,
  onStartWalk,
  onGoToCompanion,
}) => {
  const [currentQuote, setCurrentQuote] = useState<InspirationalQuote>(() => getRandomQuote());
  const [customAdd, setCustomAdd] = useState<string>('');
  const [noteText, setNoteText] = useState<string>(todayRecord.note || '');
  const [noteSaved, setNoteSaved] = useState<boolean>(false);
  const [isChangingQuote, setIsChangingQuote] = useState<boolean>(false);

  const handleShowMeMoreQuote = () => {
    setIsChangingQuote(true);
    if (settings.soundEnabled) {
      sounds.playStepTap();
    }
    setTimeout(() => {
      setCurrentQuote(getRandomQuote(currentQuote.id));
      setIsChangingQuote(false);
    }, 150);
  };

  // Celebrate if just reached target
  const progressPercent = Math.min(100, Math.round((todayRecord.steps / settings.dailyTarget) * 100));

  const addSteps = (delta: number) => {
    const updated = Math.max(0, todayRecord.steps + delta);
    onUpdateSteps(updated);
    if (settings.soundEnabled) {
      sounds.playStepTap();
    }
    if (updated >= settings.dailyTarget && todayRecord.steps < settings.dailyTarget) {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#3caaa7', '#45b5b0', '#5eead4', '#fde047']
      });
      sounds.playMilestoneCelebration();
    }
  };

  const handleCustomAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customAdd, 10);
    if (!isNaN(val) && val > 0) {
      addSteps(val);
      setCustomAdd('');
    }
  };

  const handleSaveNote = () => {
    onUpdateNote(noteText);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  const distKm = calculateDistanceKm(todayRecord.steps, settings.strideLengthM);
  const displayDist = settings.unit === 'mi' ? (distKm * 0.621371).toFixed(2) : distKm.toFixed(2);
  const calories = calculateCalories(todayRecord.steps, settings.weightKg);
  const activeMins = calculateActiveMinutes(todayRecord.steps);

  // SVG Radial circle calculations
  const radius = 105;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const moodsList: { id: MoodType; label: string; icon: string; desc: string }[] = [
    { id: 'restorative', label: 'Rest & Restore', icon: '🛋️', desc: 'Honoring recovery & low energy' },
    { id: 'peaceful', label: 'Gentle Stroll', icon: '🌿', desc: 'Calm, unhurried pace' },
    { id: 'reflective', label: 'Mindful Walk', icon: '🧘', desc: 'Present and sensory-focused' },
    { id: 'focused', label: 'Steady Strides', icon: '👟', desc: 'Regular daily cadence' },
    { id: 'energetic', label: 'Extra Mile', icon: '⚡', desc: 'Feeling vibrant & strong' },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Gentle Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-teal-500/5 p-4 sm:p-5 rounded-3xl border border-teal-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#3caaa7] uppercase tracking-wider">Daily Journey</span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-medium">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight mt-0.5">
            Walk Your Way, {settings.userName}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            "Without blaming nor pushing beyond what you can do."
          </p>
        </div>

        <button
          onClick={onStartWalk}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#3caaa7] hover:bg-[#349693] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
        >
          <Footprints className="w-4 h-4" />
          <span>Launch Live Walk</span>
        </button>
      </div>

      {/* Mood & Pace Selector */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-teal-100 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-[#3caaa7]" />
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Today's Rhythm & Mood
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Adapts your nudges & targets</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {moodsList.map((m) => {
            const isSelected = todayRecord.mood === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onUpdateMood(m.id)}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#3caaa7] bg-teal-50/70 text-teal-950 shadow-2xs scale-[1.02]'
                    : 'border-slate-100 hover:border-teal-200 bg-slate-50/50 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-lg">{m.icon}</span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-[#3caaa7]" />}
                </div>
                <div>
                  <div className="text-xs font-bold tracking-tight">{m.label}</div>
                  <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{m.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Dial & Glance Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Progress Ring Card */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-teal-100 shadow-xs flex flex-col items-center justify-center relative overflow-hidden">
          <div className="relative flex items-center justify-center my-2">
            <svg className="w-64 h-64 -rotate-90 transform" viewBox="0 0 240 240">
              {/* Background track */}
              <circle
                cx="120"
                cy="120"
                r={radius}
                stroke="#e2e8f0"
                strokeWidth="14"
                fill="transparent"
                strokeLinecap="round"
              />
              {/* Animated Progress Arc */}
              <circle
                cx="120"
                cy="120"
                r={radius}
                stroke="url(#tealGradient)"
                strokeWidth="14"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="tealGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2dd4bf" />
                  <stop offset="100%" stopColor="#0d9488" />
                </linearGradient>
              </defs>
            </svg>

            {/* Inner Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
              <img
                src="/assets/aistudio/Zinmebo_app_icon_d2f433df.png"
                alt="Footprint"
                className="w-8 h-8 rounded-xl opacity-80 mb-1"
              />
              <span className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tight font-mono">
                {todayRecord.steps.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-slate-400 mt-0.5">
                of gentle {settings.dailyTarget.toLocaleString()} goal
              </span>

              <div className="mt-2 text-xs font-bold px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200/60 shadow-2xs">
                {progressPercent}% completed
              </div>
            </div>
          </div>

          {progressPercent >= 100 && (
            <div className="mt-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5 animate-gentle-float">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Goal reached gently! Rest or continue as you wish.</span>
            </div>
          )}

          {/* Quick Manual Increments */}
          <div className="mt-5 w-full pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-400">Quick Log:</span>
            <div className="flex flex-wrap gap-1.5">
              {[100, 250, 500, 1000].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => addSteps(num)}
                  className="px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 hover:border-teal-300 text-xs font-semibold transition-all"
                >
                  +{num}
                </button>
              ))}
              <form onSubmit={handleCustomAdd} className="flex items-center gap-1">
                <input
                  type="number"
                  placeholder="steps"
                  value={customAdd}
                  onChange={(e) => setCustomAdd(e.target.value)}
                  className="w-16 text-xs px-2 py-1 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-400"
                />
                <button
                  type="submit"
                  className="p-1 rounded-xl bg-slate-100 hover:bg-teal-100 text-slate-600 hover:text-teal-800 text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* 3 Metric Cards + AI Companion Nudge */}
        <div className="lg:col-span-5 space-y-4">
          {/* Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 bg-white rounded-3xl border border-teal-100/70 shadow-2xs text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-400 mb-1">
                <Footprints className="w-3.5 h-3.5 text-[#3caaa7]" />
                Distance
              </div>
              <div className="text-xl font-extrabold text-slate-800 font-mono">
                {displayDist}
              </div>
              <div className="text-[10px] text-slate-400 uppercase font-medium">{settings.unit}</div>
            </div>

            <div className="p-3.5 bg-white rounded-3xl border border-teal-100/70 shadow-2xs text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-400 mb-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                Calories
              </div>
              <div className="text-xl font-extrabold text-slate-800 font-mono">
                {calories}
              </div>
              <div className="text-[10px] text-slate-400 uppercase font-medium">kcal</div>
            </div>

            <div className="p-3.5 bg-white rounded-3xl border border-teal-100/70 shadow-2xs text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-400 mb-1">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                Active
              </div>
              <div className="text-xl font-extrabold text-slate-800 font-mono">
                {activeMins}
              </div>
              <div className="text-[10px] text-slate-400 uppercase font-medium">mins</div>
            </div>
          </div>

          {/* Zinmebo Inspirational Quote Card */}
          <div className="p-5 bg-gradient-to-br from-teal-50/90 to-emerald-50/60 rounded-3xl border border-teal-200/80 shadow-2xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-[#3caaa7] flex items-center justify-center text-white shadow-2xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-teal-900 tracking-tight">
                  Inspirational Quote
                </span>
                <span className="text-[10px] font-semibold text-teal-700 bg-teal-100/60 px-2 py-0.5 rounded-full">
                  {currentQuote.category}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => sounds.playMindfulChime()}
                  title="Play mindful Tibetan chime"
                  className="p-1.5 rounded-lg text-teal-700 hover:bg-teal-100 transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className={`transition-opacity duration-150 ${isChangingQuote ? 'opacity-20' : 'opacity-100'}`}>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-semibold mt-2">
                "{currentQuote.quote}"
              </p>
              <div className="mt-1.5 text-xs text-teal-800 font-bold">
                — {currentQuote.author}
                {currentQuote.source ? ` (${currentQuote.source})` : ''}
              </div>

              {currentQuote.reflection && (
                <div className="mt-2.5 pt-2.5 border-t border-teal-200/50 text-[11px] text-teal-900/80 italic">
                  Takeaway: {currentQuote.reflection}
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={handleShowMeMoreQuote}
                className="flex-1 py-2 px-3.5 rounded-xl bg-[#3caaa7] hover:bg-[#349693] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-98"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isChangingQuote ? 'animate-spin' : ''}`} />
                <span>Show me more</span>
              </button>

              <button
                type="button"
                onClick={onGoToCompanion}
                className="py-2 px-3 rounded-xl bg-white hover:bg-teal-100/70 text-[#184f4d] border border-teal-200 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                title="Open Inspiration mate"
              >
                <span>All Quotes</span>
                <ChevronRight className="w-3.5 h-3.5 text-teal-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Breakdown & Daily Journal Note */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Hourly distribution bars */}
        <div className="md:col-span-7 bg-white p-5 rounded-3xl border border-teal-100 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Today's Movement Rhythm (Hourly)
            </h3>
            <span className="text-[11px] text-slate-400">00:00 - 23:00</span>
          </div>

          <div className="h-28 flex items-end gap-1 pt-4 pb-2 px-1">
            {todayRecord.hourlySteps.map((steps, hour) => {
              const maxStepsInHour = Math.max(1, ...todayRecord.hourlySteps);
              const heightPercent = Math.min(100, Math.round((steps / maxStepsInHour) * 100));
              const isCurrentHour = new Date().getHours() === hour;
              return (
                <div
                  key={hour}
                  className="flex-1 flex flex-col items-center group relative h-full justify-end"
                >
                  {/* Tooltip */}
                  <div className="absolute -top-7 hidden group-hover:flex bg-slate-800 text-white text-[9px] py-0.5 px-1.5 rounded-md whitespace-nowrap z-20 shadow-md">
                    {hour}:00 • {steps} steps
                  </div>
                  <div
                    style={{ height: `${Math.max(4, heightPercent)}%` }}
                    className={`w-full rounded-t-sm transition-all duration-300 ${
                      steps > 0
                        ? isCurrentHour
                          ? 'bg-[#3caaa7]'
                          : 'bg-teal-400/80 hover:bg-teal-500'
                        : 'bg-slate-100'
                    }`}
                  />
                  {hour % 4 === 0 && (
                    <span className="text-[9px] text-slate-400 mt-1 font-mono">{hour}h</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Reflection Note */}
        <div className="md:col-span-5 bg-white p-5 rounded-3xl border border-teal-100 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Personal Walking Note
              </h3>
              {noteSaved && <span className="text-[10px] text-emerald-600 font-bold">Saved!</span>}
            </div>
            <p className="text-[11px] text-slate-400 mb-2">
              Jot down thoughts, routes, or what made your stroll special.
            </p>
            <textarea
              rows={3}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="e.g. Sunny breeze in the park, felt grounded after a busy meeting..."
              className="w-full text-xs p-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-teal-400 resize-none text-slate-700"
            />
          </div>

          <button
            type="button"
            onClick={handleSaveNote}
            className="mt-3 self-end py-1.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition-colors"
          >
            Save Note to Vault
          </button>
        </div>
      </div>
    </div>
  );
};
