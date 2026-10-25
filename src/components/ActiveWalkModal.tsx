import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Footprints, Flame, Timer, Gauge, Sparkles, Volume2, VolumeX, Smartphone } from 'lucide-react';
import confetti from 'canvas-confetti';
import { pedometer } from '../utils/pedometer';
import { sounds } from '../utils/audio';
import { UserSettings } from '../types';
import { calculateDistanceKm, calculateCalories } from '../utils/storage';

interface ActiveWalkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteWalk: (stepsAdded: number, durationMinutes: number) => void;
  settings: UserSettings;
}

export const ActiveWalkModal: React.FC<ActiveWalkModalProps> = ({
  isOpen,
  onClose,
  onCompleteWalk,
  settings,
}) => {
  const [isActive, setIsActive] = useState(true);
  const [sessionSteps, setSessionSteps] = useState(0);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [cadenceSpm, setCadenceSpm] = useState(0);
  const [motionSensorActive, setMotionSensorActive] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState<number | null>(null); // null = off, 80 = stroll, 105 = steady, 130 = brisk
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);

  const stepTimestampsRef = useRef<number[]>([]);
  const simTimerRef = useRef<any>(null);

  // Trigger step event
  const registerStep = (count = 1) => {
    setSessionSteps((prev) => prev + count);
    const now = Date.now();
    stepTimestampsRef.current.push(now);

    // Keep only timestamps from last 15 seconds to measure cadence
    stepTimestampsRef.current = stepTimestampsRef.current.filter((t) => now - t <= 15000);

    const spm = Math.round((stepTimestampsRef.current.length / 15) * 60);
    setCadenceSpm(spm);

    if (soundEnabled) {
      sounds.playStepTap();
    }
  };

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (isOpen && isActive) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, isActive]);

  // Motion Sensor setup
  useEffect(() => {
    if (!isOpen) {
      pedometer.stopListening();
      setMotionSensorActive(false);
      return;
    }

    if (isActive && motionSensorActive) {
      pedometer.startListening((delta) => {
        registerStep(delta);
      });
    } else {
      pedometer.stopListening();
    }

    return () => {
      pedometer.stopListening();
    };
  }, [isOpen, isActive, motionSensorActive]);

  // Simulated walking cadence
  useEffect(() => {
    if (simTimerRef.current) clearInterval(simTimerRef.current);

    if (isOpen && isActive && simulationSpeed) {
      const intervalMs = Math.round(60000 / simulationSpeed);
      simTimerRef.current = setInterval(() => {
        registerStep(1);
      }, intervalMs);
    }

    return () => {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
    };
  }, [isOpen, isActive, simulationSpeed, soundEnabled]);

  const toggleSensor = async () => {
    if (!motionSensorActive) {
      const granted = await pedometer.requestMotionPermission();
      if (granted) {
        setMotionSensorActive(true);
      } else {
        alert('Device motion permission was not granted or is unsupported on this device.');
      }
    } else {
      setMotionSensorActive(false);
    }
  };

  const handleFinish = () => {
    setIsActive(false);
    if (sessionSteps > 50) {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3caaa7', '#45b5b0', '#a7f3d0', '#fef08a']
      });
      sounds.playMilestoneCelebration();
    }
    onCompleteWalk(sessionSteps, Math.max(1, Math.round(secondsElapsed / 60)));
    onClose();
  };

  if (!isOpen) return null;

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) {
      return `${hrs}:${String(mins % 60).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const distKm = calculateDistanceKm(sessionSteps, settings.strideLengthM);
  const displayDist = settings.unit === 'mi' ? (distKm * 0.621371).toFixed(2) : distKm.toFixed(2);
  const calories = calculateCalories(sessionSteps, settings.weightKg);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-teal-100 flex flex-col text-slate-800 relative overflow-hidden">
        {/* Calming glow background */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-teal-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />

        {/* Top bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-[#3caaa7]">
              <Footprints className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Walk</span>
              <h3 className="text-sm font-bold text-slate-800">Mindful Movement Session</h3>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute step sound' : 'Enable step sound'}
              className={`p-2 rounded-xl transition-colors ${
                soundEnabled ? 'bg-teal-50 text-teal-600' : 'bg-slate-100 text-slate-400'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={handleFinish}
              className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
            >
              Done
            </button>
          </div>
        </div>

        {/* Step Counter Display */}
        <div className="my-6 text-center relative z-10">
          <div className="inline-flex items-center justify-center w-48 h-48 rounded-full border-4 border-teal-100 bg-gradient-to-b from-teal-50/60 to-white shadow-inner relative">
            <div className="flex flex-col items-center">
              <span className="text-5xl font-black tracking-tight text-slate-800 font-mono">
                {sessionSteps.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-[#3caaa7] uppercase tracking-wider mt-1">
                Session Steps
              </span>
              <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-500 bg-white/80 px-2.5 py-0.5 rounded-full border border-teal-100 shadow-2xs">
                <Gauge className="w-3 h-3 text-[#3caaa7]" />
                <span>{cadenceSpm} SPM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6 relative z-10">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-[11px] font-medium mb-0.5">
              <Timer className="w-3.5 h-3.5 text-teal-600" />
              Duration
            </div>
            <div className="text-base font-bold text-slate-800 font-mono">
              {formatTimer(secondsElapsed)}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-[11px] font-medium mb-0.5">
              <Footprints className="w-3.5 h-3.5 text-teal-600" />
              Distance
            </div>
            <div className="text-base font-bold text-slate-800 font-mono">
              {displayDist} <span className="text-xs font-normal text-slate-500">{settings.unit}</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-[11px] font-medium mb-0.5">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              Burn
            </div>
            <div className="text-base font-bold text-slate-800 font-mono">
              {calories} <span className="text-xs font-normal text-slate-500">kcal</span>
            </div>
          </div>
        </div>

        {/* Controls & Simulators */}
        <div className="space-y-3 relative z-10 pt-2 border-t border-slate-100">
          {/* Main Action Bar */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsActive(!isActive)}
              className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all ${
                isActive
                  ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                  : 'bg-[#3caaa7] text-white hover:bg-[#349693]'
              }`}
            >
              {isActive ? (
                <>
                  <Pause className="w-4 h-4 fill-current" /> Pause Walk
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" /> Resume Walk
                </>
              )}
            </button>

            <button
              onClick={handleFinish}
              className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <Square className="w-4 h-4 fill-current" /> Finish & Log
            </button>
          </div>

          {/* Device Motion vs Cadence Simulation */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/70 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <Smartphone className="w-3.5 h-3.5 text-teal-600" />
                <span>Auto Sensor & Walk Simulation</span>
              </div>
              <button
                type="button"
                onClick={toggleSensor}
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg border transition-all ${
                  motionSensorActive
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
                }`}
              >
                {motionSensorActive ? '● Phone Accelerometer ON' : 'Enable Accelerometer'}
              </button>
            </div>

            {/* Simulation Cadence Options */}
            <div>
              <div className="text-[11px] text-slate-500 mb-1.5 flex items-center justify-between">
                <span>Walking Cadence Simulator (Desktop / Treadmill):</span>
                {simulationSpeed && (
                  <span className="text-teal-700 font-bold">{simulationSpeed} steps/min</span>
                )}
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: 'Off', speed: null },
                  { label: 'Stroll (80)', speed: 80 },
                  { label: 'Steady (105)', speed: 105 },
                  { label: 'Brisk (130)', speed: 130 },
                ].map((item) => {
                  const isCurrent = simulationSpeed === item.speed;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setSimulationSpeed(item.speed)}
                      className={`py-1.5 text-[11px] font-medium rounded-xl border transition-all ${
                        isCurrent
                          ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-teal-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick manual step tap */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
              <span className="text-slate-500">Quick Manual Add:</span>
              <div className="flex gap-1.5">
                {[10, 50, 100].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => registerStep(num)}
                    className="px-2 py-1 bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 font-bold rounded-lg text-[10px]"
                  >
                    +{num}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mindful reminder */}
        <div className="mt-4 text-center">
          <p className="text-[11px] text-slate-400 italic flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-[#3caaa7]" />
            "Every step you take is a breath for your mind and body."
          </p>
        </div>
      </div>
    </div>
  );
};
