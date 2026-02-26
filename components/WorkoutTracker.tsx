
import React, { useState, useMemo } from 'react';
import { Workout, Exercise, ExerciseDefinition, SplitDay, SetLog, EquipmentType, TrainingProfile, WorkoutBlock, WorkoutBlockType } from '../types';
import { EQUIPMENT_CONFIG, COMMON_EXERCISES } from '../constants';
import { formatLocalDate, getDateDaysAgo, isOnOrAfterDate, parseDayString } from '../utils/dateUtils';

interface WorkoutTrackerProps {
  activeWorkout?: Workout;
  completedWorkouts: Workout[];
  onUpdate: (workout: Workout) => void;
  onStart: (name: string, blocks?: WorkoutBlock[], plannedExercises?: ExerciseDefinition[]) => void;
  availableExercises: ExerciseDefinition[];
  onNewExerciseCreated: (ex: ExerciseDefinition) => void;
  weeklySplit: SplitDay[];
  allHistory: Workout[];
  todayStr: string;
  trainingProfile: TrainingProfile;
}

const WorkoutTracker: React.FC<WorkoutTrackerProps> = ({
  activeWorkout,
  completedWorkouts,
  onUpdate,
  onStart,
  availableExercises,
  onNewExerciseCreated,
  weeklySplit,
  allHistory,
  todayStr,
  trainingProfile
}) => {
  const [view, setView] = useState<'active' | 'history'>(activeWorkout ? 'active' : 'history');
  const [isAdding, setIsAdding] = useState(false);
  const [newExercise, setNewExercise] = useState<{ name: string; category: string; equipment: EquipmentType }>({
    name: '',
    category: 'Chest',
    equipment: 'barbell'
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewFilter, setViewFilter] = useState<string>('All');

  // History Filters
  const [historyDateRange, setHistoryDateRange] = useState<'all' | '7' | '30'>('all');
  const [historyTypeFilter, setHistoryTypeFilter] = useState<string>('All');

  const localToday = parseDayString(todayStr);
  const dayIndex = (localToday.getDay() + 6) % 7;
  const splitDay = weeklySplit[dayIndex];
  const todayDisplayStr = formatLocalDate(localToday, { weekday: 'long', month: 'long', day: 'numeric' }, 'en-US');

  const splitCategoryMap: Record<string, string[]> = {
    push: ['Chest', 'Shoulders', 'Arms'],
    pull: ['Back', 'Arms'],
    legs: ['Legs'],
    upper: ['Chest', 'Back', 'Shoulders', 'Arms'],
    lower: ['Legs', 'Core'],
    'full body': ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'],
    strength: ['Chest', 'Back', 'Legs', 'Shoulders'],
    condition: ['Cardio'],
    endurance: ['Cardio'],
    mobility: ['Active Recovery'],
    recovery: ['Active Recovery'],
    rest: ['Active Recovery'],
  };

  const splitLabelLower = splitDay?.label.toLowerCase() || '';
  const matchedSplitKey = Object.keys(splitCategoryMap).find(k => splitLabelLower.includes(k));
  const splitFocusCategories = matchedSplitKey ? splitCategoryMap[matchedSplitKey] : [];


  const goalPrescription = useMemo(() => {
    if (trainingProfile.goal === 'strength') {
      return { sets: '3-5', reps: '3-6', rest: '2-3 min' };
    }
    if (trainingProfile.goal === 'endurance') {
      return { sets: '2-3', reps: '15-20', rest: '45-75 sec' };
    }
    return { sets: '3-4', reps: '8-12', rest: '60-90 sec' };
  }, [trainingProfile.goal]);

  const sessionBlocks = useMemo((): WorkoutBlock[] => {
    const base: WorkoutBlock[] = [
      { type: 'warmup', title: 'Warm', durationMin: 8, targetCategories: ['Cardio', 'Active Recovery'], notes: 'Light cardio + dynamic mobility' },
      { type: 'compound', title: 'Compound', durationMin: 25, targetCategories: ['Chest', 'Back', 'Legs', 'Shoulders'], recommendedRestSeconds: trainingProfile.goal === 'strength' ? 150 : 90 },
      { type: 'accessory', title: 'Isolate', durationMin: 17, targetCategories: ['Arms', 'Core', 'Shoulders', 'Legs'], recommendedRestSeconds: trainingProfile.goal === 'endurance' ? 60 : 75 },
      { type: 'cooldown', title: 'Cool', durationMin: 8, targetCategories: ['Active Recovery', 'Core'], notes: 'Static stretching + down regulation' },
    ];

    const scaling = trainingProfile.sessionLengthMin / 60;
    return base.map(block => ({
      ...block,
      durationMin: Math.max(5, Math.round(block.durationMin * scaling)),
    }));
  }, [trainingProfile.goal, trainingProfile.sessionLengthMin]);

  const [selectedBlockType, setSelectedBlockType] = useState<'all' | WorkoutBlockType>('all');

  const [plannerSelections, setPlannerSelections] = useState<Record<'compound' | 'isolate' | 'finisher', ExerciseDefinition[]>>({
    compound: [],
    isolate: [],
    finisher: [],
  });

  const findPreviousStats = (exerciseName: string) => {
    const sortedHistory = [...allHistory].filter(w => w.completed).sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    for (const workout of sortedHistory) {
      const match = workout.exercises.find(e => e.name.toLowerCase() === exerciseName.toLowerCase());
      if (match) {
        return match.sets.map(s => ({
          reps: s.reps,
          weight: s.weight,
          durationMinutes: s.durationMinutes
        }));
      }
    }
    return undefined;
  };


  const goalExercisePlan = useMemo(() => {
    if (trainingProfile.goal === 'strength') {
      return {
        compound: '2-4 exercises',
        isolate: '1-2 exercises',
        finisher: '0 finishers (prefer core/mobility)',
      };
    }
    if (trainingProfile.goal === 'endurance') {
      return {
        compound: '2-3 exercises',
        isolate: '3-4 exercises',
        finisher: '1-2 finishers',
      };
    }
    return {
      compound: '2-4 exercises',
      isolate: '3-5 exercises',
      finisher: '1-2 finishers',
    };
  }, [trainingProfile.goal]);

  const plannerPhaseConfig: Record<'compound' | 'isolate' | 'finisher', { categories: string[]; include?: string[]; exclude?: string[]; enforceSplitFocus?: boolean; splitOptionalCategories?: string[] }> = {
    compound: {
      categories: ['Chest', 'Back', 'Legs', 'Shoulders'],
      exclude: ['curl', 'extension', 'raise', 'pushdown', 'plank', 'twist', 'crunch'],
      enforceSplitFocus: true,
    },
    isolate: {
      categories: ['Arms', 'Core', 'Shoulders', 'Legs'],
      include: ['curl', 'extension', 'raise', 'pushdown', 'fly', 'plank', 'crunch', 'twist'],
      enforceSplitFocus: true,
    },
    finisher: {
      categories: ['Cardio', 'Core', 'Active Recovery'],
      include: ['assault bike', 'jump rope', 'rowing machine', 'mountain', 'carry', 'swing', 'stair'],
      splitOptionalCategories: ['Cardio', 'Core', 'Active Recovery'],
    },
  };

  const plannerSuggestions = useMemo(() => {
    const scoreForPhase = (exercise: ExerciseDefinition, phase: keyof typeof plannerPhaseConfig) => {
      const config = plannerPhaseConfig[phase];
      const lower = exercise.name.toLowerCase();
      const categoryHit = config.categories.includes(exercise.category);
      const includeHit = config.include?.some(k => lower.includes(k)) || false;
      const excludeHit = config.exclude?.some(k => lower.includes(k)) || false;

      return (categoryHit ? 20 : 0) + (includeHit ? 14 : 0) - (excludeHit ? 14 : 0);
    };

    const phaseAllowsCategory = (phase: keyof typeof plannerPhaseConfig, category: string) => {
      const config = plannerPhaseConfig[phase];
      if (!splitFocusCategories.length || !config.enforceSplitFocus) return true;
      if (splitFocusCategories.includes(category)) return true;
      return config.splitOptionalCategories?.includes(category) || false;
    };

    const phases: (keyof typeof plannerPhaseConfig)[] = ['compound', 'isolate', 'finisher'];
    return phases.reduce((acc, phase) => {
      acc[phase] = [...availableExercises]
        .filter(ex => phaseAllowsCategory(phase, ex.category))
        .map(ex => ({ ex, score: scoreForPhase(ex, phase) }))
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score || a.ex.name.localeCompare(b.ex.name))
        .slice(0, 8)
        .map(item => item.ex);
      return acc;
    }, {} as Record<'compound' | 'isolate' | 'finisher', ExerciseDefinition[]>);
  }, [availableExercises, splitFocusCategories]);

  const togglePlannerSelection = (phase: 'compound' | 'isolate' | 'finisher', exercise: ExerciseDefinition) => {
    setPlannerSelections(prev => {
      const exists = prev[phase].some(item => item.name.toLowerCase() === exercise.name.toLowerCase());
      return {
        ...prev,
        [phase]: exists
          ? prev[phase].filter(item => item.name.toLowerCase() !== exercise.name.toLowerCase())
          : [...prev[phase], exercise],
      };
    });
  };

  const plannedExercises = useMemo(() => {
    return [
      ...plannerSelections.compound,
      ...plannerSelections.isolate,
      ...plannerSelections.finisher,
    ];
  }, [plannerSelections]);

  const parseSetValue = (field: keyof SetLog, value: string): number | undefined => {
    if (value.trim() === '') return undefined;

    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return undefined;

    if (field === 'reps' || field === 'durationMinutes') {
      return Math.max(0, Math.round(parsed));
    }

    if (field === 'weight') {
      return Math.max(0, Math.round(parsed * 10) / 10);
    }

    return undefined;
  };

  const updateExerciseById = (exerciseId: string, updater: (exercise: Exercise) => Exercise) => {
    if (!activeWorkout) return;

    const exerciseIndex = activeWorkout.exercises.findIndex(e => e.id === exerciseId);
    if (exerciseIndex === -1) return;

    const updatedExercises = [...activeWorkout.exercises];
    updatedExercises[exerciseIndex] = updater(updatedExercises[exerciseIndex]);

    onUpdate({
      ...activeWorkout,
      exercises: updatedExercises,
    });
  };

  const handleSetChange = (exerciseId: string, setIndex: number, field: keyof SetLog, value: string) => {
    const parsedValue = parseSetValue(field, value);

    updateExerciseById(exerciseId, (exercise) => {
      const updatedSets = exercise.sets.map((set, index) => {
        if (index !== setIndex) return set;
        return {
          ...set,
          [field]: parsedValue,
        };
      });

      return {
        ...exercise,
        sets: updatedSets,
      };
    });
  };

  const handleEquipmentChange = (exerciseId: string, equipment: EquipmentType) => {
    updateExerciseById(exerciseId, (exercise) => ({
      ...exercise,
      equipment,
    }));
  };

  const toggleSetComplete = (exerciseId: string, setIndex: number) => {
    updateExerciseById(exerciseId, (exercise) => ({
      ...exercise,
      sets: exercise.sets.map((set, index) => index === setIndex ? { ...set, isCompleted: !set.isCompleted } : set),
    }));
  };

  const addSet = (exerciseId: string) => {
    updateExerciseById(exerciseId, (exercise) => {
      const lastSet = exercise.sets[exercise.sets.length - 1];
      const isTimed = ['Cardio', 'Active Recovery'].includes(exercise.category);

      return {
        ...exercise,
        sets: [
          ...exercise.sets,
          {
            reps: isTimed ? undefined : (lastSet?.reps ?? 0),
            weight: isTimed ? undefined : (lastSet?.weight ?? 0),
            durationMinutes: isTimed ? (lastSet?.durationMinutes ?? 0) : undefined,
            isCompleted: false,
          },
        ],
      };
    });
  };

  const removeSet = (exerciseId: string, setIndex: number) => {
    updateExerciseById(exerciseId, (exercise) => {
      if (exercise.sets.length <= 1) return exercise;
      return {
        ...exercise,
        sets: exercise.sets.filter((_, index) => index !== setIndex),
      };
    });
  };

  const addExercise = (name: string = newExercise.name, category: string = newExercise.category, equipment: EquipmentType = newExercise.equipment) => {
    if (!activeWorkout || !name.trim()) return;

    // Check if exercise already in current session
    if (activeWorkout.exercises.some(e => e.name.toLowerCase() === name.toLowerCase())) return;

    const finalCategory = category || 'Push';

    // Find exercise definition for recommendations
    const definition = availableExercises.find(ex => ex.name.toLowerCase() === name.toLowerCase())
                    || COMMON_EXERCISES.find(ex => ex.name.toLowerCase() === name.toLowerCase());

    // Check if this is a brand new exercise
    if (!definition && !availableExercises.some(ex => ex.name.toLowerCase() === name.toLowerCase())) {
      onNewExerciseCreated({ name: name.trim(), category: finalCategory });
    }

    const isTimed = ['Cardio', 'Active Recovery'].includes(finalCategory);
    const prevStats = findPreviousStats(name);
    const finalEquipment = definition?.equipment || (isTimed ? 'bodyweight' : equipment);

    // Calculate max weight from previous stats if available
    let maxPrevWeight = 0;
    if (prevStats && !isTimed) {
      maxPrevWeight = Math.max(...prevStats.map(s => s.weight || 0));
    }

    const exercise: Exercise = {
      id: Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      category: finalCategory,
      equipment: finalEquipment,
      previousStats: prevStats,
      sets: isTimed ?
        (prevStats ? prevStats.map(s => ({ durationMinutes: s.durationMinutes, isCompleted: false })) :
         (definition?.recommendedSets ? definition.recommendedSets.map(s => ({ durationMinutes: s.durationMinutes, isCompleted: false })) :
          [{ durationMinutes: 0, isCompleted: false }])) :
        (prevStats ? prevStats.map(s => ({ reps: s.reps || 10, weight: maxPrevWeight, isCompleted: false })) :
          (definition?.recommendedSets ? definition.recommendedSets.map(s => ({ reps: s.reps, weight: s.weight, isCompleted: false })) : [
            { reps: 10, weight: 0, isCompleted: false },
            { reps: 10, weight: 0, isCompleted: false },
            { reps: 10, weight: 0, isCompleted: false }
          ]))
    };

    onUpdate({
      ...activeWorkout,
      exercises: [...activeWorkout.exercises, exercise]
    });
    setNewExercise({ name: '', category: 'Chest', equipment: 'barbell' });
    setIsAdding(false);
  };

  const recommendations = useMemo(() => {
    const phaseHints: Record<WorkoutBlockType, { categories: string[]; includeKeywords?: string[]; excludeKeywords?: string[] }> = {
      warmup: {
        categories: ['Cardio', 'Active Recovery'],
        includeKeywords: ['walking', 'cycling', 'elliptical', 'mobility', 'stretch', 'foam', 'yoga']
      },
      skill_power: {
        categories: ['Legs', 'Shoulders', 'Cardio'],
        includeKeywords: ['jump', 'sprint', 'swing', 'clean', 'press']
      },
      compound: {
        categories: ['Chest', 'Back', 'Legs', 'Shoulders'],
        excludeKeywords: ['curl', 'extension', 'raise', 'pushdown', 'plank', 'crunch', 'carry', 'twist']
      },
      accessory: {
        categories: ['Arms', 'Core', 'Shoulders', 'Legs'],
        includeKeywords: ['curl', 'extension', 'raise', 'pushdown', 'plank', 'crunch', 'carry', 'twist', 'fly']
      },
      cooldown: {
        categories: ['Active Recovery', 'Core'],
        includeKeywords: ['stretch', 'mobility', 'foam', 'yoga', 'pilates', 'cool']
      },
    };

    const splitCategories = splitFocusCategories;
    const phaseConfig = selectedBlockType === 'all' ? null : phaseHints[selectedBlockType];

    const exercisesInSession = new Set((activeWorkout?.exercises || []).map(e => e.name.toLowerCase()));
    const recentCompleted = allHistory
      .filter(w => w.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    const frequencyByName = recentCompleted.reduce<Record<string, number>>((acc, workout) => {
      workout.exercises.forEach(ex => {
        const key = ex.name.toLowerCase();
        acc[key] = (acc[key] || 0) + 1;
      });
      return acc;
    }, {});

    const latestIndexByName = recentCompleted.reduce<Record<string, number>>((acc, workout, index) => {
      workout.exercises.forEach(ex => {
        const key = ex.name.toLowerCase();
        if (acc[key] === undefined) acc[key] = index;
      });
      return acc;
    }, {});

    const basePool = availableExercises.filter(ex => !exercisesInSession.has(ex.name.toLowerCase()));

    const scored = basePool
      .map(ex => {
        const key = ex.name.toLowerCase();
        const frequencyPenalty = frequencyByName[key] || 0;
        const recencyPenalty = latestIndexByName[key] === undefined ? 0 : (10 - latestIndexByName[key]);
        const splitBonus = splitCategories.includes(ex.category) ? 20 : 0;

        let phaseBonus = 0;
        let phasePenalty = 0;
        if (phaseConfig) {
          const lowerName = ex.name.toLowerCase();
          const inPhaseCategory = phaseConfig.categories.includes(ex.category);
          const includeHit = phaseConfig.includeKeywords?.some(keyword => lowerName.includes(keyword)) || false;
          const excludeHit = phaseConfig.excludeKeywords?.some(keyword => lowerName.includes(keyword)) || false;

          if (inPhaseCategory) phaseBonus += 24;
          if (includeHit) phaseBonus += 18;
          if (excludeHit) phasePenalty += 16;
        }

        const noveltyBonus = frequencyByName[key] ? 0 : 10;
        const score = splitBonus + phaseBonus + noveltyBonus - phasePenalty - (frequencyPenalty * 6) - recencyPenalty;

        return { exercise: ex, score };
      })
      .sort((a, b) => b.score - a.score || a.exercise.name.localeCompare(b.exercise.name));

    const trimmed = scored.filter(item => selectedBlockType === 'all' || item.score > 6).slice(0, 6);

    if (trimmed.length === 0 && selectedBlockType !== 'all') {
      return scored.slice(0, 6).map(item => item.exercise);
    }

    return trimmed.map(item => item.exercise);
  }, [splitDay, availableExercises, activeWorkout, allHistory, selectedBlockType]);

  const workoutBlocksForView = useMemo(() => activeWorkout?.blocks?.length ? activeWorkout.blocks : sessionBlocks, [activeWorkout?.blocks, sessionBlocks]);

  const blockTitleByType = useMemo(() => {
    return workoutBlocksForView.reduce<Record<WorkoutBlockType, string>>((acc, block) => {
      acc[block.type] = block.title;
      return acc;
    }, {
      warmup: 'Warm',
      skill_power: 'Compound',
      compound: 'Compound',
      accessory: 'Isolate',
      cooldown: 'Cool',
    });
  }, [workoutBlocksForView]);

  const detectExercisePhase = (exercise: Exercise): WorkoutBlockType => {
    const lower = exercise.name.toLowerCase();

    if (exercise.category === 'Cardio' || exercise.category === 'Active Recovery') {
      if (lower.includes('stretch') || lower.includes('mobility') || lower.includes('cool')) return 'cooldown';
      if (lower.includes('jump') || lower.includes('sprint') || lower.includes('swing')) return 'compound';
      return 'warmup';
    }

    if (['Chest', 'Back', 'Legs'].includes(exercise.category)) return 'compound';
    if (exercise.category === 'Shoulders' && (lower.includes('press') || lower.includes('push press'))) return 'compound';
    if (['Arms', 'Core'].includes(exercise.category)) return 'accessory';
    if (exercise.category === 'Shoulders') return 'accessory';

    return 'accessory';
  };

  const phaseFilters = useMemo(() => {
    const present = new Set((activeWorkout?.exercises || []).map(ex => detectExercisePhase(ex)));
    return ['All', ...workoutBlocksForView.filter(block => present.has(block.type)).map(block => block.title)];
  }, [activeWorkout, workoutBlocksForView]);

  const groupedExercises = useMemo(() => {
    if (!activeWorkout) return [] as Array<{ blockType: WorkoutBlockType; title: string; exercises: Exercise[] }>;

    const grouped: Record<WorkoutBlockType, Exercise[]> = {
      warmup: [],
      skill_power: [],
      compound: [],
      accessory: [],
      cooldown: [],
    };

    activeWorkout.exercises.forEach(ex => {
      const blockType = detectExercisePhase(ex);
      const blockTitle = blockTitleByType[blockType];
      if (viewFilter !== 'All' && viewFilter !== blockTitle) return;
      grouped[blockType].push(ex);
    });

    return workoutBlocksForView
      .map(block => ({ blockType: block.type, title: block.title, exercises: grouped[block.type] || [] }))
      .filter(group => group.exercises.length > 0);
  }, [activeWorkout, viewFilter, workoutBlocksForView, blockTitleByType]);

  const uniqueWorkoutNames = useMemo(() => {
    const names = new Set(completedWorkouts.map(w => w.name));
    return ['All', ...Array.from(names)];
  }, [completedWorkouts]);

  const displayedHistory = useMemo(() => {
    let filtered = [...completedWorkouts];

    // Date filtering
    if (historyDateRange !== 'all') {
      const cutoff = getDateDaysAgo(Number(historyDateRange));
      filtered = filtered.filter(w => isOnOrAfterDate(w.date, cutoff));
    }

    // Type filtering
    if (historyTypeFilter !== 'All') {
      filtered = filtered.filter(w => w.name === historyTypeFilter);
    }

    return filtered;
  }, [completedWorkouts, historyDateRange, historyTypeFilter]);

  const progressionByWorkoutId = useMemo(() => {
    const completed = allHistory
      .filter(w => w.completed)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const latestMetricsByExercise: Record<string, { bestWeight: number; bestReps: number; totalDuration: number }> = {};
    const result: Record<string, string[]> = {};

    completed.forEach((workout) => {
      const notes: string[] = [];

      workout.exercises.forEach((exercise) => {
        const key = exercise.name.toLowerCase();
        const previous = latestMetricsByExercise[key];

        const bestWeight = Math.max(...exercise.sets.map(s => s.weight || 0), 0);
        const bestReps = Math.max(...exercise.sets.map(s => s.reps || 0), 0);
        const totalDuration = exercise.sets.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);

        if (previous) {
          if (bestWeight > previous.bestWeight) {
            notes.push(`${exercise.name} +${(bestWeight - previous.bestWeight).toFixed(1)} lb`);
          } else if (bestReps > previous.bestReps) {
            notes.push(`${exercise.name} +${bestReps - previous.bestReps} reps`);
          } else if (totalDuration > previous.totalDuration) {
            notes.push(`${exercise.name} +${totalDuration - previous.totalDuration} min`);
          }
        }

        latestMetricsByExercise[key] = { bestWeight, bestReps, totalDuration };
      });

      result[workout.id] = notes.slice(0, 2);
    });

    return result;
  }, [allHistory]);

  const filteredSuggestions = useMemo(() => {
    if (!newExercise.name.trim()) return [];
    const lowerName = newExercise.name.toLowerCase();
    const matches = availableExercises.filter(ex =>
      ex.name.toLowerCase().includes(lowerName) ||
      ex.category.toLowerCase().includes(lowerName)
    ).slice(0, 5);

    return matches;
  }, [newExercise.name, availableExercises]);

  const showCreateNew = useMemo(() => {
    if (!newExercise.name.trim()) return false;
    return !availableExercises.some(ex => ex.name.toLowerCase() === newExercise.name.toLowerCase());
  }, [newExercise.name, availableExercises]);

  const handleFinishSession = () => {
    if (!activeWorkout) return;

    const totalSets = activeWorkout.exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0);
    const completedSets = activeWorkout.exercises.reduce(
      (sum, exercise) => sum + exercise.sets.filter(set => set.isCompleted).length,
      0,
    );

    if (totalSets > 0 && completedSets < totalSets) {
      const shouldFinish = window.confirm(
        `You have ${totalSets - completedSets} incomplete set${totalSets - completedSets === 1 ? '' : 's'}. Finish anyway?`,
      );
      if (!shouldFinish) return;
    }

    onUpdate({ ...activeWorkout, completed: true });
    setView('history');
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-24">
      {/* View Toggle */}
      <div className="bg-stone-100 p-1 rounded-2xl flex">
        <button
          onClick={() => setView('active')}
          className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${
            view === 'active' ? 'bg-white text-[#7c9082] shadow-sm' : 'text-stone-400'
          }`}
        >
          {activeWorkout ? 'Active Session' : 'Start Session'}
        </button>
        <button
          onClick={() => setView('history')}
          className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${
            view === 'history' ? 'bg-white text-[#7c9082] shadow-sm' : 'text-stone-400'
          }`}
        >
          History
        </button>
      </div>

      {view === 'active' ? (
        !activeWorkout ? (
          <div className="space-y-6">
            <header className="text-center pt-4">
              <h3 className="serif text-2xl text-stone-800">Workout Planner</h3>
              <p className="text-sm text-stone-400 mt-1">Plan your phases, then start and track your session.</p>
              <p className="text-[11px] text-[#7c9082] mt-2 font-semibold">{splitDay.label} focus: {splitFocusCategories.join(' • ') || 'General'}</p>
            </header>

            <div className="bg-white border border-stone-100 rounded-[2rem] p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Goal-aligned structure</p>
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#7c9082]">{trainingProfile.goal}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {sessionBlocks.map((block) => (
                  <div key={block.type} className="bg-stone-50 border border-stone-100 rounded-2xl px-3 py-2.5 text-center min-h-[64px] flex flex-col justify-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">{block.title}</p>
                    <p className="text-[11px] text-stone-400 mt-1 font-medium">{block.durationMin} min</p>
                  </div>
                ))}
              </div>

              <div className="bg-stone-50 rounded-2xl px-4 py-3 text-[11px] text-stone-500 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <span><strong>Sets:</strong> {goalPrescription.sets}</span>
                <span><strong>Reps:</strong> {goalPrescription.reps}</span>
                <span><strong>Rest:</strong> {goalPrescription.rest}</span>
              </div>
            </div>

            <div className="space-y-4">
              {([
                { key: 'compound', title: 'Compound', target: goalExercisePlan.compound },
                { key: 'isolate', title: 'Isolate', target: goalExercisePlan.isolate },
                { key: 'finisher', title: 'Finisher', target: goalExercisePlan.finisher },
              ] as const).map((phase) => (
                <section key={phase.key} className="bg-white border border-stone-100 rounded-[2rem] p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-stone-500">{phase.title}</h4>
                    <span className="text-[10px] text-[#7c9082] font-bold">{phase.target}</span>
                  </div>
                  {plannerSuggestions[phase.key].length === 0 ? (
                    <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50 p-3 text-[11px] text-stone-400">
                      No {phase.title.toLowerCase()} suggestions match your {splitDay.label.toLowerCase()} focus yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {plannerSuggestions[phase.key].map((ex) => {
                        const selected = plannerSelections[phase.key].some(item => item.name.toLowerCase() === ex.name.toLowerCase());
                        return (
                          <button
                            key={ex.name}
                            onClick={() => togglePlannerSelection(phase.key, ex)}
                            className={`text-left px-3 py-2 rounded-xl border transition-all ${selected ? 'bg-[#7c9082]/10 border-[#7c9082]/30' : 'bg-stone-50 border-stone-100 hover:border-stone-200'}`}
                          >
                            <span className="text-[11px] font-semibold text-stone-700 block leading-tight">{ex.name}</span>
                            <span className="text-[9px] text-stone-400 uppercase tracking-wide">{ex.category}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </section>
              ))}
            </div>

            <div className="bg-white border border-stone-100 rounded-[2rem] p-5 shadow-sm flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Planned exercises</p>
                <p className="text-sm text-stone-600 mt-1">{plannedExercises.length} selected across phases</p>
              </div>
              <button
                onClick={() => onStart(`${splitDay?.label || 'Workout'} Session`, sessionBlocks, plannedExercises)}
                className="px-8 py-3 bg-[#7c9082] text-white rounded-full font-semibold text-sm shadow-xl shadow-[#7c9082]/20 active:scale-95 transition-all"
              >
                Start Workout
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <header className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#d4a373]">{todayDisplayStr}</span>
                  <span className="text-[10px] font-bold text-stone-300">•</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#7c9082]">{splitDay.label} Day</span>
                </div>
                <h2 className="serif text-2xl text-stone-800">{activeWorkout.name}</h2>
              </div>
              <button
                onClick={() => setIsAdding(!isAdding)}
                className="w-10 h-10 rounded-full bg-[#7c9082] flex items-center justify-center text-white hover:bg-[#6b7d70] transition-all shadow-lg"
              >
                <span className="text-xl">{isAdding ? '✕' : '+'}</span>
              </button>
            </header>

            {/* Recommendations Bar */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              <button
                onClick={() => setSelectedBlockType('all')}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap border ${selectedBlockType === 'all' ? 'bg-[#7c9082] border-[#7c9082] text-white' : 'bg-white border-stone-100 text-stone-400'}`}
              >
                All
              </button>
              {sessionBlocks.map((block) => (
                <button
                  key={block.type}
                  onClick={() => setSelectedBlockType(block.type)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap border ${selectedBlockType === block.type ? 'bg-[#7c9082] border-[#7c9082] text-white' : 'bg-white border-stone-100 text-stone-400'}`}
                >
                  {block.title}
                </button>
              ))}
            </div>

            {/* Recommendations Bar */}
            {!isAdding && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                    Suggested for {selectedBlockType === 'all' ? splitDay.label : sessionBlocks.find(b => b.type === selectedBlockType)?.title}
                  </h3>
                  {selectedBlockType !== 'all' && (
                    <span className="text-[9px] text-[#7c9082] font-bold uppercase tracking-widest">phase filtered</span>
                  )}
                </div>

                {recommendations.length === 0 ? (
                  <div className="bg-stone-50 border border-stone-100 rounded-2xl p-4 text-[11px] text-stone-400">
                    No direct matches for this phase yet. Try “Show All” or add a custom exercise.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {recommendations.map((ex, i) => (
                      <button
                        key={i}
                        onClick={() => addExercise(ex.name, ex.category)}
                        className="bg-white border border-stone-100 px-4 py-3 rounded-2xl shadow-sm text-left hover:border-[#7c9082] transition-colors"
                      >
                        <span className="text-xs font-bold text-stone-700 leading-tight mb-1 block">{ex.name}</span>
                        <span className="text-[9px] font-bold uppercase tracking-tighter text-stone-300">{ex.category}</span>
                        <span className="mt-1 block text-[9px] text-stone-300">
                          {ex.equipment ? `${EQUIPMENT_CONFIG[ex.equipment].icon} ${EQUIPMENT_CONFIG[ex.equipment].label}` : 'No Equipment Info'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeWorkout.exercises.length > 0 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {phaseFilters.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setViewFilter(cat)}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                      viewFilter === cat ? 'bg-[#7c9082] text-white' : 'bg-stone-50 text-stone-400'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {isAdding && (
              <div className="bg-white rounded-3xl p-6 border-2 border-[#7c9082]/20 shadow-xl animate-in fade-in zoom-in-95">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Add Exercise</h3>
                </div>
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search or name a new lift..."
                      className="w-full bg-stone-50 p-4 rounded-2xl text-sm focus:outline-none border border-stone-100"
                      value={newExercise.name}
                      onChange={e => setNewExercise({ ...newExercise, name: e.target.value })}
                      autoFocus
                    />
                    {(filteredSuggestions.length > 0 || showCreateNew) && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-100 rounded-2xl shadow-xl overflow-hidden z-20 max-h-60 overflow-y-auto">
                        {filteredSuggestions.map((sug, i) => (
                          <button
                            key={i}
                            onClick={() => addExercise(sug.name, sug.category)}
                            className="w-full text-left px-4 py-3 hover:bg-stone-50 flex justify-between items-center border-b border-stone-50 last:border-0"
                          >
                            <span className="text-sm font-medium text-stone-700">{sug.name}</span>
                            <span className="text-[10px] bg-stone-100 px-2 py-0.5 rounded-full text-stone-400 uppercase tracking-tighter">{sug.category}</span>
                          </button>
                        ))}
                        {showCreateNew && (
                          <button
                            onClick={() => addExercise()}
                            className="w-full text-left px-4 py-3 bg-[#7c9082]/5 hover:bg-[#7c9082]/10 flex justify-between items-center"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-[#7c9082]">Create "{newExercise.name}"</span>
                            </div>
                            <span className="text-[9px] font-bold text-[#7c9082] uppercase tracking-widest bg-white px-2 py-0.5 rounded-full shadow-sm">Custom</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-stone-300 uppercase tracking-widest ml-1">Category</label>
                      <select
                        className="w-full bg-stone-50 p-3 rounded-xl text-xs outline-none border border-stone-100 font-medium text-stone-600 appearance-none"
                        value={newExercise.category}
                        onChange={e => setNewExercise({ ...newExercise, category: e.target.value })}
                      >
                        <option value="Chest">Chest</option>
                        <option value="Back">Back</option>
                        <option value="Legs">Legs</option>
                        <option value="Shoulders">Shoulders</option>
                        <option value="Arms">Arms</option>
                        <option value="Core">Core</option>
                        <option value="Cardio">Cardio</option>
                        <option value="Active Recovery">Active Recovery</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-stone-300 uppercase tracking-widest ml-1">Equipment</label>
                      <select
                        className="w-full bg-stone-50 p-3 rounded-xl text-xs outline-none border border-stone-100 font-medium text-stone-600 appearance-none"
                        value={newExercise.equipment}
                        onChange={e => setNewExercise({ ...newExercise, equipment: e.target.value as EquipmentType })}
                      >
                        {Object.entries(EQUIPMENT_CONFIG).map(([key, config]) => (
                          <option key={key} value={key}>{config.icon} {config.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() => addExercise()}
                    disabled={!newExercise.name.trim()}
                    className="w-full bg-[#7c9082] text-white py-4 rounded-2xl text-sm font-bold shadow-md shadow-[#7c9082]/20 disabled:opacity-50"
                  >
                    Add Exercise
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-10">
              {groupedExercises.map(({ blockType, title, exercises }) => (
                <div key={blockType} className="space-y-4">
                  <div className="flex items-center gap-3 px-2">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#d4a373]">{title}</h3>
                    <div className="h-px flex-1 bg-stone-100"></div>
                  </div>
                  {exercises.map((exercise) => {
                    const isTimed = ['Cardio', 'Active Recovery'].includes(exercise.category);
                    return (
                      <div key={exercise.id} className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm relative">
                        <div className="flex justify-between items-start mb-4">
                          <div className="space-y-1">
                            <h3 className="font-semibold text-stone-700">{exercise.name}</h3>
                            {!isTimed && (
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-bold uppercase text-[#7c9082] bg-[#7c9082]/5 px-2 py-0.5 rounded-full">
                                  {EQUIPMENT_CONFIG[exercise.equipment || 'barbell'].icon} {EQUIPMENT_CONFIG[exercise.equipment || 'barbell'].label}
                                </span>
                                <select
                                  className="text-[9px] font-bold uppercase text-stone-300 bg-transparent border-none outline-none appearance-none cursor-pointer hover:text-stone-400"
                                  value={exercise.equipment || 'barbell'}
                                  onChange={(e) => handleEquipmentChange(exercise.id, e.target.value as EquipmentType)}
                                >
                                  {Object.entries(EQUIPMENT_CONFIG).map(([key, config]) => (
                                    <option key={key} value={key}>Change to {config.label}</option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>
                          <button onClick={() => setEditingId(editingId === exercise.id ? null : exercise.id)} className="text-stone-300">•••</button>
                        </div>
                        {editingId === exercise.id && (
                          <div className="absolute right-6 top-14 bg-white border border-stone-200 shadow-xl rounded-xl p-1 z-10">
                            <button onClick={() => {
                              onUpdate({...activeWorkout, exercises: activeWorkout.exercises.filter(e => e.id !== exercise.id)});
                              setEditingId(null);
                            }} className="text-red-500 text-xs px-4 py-2 hover:bg-red-50 w-full text-left font-medium">Remove</button>
                          </div>
                        )}
                        <div className={`grid ${isTimed ? 'grid-cols-4' : 'grid-cols-5'} gap-2 mb-2 text-[9px] font-bold uppercase tracking-widest text-stone-300 px-2`}>
                          <div>{isTimed ? 'RND' : 'SET'}</div>
                          <div>PREV</div>
                          {isTimed ? <div>TIME</div> : <><div className="text-center">LBS</div><div className="text-center">REPS</div></>}
                          <div></div>
                        </div>
                        <div className="space-y-2">
                          {exercise.sets.map((set, idx) => {
                            const prev = exercise.previousStats?.[idx];
                            return (
                              <div key={idx} className={`grid ${isTimed ? 'grid-cols-4' : 'grid-cols-5'} gap-2 items-center p-2 rounded-xl transition-all ${set.isCompleted ? 'bg-[#7c9082]/5' : 'bg-stone-50'}`}>
                                <div className="text-[10px] font-bold text-stone-400">#{idx + 1}</div>
                                <div className="text-[8px] text-stone-300 font-medium">
                                  {prev ? (isTimed ? `${prev.durationMinutes}m` : `${prev.weight}x${prev.reps}`) : '--'}
                                </div>
                                {isTimed ? (
                                  <input type="number" min={0} step={1} className="w-full bg-transparent text-center text-sm font-semibold outline-none border-b border-stone-200" value={set.durationMinutes ?? ''} onChange={(e) => handleSetChange(exercise.id, idx, 'durationMinutes', e.target.value)} />
                                ) : (
                                  <>
                                    <input type="number" min={0} step={0.5} className="w-full bg-transparent text-center text-sm font-semibold outline-none border-b border-stone-200" value={set.weight ?? ''} onChange={(e) => handleSetChange(exercise.id, idx, 'weight', e.target.value)} />
                                    <input type="number" min={0} step={1} className="w-full bg-transparent text-center text-sm font-semibold outline-none border-b border-stone-200" value={set.reps ?? ''} onChange={(e) => handleSetChange(exercise.id, idx, 'reps', e.target.value)} />
                                  </>
                                )}
                                <div className="flex justify-end gap-1">
                                  <button onClick={() => removeSet(exercise.id, idx)} className="w-5 h-5 text-stone-200">✕</button>
                                  <button onClick={() => toggleSetComplete(exercise.id, idx)} className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${set.isCompleted ? 'bg-[#7c9082] text-white' : 'bg-white border border-stone-100 text-stone-100'}`}>{set.isCompleted ? '✓' : ''}</button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <button onClick={() => addSet(exercise.id)} className="w-full mt-4 py-2 text-[10px] font-bold text-[#7c9082] uppercase">+ Add {isTimed ? 'Round' : 'Set'}</button>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            <button
              onClick={handleFinishSession}
              className="w-full bg-[#7c9082] text-white py-5 rounded-3xl font-semibold shadow-xl shadow-[#7c9082]/20 hover:bg-[#6b7d70] transition-all"
            >
              Finish & Log Session
            </button>
          </div>
        )
      ) : (
        <div className="space-y-6">
          <header>
            <h3 className="serif text-xl text-stone-800">Your Journey</h3>
            <p className="text-sm text-stone-400">Past sessions and performance history.</p>
          </header>

          {/* History Filters UI */}
          <div className="space-y-4">
            {/* Date Range Filters */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {[
                { label: 'All Time', value: 'all' },
                { label: 'Last 7 Days', value: '7' },
                { label: 'Last 30 Days', value: '30' }
              ].map((range) => (
                <button
                  key={range.value}
                  onClick={() => setHistoryDateRange(range.value as any)}
                  className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border ${
                    historyDateRange === range.value
                      ? 'bg-[#7c9082] border-[#7c9082] text-white shadow-md'
                      : 'bg-white border-stone-100 text-stone-400'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>

            {/* Type Filters */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {uniqueWorkoutNames.map((name) => (
                <button
                  key={name}
                  onClick={() => setHistoryTypeFilter(name)}
                  className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border ${
                    historyTypeFilter === name
                      ? 'bg-[#d4a373] border-[#d4a373] text-white shadow-md'
                      : 'bg-white border-stone-100 text-stone-400'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {displayedHistory.length === 0 ? (
            <div className="py-20 text-center text-stone-300 italic text-sm border-2 border-dashed border-stone-50 rounded-[2.5rem]">
              No workouts found with these filters.
            </div>
          ) : (
            <div className="space-y-4">
              {displayedHistory.map((workout: Workout) => (
                <div key={workout.id} className="bg-white p-5 rounded-3xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold text-stone-700 group-hover:text-[#7c9082] transition-colors">{workout.name}</h4>
                      <p className="text-[10px] text-stone-400 font-medium">
                        {formatLocalDate(workout.date, { month: 'short', day: 'numeric', year: 'numeric' }, 'en-US')}
                      </p>
                    </div>
                    <span className="text-[10px] bg-stone-50 px-2 py-1 rounded-full text-stone-400 font-bold uppercase">
                      {(workout.exercises?.length || 0)} lifts
                    </span>
                  </div>
                  {progressionByWorkoutId[workout.id]?.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {progressionByWorkoutId[workout.id].map((note, idx) => (
                        <span key={idx} className="text-[9px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg font-medium">
                          ↗ {note}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {workout.exercises && workout.exercises.map((ex: Exercise, i: number) => (
                      <span key={i} className="text-[9px] bg-stone-50 text-stone-500 px-2 py-1 rounded-lg flex items-center gap-1">
                        {ex.equipment && <span>{EQUIPMENT_CONFIG[ex.equipment].icon}</span>}
                        {ex.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkoutTracker;
