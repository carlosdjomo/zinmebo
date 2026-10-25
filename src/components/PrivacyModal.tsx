import React, { useRef, useState } from 'react';
import { ShieldCheck, Download, Upload, Trash2, X, Check, Lock, EyeOff, HardDrive } from 'lucide-react';
import { DayRecord, UserSettings } from '../types';
import { exportToJSON, exportToCSV, purgeLocalVault } from '../utils/storage';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: DayRecord[];
  settings: UserSettings;
  onRecordsImported: (records: DayRecord[]) => void;
  onPurge: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
  isOpen,
  onClose,
  records,
  settings,
  onRecordsImported,
  onPurge,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmPurge, setConfirmPurge] = useState(false);
  const [importNotice, setImportNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed.records && Array.isArray(parsed.records)) {
          onRecordsImported(parsed.records);
          setImportNotice('Successfully restored your backup!');
          setTimeout(() => setImportNotice(null), 3000);
        } else if (Array.isArray(parsed)) {
          onRecordsImported(parsed);
          setImportNotice('Successfully restored your backup!');
          setTimeout(() => setImportNotice(null), 3000);
        } else {
          setImportNotice('Invalid backup file format.');
        }
      } catch (err) {
        setImportNotice('Could not parse backup file.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-teal-100 flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600">
              <ShieldCheck className="w-5 h-5 text-[#3caaa7]" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Privacy & Vault</h3>
              <p className="text-xs text-slate-500">Your health data is sacred and stays on your device</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Pillars */}
        <div className="grid grid-cols-2 gap-3 my-5">
          <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-100/60 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-xs">
              <Lock className="w-4 h-4 text-emerald-600" />
              100% On-Device
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              All step logs & notes stay strictly in your browser's local vault.
            </p>
          </div>

          <div className="p-3.5 bg-teal-50/50 rounded-2xl border border-teal-100/60 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-teal-700 font-semibold text-xs">
              <EyeOff className="w-4 h-4 text-teal-600" />
              Zero Ads & Trackers
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              No marketing cookies, no behavior tracking, no selling your walking habits.
            </p>
          </div>

          <div className="p-3.5 bg-sky-50/50 rounded-2xl border border-sky-100/60 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-sky-700 font-semibold text-xs">
              <HardDrive className="w-4 h-4 text-sky-600" />
              Zero 3rd-Party Access
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              No cloud syncing without your explicit consent. Full data sovereignty.
            </p>
          </div>

          <div className="p-3.5 bg-indigo-50/50 rounded-2xl border border-indigo-100/60 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-indigo-700 font-semibold text-xs">
              <Download className="w-4 h-4 text-indigo-600" />
              Portable Backup
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Export your full activity log to JSON or CSV anytime with one click.
            </p>
          </div>
        </div>

        {importNotice && (
          <div className="p-3 mb-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-teal-600 shrink-0" />
            {importNotice}
          </div>
        )}

        {/* Data Actions */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Data Ownership</h4>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => exportToJSON(records, settings)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors"
            >
              <Download className="w-4 h-4 text-slate-500" />
              Export JSON Backup
            </button>
            <button
              onClick={() => exportToCSV(records)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors"
            >
              <Download className="w-4 h-4 text-slate-500" />
              Export CSV Spreadsheet
            </button>
          </div>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 hover:border-teal-300 text-slate-700 font-medium text-xs transition-colors"
            >
              <Upload className="w-4 h-4 text-teal-600" />
              Restore Backup File (.json)
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100">
            {!confirmPurge ? (
              <button
                onClick={() => setConfirmPurge(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-rose-600 hover:bg-rose-50 font-medium text-xs transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Purge All Local Records
              </button>
            ) : (
              <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-center space-y-2">
                <p className="text-xs text-rose-700 font-medium">
                  Are you sure? This will delete all local history and settings on this browser.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      purgeLocalVault();
                      onPurge();
                      setConfirmPurge(false);
                      onClose();
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-rose-600 text-white font-medium text-xs hover:bg-rose-700"
                  >
                    Yes, Delete Everything
                  </button>
                  <button
                    onClick={() => setConfirmPurge(false)}
                    className="flex-1 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 font-medium text-xs hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400">
            Zinmebo • Walk your way well • © 2026 Carlos Djomo, Ph.D
          </p>
        </div>
      </div>
    </div>
  );
};
