// src/components/RestTimerFloat.jsx
import React, { useContext, useState } from 'react';
import { RestTimerContext } from '../context/RestTimerContext';
import { Timer, X, Play, Square, ChevronUp, ChevronDown } from 'lucide-react';

const PRESETS = [
  { label: '30s', seconds: 30 },
  { label: '60s', seconds: 60 },
  { label: '90s', seconds: 90 },
  { label: '2m',  seconds: 120 },
];

const RestTimerFloat = () => {
  const {
    secondsLeft,
    totalSeconds,
    isRunning,
    isFinished,
    startTimer,
    stopTimer,
    dismissFinished,
  } = useContext(RestTimerContext);

  const [collapsed, setCollapsed] = useState(false);

  // Don't show when there's nothing happening
  const isVisible = isRunning || isFinished;

  const formatTime = (s) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const progressPercent = totalSeconds > 0
    ? ((totalSeconds - secondsLeft) / totalSeconds) * 100
    : 0;

  return (
    <>
      {/* Floating Quick-Start Button — visible when timer is NOT active */}
      {!isVisible && (
        <div className="fixed bottom-6 right-6 z-40">
          <div className="bg-gym-card border border-slate-700 rounded-2xl shadow-2xl p-3 flex items-center gap-2">
            <Timer className="h-5 w-5 text-neon-green" />
            <div className="flex gap-1.5">
              {PRESETS.map(p => (
                <button
                  key={p.label}
                  onClick={() => startTimer(p.seconds)}
                  className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 
                             hover:bg-neon-green hover:text-gym-darker transition-all border border-slate-700
                             hover:border-neon-green hover:shadow-[0_0_12px_rgba(204,255,0,0.3)]"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Timer Widget */}
      {isVisible && (
        <div
          className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
            isFinished ? 'animate-pulse' : ''
          }`}
        >
          <div
            className={`rounded-2xl shadow-2xl border overflow-hidden transition-all ${
              isFinished
                ? 'bg-neon-green/10 border-neon-green/60 shadow-[0_0_30px_rgba(204,255,0,0.3)]'
                : 'bg-gym-card border-slate-700'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800/50">
              <div className="flex items-center gap-2">
                <Timer className={`h-4 w-4 ${isFinished ? 'text-neon-green' : 'text-neon-green'}`} />
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  {isFinished ? '¡Tiempo!' : 'Descanso'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCollapsed(!collapsed)}
                  className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {collapsed ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={() => { stopTimer(); dismissFinished(); }}
                  className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {!collapsed && (
              <div className="px-4 py-3">
                {isFinished ? (
                  /* Finished state */
                  <div className="text-center">
                    <p className="text-2xl font-bold text-neon-green mb-2">🔔 ¡A entrenar!</p>
                    <button
                      onClick={dismissFinished}
                      className="text-xs bg-neon-green text-gym-darker font-bold px-4 py-1.5 rounded-lg 
                                 hover:bg-lime-400 transition-colors"
                    >
                      Cerrar
                    </button>
                  </div>
                ) : (
                  /* Running state */
                  <>
                    {/* Countdown */}
                    <div className="text-center mb-3">
                      <span className={`text-3xl font-mono font-bold tabular-nums ${
                        secondsLeft <= 5 ? 'text-red-400' : 'text-white'
                      }`}>
                        {formatTime(secondsLeft)}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-800 rounded-full h-1.5 mb-3 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-linear bg-gradient-to-r from-neon-green to-lime-400"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    {/* Quick presets to restart */}
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1.5">
                        {PRESETS.map(p => (
                          <button
                            key={p.label}
                            onClick={() => startTimer(p.seconds)}
                            className="text-[10px] font-bold px-2 py-1 rounded bg-slate-800 text-slate-400 
                                       hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={stopTimer}
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 
                                   transition-colors border border-red-500/20"
                        title="Detener"
                      >
                        <Square className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Collapsed mini view */}
            {collapsed && isRunning && (
              <div className="px-4 py-2 flex items-center justify-between">
                <span className={`text-lg font-mono font-bold tabular-nums ${
                  secondsLeft <= 5 ? 'text-red-400' : 'text-white'
                }`}>
                  {formatTime(secondsLeft)}
                </span>
                <button
                  onClick={stopTimer}
                  className="p-1 text-red-400 hover:text-red-300 transition-colors"
                >
                  <Square className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default RestTimerFloat;
