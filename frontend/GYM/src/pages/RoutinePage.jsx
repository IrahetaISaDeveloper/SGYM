// src/pages/RoutinePage.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Calendar, Dumbbell, ChevronRight, Edit3, Save,
  RotateCcw, Flame, Clock, Target, Activity, Plus, Trash2, CheckCircle2
} from 'lucide-react';

const DAYS = [
  { key: 'monday',    label: 'Lunes' },
  { key: 'tuesday',   label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday',  label: 'Jueves' },
  { key: 'friday',    label: 'Viernes' },
  { key: 'saturday',  label: 'Sábado' },
  { key: 'sunday',    label: 'Domingo' },
];

const MUSCLE_GROUPS = ['Descanso', 'Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Abdomen'];

const MUSCLE_ICONS = {
  Pecho: '🫀', Espalda: '🔙', Piernas: '🦵', Hombros: '🏋️',
  Brazos: '💪', Abdomen: '⚡', Descanso: '😴',
};

const MUSCLE_COLORS = {
  Pecho:    'text-red-400 bg-red-500/10 border-red-500/30',
  Espalda:  'text-blue-400 bg-blue-500/10 border-blue-500/30',
  Piernas:  'text-green-400 bg-green-500/10 border-green-500/30',
  Hombros:  'text-purple-400 bg-purple-500/10 border-purple-500/30',
  Brazos:   'text-orange-400 bg-orange-500/10 border-orange-500/30',
  Abdomen:  'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  Descanso: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
};

const DAY_CARD_COLORS = {
  Pecho:    'from-red-500/20',
  Espalda:  'from-blue-500/20',
  Piernas:  'from-green-500/20',
  Hombros:  'from-purple-500/20',
  Brazos:   'from-orange-500/20',
  Abdomen:  'from-yellow-500/20',
  Descanso: 'from-slate-500/20',
};

const difficultyStyles = {
  Principiante: 'bg-green-500/20 text-green-400 border-green-500/30',
  Intermedio:   'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Avanzado:     'bg-red-500/20 text-red-400 border-red-500/30',
};

const getTodayKey = () => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[new Date().getDay()];
};

// Helper: normalize a day value to array (handles old string format & new array)
const toArray = (val) => {
  if (!val) return ['Descanso'];
  if (Array.isArray(val)) return val.length > 0 ? val : ['Descanso'];
  return [val];
};

// Helper: get a summary icon string for a day (up to 3 icons)
const getDayIcons = (muscles) => {
  const arr = toArray(muscles);
  const isRest = arr.length === 1 && arr[0] === 'Descanso';
  if (isRest) return '😴';
  return arr.filter(m => m !== 'Descanso').map(m => MUSCLE_ICONS[m] || '').join('');
};

