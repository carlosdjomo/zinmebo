import React, { useState } from 'react';
import { Settings, X, Sliders, Volume2, VolumeX, Check, Sparkles } from 'lucide-react';
import { UserSettings } from '../types';

interface TargetSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSave: (newSettings: UserSettings) => void;
}

export const TargetSettingsModal: React.FC<TargetSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [formData, setFormData] = useState<UserSettings>({ ...settings });
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const presets = [
    { label: 'Gentle Stroll', daily: 4000, weekly: 28000, desc: 'Restorative, low stress' },
    { label: 'Comfortable', daily: 6000, weekly: 42000, desc: 'Balanced daily rhythm' },
    { label: 'Active Walker', daily: 8500, weekly: 60000, desc: 'Regular brisk movement' },
    { label: 'Extra Mile', daily: 10000, weekly: 70000, desc: 'Energized steps' },
  ];

  const handleSave = () => {
    onSave(formData);
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-teal-100 flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center text-[#3caaa7]">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Personal Targets & Rhythm</h3>
              <p className="text-xs text-slate-500">Tailored to your body and lifestyle</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gentle Philosophy Banner */}
        <div className="my-4 p-3.5 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl border border-teal-100/60 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-[#3caaa7] shrink-0 mt-0.5" />
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong className="text-slate-800">No judgment here:</strong> Set whatever target feels comforting. You can change this on days you want to slow down or go further.
          </p>
        </div>

        {/* Presets */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-slate-700 block mb-2">
            Gentle Rhythm Presets
          </label>
          <div className="grid grid-cols-2 gap-2">
            {presets.map((p) => {
              const isSelected = formData.dailyTarget === p.daily;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      dailyTarget: p.daily,
                      weeklyTarget: p.weekly,
                    }))
                  }
                  className={`p-2.5 text-left rounded-2xl border transition-all ${
                    isSelected
                      ? 'border-[#3caaa7] bg-teal-50/70 text-teal-900 shadow-xs'
                      : 'border-slate-200 hover:border-teal-200 bg-white text-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold">{p.label}</div>
                  <div className="text-[11px] text-[#3caaa7] font-semibold">{p.daily.toLocaleString()} steps/day</div>
                  <div className="text-[10px] text-slate-400">{p.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Daily Target Slider */}
        <div className="mb-5 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              Daily Target:
            </span>
            <span className="font-bold text-teal-700 text-sm bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-100">
              {formData.dailyTarget.toLocaleString()} steps
            </span>
          </div>
          <input
            type="range"
            min="2000"
            max="20000"
            step="500"
            value={formData.dailyTarget}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                dailyTarget: Number(e.target.value),
                weeklyTarget: Number(e.target.value) * 7,
              }))
            }
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#3caaa7]"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>2,000 (Soft Rest)</span>
            <span>10,000 (Standard)</span>
            <span>20,000 (High)</span>
          </div>
        </div>

        {/* Weekly Target */}
        <div className="mb-5 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-700">Weekly Target:</span>
            <span className="font-bold text-teal-700 text-sm bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-100">
              {formData.weeklyTarget.toLocaleString()} steps
            </span>
          </div>
          <input
            type="range"
            min="14000"
            max="140000"
            step="3500"
            value={formData.weeklyTarget}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                weeklyTarget: Number(e.target.value),
              }))
            }
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#3caaa7]"
          />
          <p className="text-[11px] text-slate-400">
            Weekly targets allow high and low days to naturally balance each other out.
          </p>
        </div>

        {/* Preferences */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Distance Units</span>
            <div className="flex bg-slate-100 p-0.5 rounded-xl">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, unit: 'km' }))}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                  formData.unit === 'km' ? 'bg-white shadow-xs text-teal-800' : 'text-slate-500'
                }`}
              >
                Kilometers (km)
              </button>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, unit: 'mi' }))}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                  formData.unit === 'mi' ? 'bg-white shadow-xs text-teal-800' : 'text-slate-500'
                }`}
              >
                Miles (mi)
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Peaceful Audio Feedback</span>
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors ${
                formData.soundEnabled
                  ? 'bg-teal-50 text-teal-700 border-teal-200'
                  : 'bg-slate-50 text-slate-400 border-slate-200'
              }`}
            >
              {formData.soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              {formData.soundEnabled ? 'Enabled' : 'Muted'}
            </button>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Your Preferred Name / Nickname
            </label>
            <input
              type="text"
              value={formData.userName}
              onChange={(e) => setFormData((prev) => ({ ...prev, userName: e.target.value }))}
              placeholder="Walker"
              className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-400"
            />
          </div>
        </div>

        {/* Save button */}
        <div className="mt-6 pt-3 border-t border-slate-100 flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 px-4 bg-[#3caaa7] hover:bg-[#349693] text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
          >
            {savedNotice ? (
              <>
                <Check className="w-4 h-4" /> Saved!
              </>
            ) : (
              'Save & Adapt Rhythm'
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs rounded-xl transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
