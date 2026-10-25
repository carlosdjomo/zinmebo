import React from 'react';
import { Target, TrendingUp, Calendar, Sparkles, Sliders, Footprints, Flame, Clock, Award } from 'lucide-react';
import { DayRecord, UserSettings } from '../types';
import { getWeeklyStats } from '../utils/storage';

interface WeeklyViewProps {
  records: DayRecord[];
  settings: UserSettings;
  onOpenTargetSettings: () => void;
  onSelectDay: (record: DayRecord) => void;
}

export const WeeklyView: React.FC<WeeklyViewProps> = ({
  records,
  settings,
  onOpenTargetSettings,
  onSelectDay,
}) => {
  const stats = getWeeklyStats(records);

  const weeklyProgressPercent = Math.min(
    100,
    Math.round((stats.totalSteps / settings.weeklyTarget) * 100)
  );

  const maxStepsInWeek = Math.max(settings.dailyTarget * 1.2, ...stats.past7Days.map((d) => d.steps));

  const moodEmojis: Record<string, string> = {
    restorative: '🛋️',
    peaceful: '🌿',
    reflective: '🧘',
    focused: '👟',
    energetic: '⚡',
    tired: '🌙',
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-teal-500/5 p-4 sm:p-5 rounded-3xl border border-teal-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#3caaa7] uppercase tracking-wider">Weekly Horizon</span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-medium">Past 7 Days Overview</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight mt-0.5">
            Weekly Target & Balanced Pace
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            "Sometimes we go the extra mile, sometimes we slow down. What matters is the holistic rhythm."
          </p>
        </div>

        <button
          onClick={onOpenTargetSettings}
          className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white hover:bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold shadow-2xs transition-all"
        >
          <Sliders className="w-3.5 h-3.5 text-[#3caaa7]" />
          <span>Adjust Targets</span>
        </button>
      </div>

      {/* 2 Primary Weekly Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weekly Target Progress Card */}
        <div className="p-5 sm:p-6 bg-white rounded-3xl border border-teal-100 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-[#3caaa7]">
                  <Target className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Weekly Target Progress
                </h3>
              </div>
              <span className="text-xs font-bold text-[#3caaa7] bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
                {weeklyProgressPercent}%
              </span>
            </div>

            <div className="my-3">
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-2xl sm:text-3xl font-black text-slate-800 font-mono">
                  {stats.totalSteps.toLocaleString()}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  of {settings.weeklyTarget.toLocaleString()} steps
                </span>
              </div>
              {/* Progress Bar */}
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                <div
                  style={{ width: `${weeklyProgressPercent}%` }}
                  className="h-full bg-gradient-to-r from-teal-400 to-[#3caaa7] rounded-full transition-all duration-700 ease-out"
                />
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              {stats.totalSteps >= settings.weeklyTarget
                ? "🌟 Amazing! You've achieved your weekly target! Every step from here is pure celebration."
                : `You have ${(settings.weeklyTarget - stats.totalSteps).toLocaleString()} steps left this week. Take them at whatever pace feels comfortable.`}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Daily Goal: {settings.dailyTarget.toLocaleString()} steps</span>
            <span className="text-teal-700 font-semibold">Active Days: {stats.activeDaysCount}/7</span>
          </div>
        </div>

        {/* Weekly Average Card */}
        <div className="p-5 sm:p-6 bg-white rounded-3xl border border-teal-100 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Weekly Average
                </h3>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                Daily Average
              </span>
            </div>

            <div className="my-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-800 font-mono">
                  {stats.averageSteps.toLocaleString()}
                </span>
                <span className="text-xs font-semibold text-slate-400">steps / day</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {stats.averageSteps >= settings.dailyTarget
                  ? "Your daily average comfortably clears your target pace."
                  : "Gentle balance: A quiet rest day today is easily lifted by an active weekend stroll."}
              </p>
            </div>
          </div>

          {/* 3 mini stats */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
            <div className="p-2 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-400 font-medium block">Total Dist</span>
              <span className="text-xs font-bold text-slate-700 font-mono">
                {settings.unit === 'mi' ? (stats.totalDistance * 0.621371).toFixed(1) : stats.totalDistance.toFixed(1)} {settings.unit}
              </span>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-400 font-medium block">Total Burn</span>
              <span className="text-xs font-bold text-slate-700 font-mono">
                {stats.totalCalories.toLocaleString()} kcal
              </span>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-400 font-medium block">Active Time</span>
              <span className="text-xs font-bold text-slate-700 font-mono">
                {stats.totalActiveMins} mins
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Interactive Bar Chart */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-teal-100 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#3caaa7]" />
              7-Day Walking Distribution
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Tap any day bar to view detailed hourly steps and walking reflections
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-[#3caaa7]" />
              Achieved Target
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-teal-200" />
              Gentle Rest / Moving
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-dashed border-t-2 border-dashed border-teal-400" />
              Target Line
            </span>
          </div>
        </div>

        {/* Chart Bars */}
        <div className="relative h-64 pt-6 pb-2 flex items-end gap-2 sm:gap-4 px-2">
          {/* Target Reference Line */}
          <div
            style={{
              bottom: `${Math.min(90, (settings.dailyTarget / maxStepsInWeek) * 100)}%`,
            }}
            className="absolute left-0 right-0 border-b border-dashed border-teal-400 pointer-events-none z-10 flex justify-end pr-2"
          >
            <span className="text-[9px] font-bold text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded -mb-2 border border-teal-200">
              Target: {settings.dailyTarget.toLocaleString()}
            </span>
          </div>

          {stats.past7Days.map((rec) => {
            const dateObj = new Date(rec.date + 'T12:00:00');
            const dayName = dateObj.toLocaleDateString(undefined, { weekday: 'short' });
            const dayNum = dateObj.getDate();
            const heightPercent = Math.min(100, Math.round((rec.steps / maxStepsInWeek) * 100));
            const reached = rec.steps >= settings.dailyTarget;
            const isToday = rec.date === stats.past7Days[stats.past7Days.length - 1].date;

            return (
              <div
                key={rec.date}
                onClick={() => onSelectDay(rec)}
                className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer group relative z-20"
              >
                {/* Floating Tooltip */}
                <div className="absolute -top-12 hidden group-hover:flex flex-col items-center bg-slate-800 text-white text-[10px] py-1 px-2.5 rounded-xl whitespace-nowrap shadow-lg z-30 transition-all">
                  <span className="font-bold">{rec.steps.toLocaleString()} steps</span>
                  <span className="text-slate-300 text-[9px]">{rec.distanceKm} km • {rec.mood || 'peaceful'}</span>
                  <div className="w-2 h-2 bg-slate-800 rotate-45 -mb-1 -bottom-1 absolute" />
                </div>

                {/* Bar */}
                <div
                  style={{ height: `${Math.max(6, heightPercent)}%` }}
                  className={`w-full max-w-[48px] rounded-2xl transition-all duration-300 group-hover:scale-y-[1.02] flex items-start justify-center pt-1.5 ${
                    reached
                      ? 'bg-gradient-to-t from-teal-600 to-[#3caaa7] shadow-sm'
                      : rec.steps > 0
                      ? 'bg-teal-200 group-hover:bg-teal-300'
                      : 'bg-slate-100'
                  } ${isToday ? 'ring-2 ring-teal-400 ring-offset-2' : ''}`}
                >
                  {rec.mood && (
                    <span className="text-xs drop-shadow-xs">
                      {moodEmojis[rec.mood] || '🌿'}
                    </span>
                  )}
                </div>

                {/* Day label */}
                <div className="mt-2 text-center">
                  <span className={`text-[11px] font-bold block ${isToday ? 'text-teal-700' : 'text-slate-700'}`}>
                    {dayName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    {dayNum}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gentle Consistency Tracker (No punishing streak breaks!) */}
      <div className="p-5 bg-gradient-to-r from-teal-50 via-emerald-50 to-teal-50 rounded-3xl border border-teal-100 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white shadow-xs flex items-center justify-center text-2xl">
            🌱
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-800 text-sm">Gentle Consistency Blooms</h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {stats.activeDaysCount} Days Nurtured
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              In Zinmebo, there are no punishing "broken streaks". If you rested on Wednesday, you nurtured your body just as much as walking 10,000 steps on Sunday.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {stats.past7Days.map((d, i) => (
            <div
              key={i}
              title={`${d.date}: ${d.steps} steps`}
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs transition-transform hover:scale-110 shadow-2xs ${
                d.steps >= settings.dailyTarget
                  ? 'bg-teal-600 text-white'
                  : d.steps > 1000
                  ? 'bg-teal-100 text-teal-800'
                  : 'bg-white text-slate-400 border border-slate-200'
              }`}
            >
              {d.steps >= settings.dailyTarget ? '🌸' : d.steps > 1000 ? '🌱' : '🍃'}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