// ─── Exercise Card ─────────────────────────────────────────────────────────────
const ExerciseCard = ({ exercise }) => {
  const [expanded, setExpanded] = useState(false);
  const [mediaError, setMediaError] = useState(false);

  // Training Log State
  const [showLog, setShowLog] = useState(false);
  const [lastLog, setLastLog] = useState(null);
  const [sets, setSets] = useState([{ weight: '', reps: '' }]);
  const [savingLog, setSavingLog] = useState(false);
  const [logSuccess, setLogSuccess] = useState(false);

  const fetchLastLog = async () => {
    try {
      const res = await api.get(`/api/workout-logs/last/${exercise._id}`);
      if (res.data) setLastLog(res.data);
    } catch (err) {
      // Ignorar si no hay registros previos
    }
  };

  const handleToggleLog = () => {
    if (!showLog && !lastLog) {
      fetchLastLog();
    }
    setShowLog(!showLog);
  };

  const handleSetChange = (index, field, value) => {
    const newSets = [...sets];
    newSets[index][field] = value;
    setSets(newSets);
  };

  const addSet = () => {
    setSets([...sets, { weight: '', reps: '' }]);
  };

  const removeSet = (index) => {
    const newSets = [...sets];
    newSets.splice(index, 1);
    setSets(newSets);
  };

  const handleSaveLog = async () => {
    const validSets = sets
      .filter(s => s.weight !== '' && s.reps !== '')
      .map(s => ({ weight: Number(s.weight), reps: Number(s.reps) }));
      
    if (validSets.length === 0) return alert('Debes completar al menos una serie (peso y reps).');
    
    setSavingLog(true);
    try {
      await api.post('/api/workout-logs', {
        exerciseId: exercise._id,
        sets: validSets
      });
      setLogSuccess(true);
      setTimeout(() => {
        setLogSuccess(false);
        setShowLog(false);
        setSets([{ weight: '', reps: '' }]);
        fetchLastLog();
      }, 2000);
    } catch (err) {
      alert('Error al guardar registro');
    } finally {
      setSavingLog(false);
    }
  };

  return (
    <div className="bg-gym-card border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all">
      <div className="relative bg-slate-900 h-44 flex items-center justify-center overflow-hidden">
        {!mediaError ? (
          <img
            src={exercise.mediaUrl}
            alt={exercise.name}
            onError={() => setMediaError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-600">
            <Dumbbell className="h-12 w-12" />
            <span className="text-xs">Sin imagen</span>
          </div>
        )}
        <span className={`absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-full border ${difficultyStyles[exercise.difficulty]}`}>
          {exercise.difficulty}
        </span>
        <span className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full border ${MUSCLE_COLORS[exercise.muscleGroup]}`}>
          {MUSCLE_ICONS[exercise.muscleGroup]} {exercise.muscleGroup}
        </span>
      </div>

      <div className="p-4">
        <h4 className="font-bold text-white text-base mb-1">{exercise.name}</h4>
        <p className="text-slate-400 text-sm mb-3">{exercise.description}</p>

        <div className="flex gap-3 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full">
            <Target className="h-3 w-3 text-neon-green" />
            <span>{exercise.sets} series</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full">
            <RotateCcw className="h-3 w-3 text-neon-green" />
            <span>{exercise.reps} reps</span>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-sm text-neon-green hover:text-lime-300 transition-colors py-1"
        >
          <span className="font-medium">¿Cómo realizarlo?</span>
          <ChevronRight className={`h-4 w-4 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </button>

        {expanded && (
          <div className="mt-3 bg-slate-800/60 rounded-lg p-3 text-sm text-slate-300 whitespace-pre-line border border-slate-700">
            {exercise.howTo}
          </div>
        )}
        
        <button
          onClick={handleToggleLog}
          className="w-full mt-3 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-medium py-2 rounded-lg transition-colors text-sm border border-slate-700 hover:border-slate-600"
        >
          <Activity className="h-4 w-4 text-neon-green" />
          {showLog ? 'Ocultar Registro' : 'Registrar Entrenamiento'}
        </button>

        {showLog && (
          <div className="mt-3 bg-slate-900/80 rounded-xl p-4 border border-neon-green/30">
            {logSuccess ? (
              <div className="flex flex-col items-center justify-center py-4 text-neon-green text-center">
                <CheckCircle2 className="h-8 w-8 mb-2" />
                <p className="font-bold">¡Registro guardado!</p>
              </div>
            ) : (
              <>
                {lastLog && (
                  <div className="mb-4 bg-slate-800 rounded-lg p-3 text-xs border border-slate-700">
                    <p className="text-slate-400 font-medium mb-2 flex justify-between">
                      <span>Última vez:</span>
                      <span>{new Date(lastLog.date).toLocaleDateString()}</span>
                    </p>
                    <div className="space-y-1">
                      {lastLog.sets.map((set, i) => (
                        <div key={i} className="flex justify-between text-slate-300">
                          <span>Serie {i + 1}</span>
                          <span>{set.weight}kg × {set.reps} reps</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="space-y-3 mb-4">
                  {sets.map((set, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-bold w-4">{idx + 1}</span>
                      <div className="flex-1 relative">
                        <input 
                          type="number" 
                          min="0"
                          placeholder="Peso" 
                          value={set.weight}
                          onChange={e => handleSetChange(idx, 'weight', e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-md py-1.5 pl-2 pr-6 text-sm text-white focus:outline-none focus:border-neon-green"
                        />
                        <span className="absolute right-2 top-1.5 text-xs text-slate-500">kg</span>
                      </div>
                      <div className="flex-1 relative">
                        <input 
                          type="number" 
                          min="1"
                          placeholder="Reps" 
                          value={set.reps}
                          onChange={e => handleSetChange(idx, 'reps', e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-md py-1.5 pl-2 text-sm text-white focus:outline-none focus:border-neon-green"
                        />
                      </div>
                      {sets.length > 1 && (
                        <button onClick={() => removeSet(idx)} className="text-slate-500 hover:text-red-400 p-1">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={addSet}
                    className="flex-1 flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-2 rounded-lg border border-slate-700"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Añadir Serie
                  </button>
                  <button 
                    onClick={handleSaveLog}
                    disabled={savingLog}
                    className="flex-[2] flex items-center justify-center gap-2 bg-neon-green hover:bg-lime-400 text-gym-darker text-sm font-bold py-2 rounded-lg disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    {savingLog ? 'Guardando...' : 'Guardar Cargas'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Routine Editor ────────────────────────────────────────────────────────────
const RoutineEditor = ({ initial, onSave, onCancel }) => {
  const emptySchedule = Object.fromEntries(DAYS.map(d => [d.key, ['Descanso']]));
  const [schedule, setSchedule] = useState(() => {
    if (!initial) return emptySchedule;
    // Normalize existing data to arrays
    return Object.fromEntries(
      DAYS.map(d => [d.key, toArray(initial[d.key])])
    );
  });

  const toggleMuscle = (dayKey, muscle) => {
    setSchedule(prev => {
      const current = toArray(prev[dayKey]);

      // If selecting "Descanso", reset the day to only Descanso
      if (muscle === 'Descanso') {
        return { ...prev, [dayKey]: ['Descanso'] };
      }

      // Remove Descanso if present when selecting a real muscle
      let updated = current.filter(m => m !== 'Descanso');

      if (updated.includes(muscle)) {
        // Deselect: remove it
        updated = updated.filter(m => m !== muscle);
        // If nothing left, default to Descanso
        if (updated.length === 0) updated = ['Descanso'];
      } else {
        // Select: add it
        updated = [...updated, muscle];
      }

      return { ...prev, [dayKey]: updated };
    });
  };

  const isSelected = (dayKey, muscle) => toArray(schedule[dayKey]).includes(muscle);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-gym-card rounded-2xl border border-slate-800 p-6 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Calendar className="h-6 w-6 text-neon-green" />
          <h2 className="text-xl font-bold text-white">Configura tu Rutina Semanal</h2>
        </div>
        <p className="text-slate-400 text-sm mb-6">
          Selecciona <span className="text-neon-green font-medium">uno o varios</span> grupos musculares para cada día. Puedes combinar músculos como Pecho + Hombros + Brazos.
        </p>

        <div className="space-y-4">
          {DAYS.map(day => {
            const selected = toArray(schedule[day.key]);
            const isRest = selected.length === 1 && selected[0] === 'Descanso';

            return (
              <div key={day.key} className={`rounded-xl border p-4 transition-all ${isRest ? 'border-slate-800 bg-slate-900/30' : 'border-neon-green/20 bg-neon-green/5'}`}>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="w-24 text-sm font-bold text-white shrink-0">{day.label}</span>
                  {/* Selected summary badges */}
                  {!isRest && selected.map(mg => (
                    <span key={mg} className={`text-xs px-2 py-0.5 rounded-full border font-medium ${MUSCLE_COLORS[mg]}`}>
                      {MUSCLE_ICONS[mg]} {mg}
                    </span>
                  ))}
                  {isRest && <span className="text-xs text-slate-500">Día de descanso</span>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {MUSCLE_GROUPS.map(mg => (
                    <button
                      key={mg}
                      onClick={() => toggleMuscle(day.key, mg)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                        isSelected(day.key, mg)
                          ? mg === 'Descanso'
                            ? 'bg-slate-700 border-slate-500 text-white'
                            : `border font-semibold ${MUSCLE_COLORS[mg]}`
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      {MUSCLE_ICONS[mg]} {mg}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 mt-8 justify-end">
          {onCancel && (
            <button onClick={onCancel} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">
              Cancelar
            </button>
          )}
          <button
            onClick={() => onSave(schedule)}
            className="flex items-center gap-2 bg-neon-green hover:bg-lime-400 text-gym-darker font-bold px-6 py-2 rounded-lg transition-colors"
          >
            <Save className="h-4 w-4" />
            Guardar Rutina
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ──────────────────────────────────────────────────────────────────
const RoutinePage = () => {
  const [routine, setRoutine] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [activeDay, setActiveDay] = useState(getTodayKey());

  const fetchData = async () => {
    setLoading(true);
    try {
      const [routineRes, exercisesRes] = await Promise.allSettled([
        api.get('/api/routines/me'),
        api.get('/api/exercises'),
      ]);
      if (routineRes.status === 'fulfilled') setRoutine(routineRes.value.data);
      else setRoutine(null);
      if (exercisesRes.status === 'fulfilled') setExercises(exercisesRes.value.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSaveRoutine = async (schedule) => {
    try {
      const res = await api.put('/api/routines/me', { weeklySchedule: schedule });
      setRoutine(res.data);
      setEditing(false);
    } catch (err) {
      alert('Error al guardar la rutina.');
    }
  };

  // Get muscle groups for the active day (always as array)
  const activeMuscles = routine ? toArray(routine.weeklySchedule?.[activeDay]) : ['Descanso'];
  const isRestDay = activeMuscles.length === 1 && activeMuscles[0] === 'Descanso';

  // Filter exercises for all active muscles (excluding Descanso)
  const todayExercises = exercises.filter(ex =>
    activeMuscles.filter(m => m !== 'Descanso').includes(ex.muscleGroup)
  );

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-neon-green animate-pulse text-lg">Cargando rutina...</div>
    </div>
  );

  if (!routine && !editing) return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <div className="inline-flex p-4 bg-neon-green/10 rounded-2xl mb-4">
        <Dumbbell className="h-12 w-12 text-neon-green" />
      </div>
      <h1 className="text-3xl font-bold text-white mb-2">¡Configura tu Rutina!</h1>
      <p className="text-slate-400 max-w-md mx-auto mb-8">
        Como miembro Premium, puedes personalizar tu rutina semanal combinando múltiples grupos musculares por día.
      </p>
      <button
        onClick={() => setEditing(true)}
        className="inline-flex items-center gap-2 bg-neon-green hover:bg-lime-400 text-gym-darker font-bold px-8 py-3 rounded-xl transition-colors text-lg"
      >
        <Calendar className="h-5 w-5" />
        Crear Mi Rutina
      </button>
    </div>
  );

  if (editing) return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <RoutineEditor
        initial={routine?.weeklySchedule}
        onSave={handleSaveRoutine}
        onCancel={routine ? () => setEditing(false) : null}
      />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Dumbbell className="h-8 w-8 text-neon-green" />
            Mi Rutina Premium
          </h1>
          <p className="text-slate-400 mt-1">Ejercicios personalizados para tu semana</p>
        </div>
        <button
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-2 bg-gym-card hover:bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Edit3 className="h-4 w-4 text-neon-green" />
          Editar Rutina
        </button>
      </div>

      {/* Weekly Overview */}
      <div className="grid grid-cols-7 gap-2 mb-8">
        {DAYS.map(day => {
          const muscles = toArray(routine.weeklySchedule?.[day.key]);
          const isRest = muscles.length === 1 && muscles[0] === 'Descanso';
          const isToday = day.key === getTodayKey();
          const isSelected = day.key === activeDay;
          const firstColor = isRest ? DAY_CARD_COLORS['Descanso'] : (DAY_CARD_COLORS[muscles[0]] || DAY_CARD_COLORS['Descanso']);

          return (
            <button
              key={day.key}
              onClick={() => setActiveDay(day.key)}
              className={`flex flex-col items-center p-2 rounded-xl border transition-all ${
                isSelected
                  ? `bg-gradient-to-b ${firstColor} to-transparent border-neon-green/50 shadow-lg scale-105`
                  : 'bg-gym-card border-slate-800 hover:border-slate-700'
              }`}
            >
              <span className={`text-xs font-bold mb-1 ${isToday ? 'text-neon-green' : 'text-slate-400'}`}>
                {day.label.slice(0, 2).toUpperCase()}
              </span>
              <span className="text-base">{getDayIcons(muscles)}</span>
              <span className="text-[10px] text-slate-500 mt-1 text-center leading-tight hidden sm:block truncate w-full">
                {isRest ? 'Descanso' : muscles.filter(m => m !== 'Descanso').join(' · ')}
              </span>
              {isToday && <span className="w-1.5 h-1.5 bg-neon-green rounded-full mt-1" />}
            </button>
          );
        })}
      </div>

      {/* Day Label & Muscle Badges */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          {activeDay === getTodayKey() && <Flame className="h-5 w-5 text-orange-400" />}
          <h2 className="text-xl font-bold text-white">
            {DAYS.find(d => d.key === activeDay)?.label}
          </h2>
        </div>
        {activeMuscles.filter(m => m !== 'Descanso').map(mg => (
          <span key={mg} className={`text-sm px-3 py-1 rounded-full border font-semibold ${MUSCLE_COLORS[mg]}`}>
            {MUSCLE_ICONS[mg]} {mg}
          </span>
        ))}
        {isRestDay && <span className="text-sm text-slate-500">Día de descanso</span>}
      </div>

      {/* Exercises */}
      {isRestDay ? (
        <div className="text-center py-16">
          <span className="text-5xl mb-4 block">😴</span>
          <h3 className="text-xl font-bold text-white mb-2">Día de Descanso</h3>
          <p className="text-slate-400">El descanso es parte fundamental del progreso. ¡Recupérate!</p>
        </div>
      ) : todayExercises.length === 0 ? (
        <div className="text-center py-16 text-slate-500">No hay ejercicios registrados para estos grupos musculares.</div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-400 text-sm">{todayExercises.length} ejercicios para hoy</p>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="h-3 w-3" />
              <span>~{Math.ceil(todayExercises.length * 8)} min estimado</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {todayExercises.map(ex => (
              <ExerciseCard key={ex._id} exercise={ex} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default RoutinePage;
