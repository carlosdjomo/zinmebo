import React from 'react';
import { ShieldCheck, Settings as SettingsIcon, Play, Sparkles } from 'lucide-react';
import { UserSettings } from '../types';

interface HeaderProps {
  currentTab: 'today' | 'weekly' | 'history' | 'companion' | 'privacy';
  onSelectTab: (tab: 'today' | 'weekly' | 'history' | 'companion' | 'privacy') => void;
  onOpenPrivacy: () => void;
  onOpenSettings: () => void;
  onStartWalk: () => void;
  settings: UserSettings;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenPrivacy,
  onOpenSettings,
  onStartWalk,
  settings,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-teal-100/70 transition-all">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => onSelectTab('today')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative">
            <img
              src="/assets/aistudio/Zinmebo_app_icon_d2f433df.png"
              alt="Zinmebo Logo"
              className="w-10 h-10 rounded-2xl shadow-xs group-hover:scale-105 transition-transform"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white ring-1 ring-emerald-200" title="100% Local Storage Active" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-extrabold tracking-tight text-slate-800">
                Zinmebo
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-teal-50 text-[#3caaa7] border border-teal-100">
                Gentle
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium tracking-tight">
              walk your way well
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Desktop / Tablet) */}
        <nav className="hidden md:flex items-center bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60">
          <button
            onClick={() => onSelectTab('today')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              currentTab === 'today'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Today's Walk
          </button>
          <button
            onClick={() => onSelectTab('weekly')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              currentTab === 'weekly'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Weekly & Goals
          </button>
          <button
            onClick={() => onSelectTab('history')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              currentTab === 'history'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Activity History
          </button>
          <button
            onClick={() => onSelectTab('companion')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentTab === 'companion'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#3caaa7]" />
            Inspiration Mate
          </button>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Quick Start Walk Session */}
          <button
            onClick={onStartWalk}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-[#3caaa7] hover:bg-[#349693] text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Walk Session</span>
          </button>

          {/* Privacy Badge */}
          <button
            onClick={onOpenPrivacy}
            title="Privacy Shield: 100% Local Storage, Zero Ads"
            className="flex items-center gap-1 py-1.5 px-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200/80 text-xs font-semibold transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#3caaa7]" />
            <span className="hidden lg:inline text-[11px]">Private Vault</span>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            title="Adjust Targets & Preferences"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
