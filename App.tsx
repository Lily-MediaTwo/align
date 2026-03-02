
import React, { useState, useEffect, useMemo } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import WorkoutTracker from './components/WorkoutTracker';
import HydrationPacer from './components/HydrationPacer';
import MoodJournal from './components/MoodJournal';
import AlignmentCenter from './components/AlignmentCenter';
import { AppState, MoodEntry, Workout, HydrationLog, ExerciseDefinition, CycleConfig, UserGoal, WorkoutBlock, Exercise, EquipmentType, TrainingProgram } from './types';
import { DEFAULT_TRAINING_PROGRAM, INITIAL_STATE } from './constants';
import { getDateDaysAgo, getTodayString, isOnOrAfterDate, isSameLocalDay } from './utils/dateUtils';

const App: React.FC = () => {
  const normalizeExerciseDefinition = (exercise: any): ExerciseDefinition => ({
    name: exercise.name,
    category: exercise.category || 'Core',
    equipment: exercise.equipment || 'bodyweight',
    recommendedSets: typeof exercise.recommendedSets === 'number'
      ? exercise.recommendedSets
      : Array.isArray(exercise.recommendedSets) ? exercise.recommendedSets.length || 3 : 3,
    primaryMuscles: exercise.primaryMuscles || ['core'],
    movementPattern: exercise.movementPattern || 'isolation',
    isCompound: typeof exercise.isCompound === 'boolean' ? exercise.isCompound : false,
    defaultRepRange: exercise.defaultRepRange || [8, 12],
    defaultRestSec: exercise.defaultRestSec || 60,
    difficulty: exercise.difficulty || 'beginner',
  });
  const [activeTab, setActiveTab] = useState('home');
  const [dayTick, setDayTick] = useState(() => getTodayString());
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('align_state');
    if (saved) {
      const parsed = JSON.parse(saved);

      const mergedAvailableExercises = [
        ...(INITIAL_STATE.availableExercises || []),
        ...(parsed.availableExercises || []),
      ].map(normalizeExerciseDefinition).reduce((acc, exercise) => {
        const key = exercise.name.toLowerCase();
        if (!acc.some(existing => existing.name.toLowerCase() === key)) {
          acc.push(exercise);
        }
        return acc;
      }, [] as typeof INITIAL_STATE.availableExercises);

      return {
        ...INITIAL_STATE,
        ...parsed,
        availableExercises: mergedAvailableExercises,
        hydrationGoals: parsed.hydrationGoals || { [INITIAL_STATE.todayStr]: INITIAL_STATE.dailyHydrationGoal },
        trainingProgram: parsed.trainingProgram || {
          goal: parsed.programSettings?.goal || parsed.trainingProfile?.goal || DEFAULT_TRAINING_PROGRAM.goal,
          daysPerWeek: parsed.programSettings?.daysPerWeek || parsed.trainingProfile?.daysPerWeek || DEFAULT_TRAINING_PROGRAM.daysPerWeek,
          emphasis: parsed.programSettings?.emphasis === 'glutes_legs_3x' ? 'glutes_legs' : (parsed.programSettings?.emphasis || DEFAULT_TRAINING_PROGRAM.emphasis),
          sessionLengthMin: parsed.programSettings?.sessionLengthMin || parsed.trainingProfile?.sessionLengthMin || DEFAULT_TRAINING_PROGRAM.sessionLengthMin,
          conditioningPreference: parsed.trainingProgram?.conditioningPreference || 'none',
        }
      };
    }
    return INITIAL_STATE;
  });

  useEffect(() => {
    localStorage.setItem('align_state', JSON.stringify(state));
  }, [state]);

  // Refresh todayStr every minute to handle day changes
  useEffect(() => {
    const interval = setInterval(() => {
      const current = getTodayString();
      if (current !== dayTick) {
        setDayTick(current);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [dayTick]);

  // Auto-complete workouts from previous days
  useEffect(() => {
    let changed = false;
    const today = new Date();
    const updatedWorkouts = state.workouts.map(w => {
      if (!w.completed && !isSameLocalDay(w.date, today)) {
        changed = true;
        return { ...w, completed: true };
      }
      return w;
    });
    
    if (changed) {
      setState(prev => ({ ...prev, workouts: updatedWorkouts }));
    }
  }, [state.workouts, dayTick]);

  // Derived state for goals based on behavior
  const processedState = useMemo(() => {
    const newState = { ...state, todayStr: dayTick };
    const oneWeekAgo = getDateDaysAgo(7);
    
    newState.goals = state.goals.map(goal => {
      let current = goal.current;
      
      if (goal.autoTrack === 'workouts' && goal.type === 'weekly') {
        current = state.workouts.filter(w => w.completed && isOnOrAfterDate(w.date, oneWeekAgo)).length;
      } else if (goal.autoTrack === 'hydration' && goal.type === 'weekly') {
        // Simple weekly sum for hydration
        current = state.hydration.filter(h => isOnOrAfterDate(h.date, oneWeekAgo)).reduce((acc, h) => acc + h.amountOz, 0);
      }

      return {
        ...goal,
        current,
        progress: Math.min(100, Math.floor((current / goal.target) * 100))
      };
    });

    return newState;
  }, [state, dayTick]);

  const addHydration = (oz: number) => {
    if (!Number.isFinite(oz) || oz <= 0) return;

    const normalizedAmount = Math.round(oz);
    const now = new Date();
    const localDateStr = getTodayString();

    setState(prev => {
      const latestLog = prev.hydration[prev.hydration.length - 1];
      if (latestLog) {
        const secondsSinceLast = (now.getTime() - new Date(latestLog.timestamp).getTime()) / 1000;
        const isLikelyDuplicate = secondsSinceLast <= 2 && latestLog.amountOz === normalizedAmount && latestLog.date === localDateStr;
        if (isLikelyDuplicate) {
          return prev;
        }
      }

      const newLog: HydrationLog = {
        id: Math.random().toString(36).substr(2, 9),
        date: localDateStr,
        amountOz: normalizedAmount,
        timestamp: now.toISOString()
      };

      return {
        ...prev,
        hydration: [...prev.hydration, newLog]
      };
    });
  };

  const updateHydrationGoal = (goal: number) => {
    const normalizedGoal = Math.max(1, Math.round(goal));

    setState(prev => ({
      ...prev,
      dailyHydrationGoal: normalizedGoal,
      hydrationGoals: {
        ...prev.hydrationGoals,
        [dayTick]: normalizedGoal
      }
    }));
  };

  const addMood = (entry: Omit<MoodEntry, 'id' | 'date'>) => {
    const newEntry: MoodEntry = {
      ...entry,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString()
    };
    setState(prev => ({
      ...prev,
      moods: [...prev.moods, newEntry]
    }));
  };

  const addGoal = (goal: Omit<UserGoal, 'id' | 'progress' | 'current'>) => {
    const newGoal: UserGoal = {
      ...goal,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      current: 0
    };
    setState(prev => ({
      ...prev,
      goals: [...prev.goals, newGoal]
    }));
  };

  const deleteGoal = (id: string) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.filter(g => g.id !== id)
    }));
  };

  const updateWorkout = (workout: Workout) => {
    setState(prev => {
      const exists = prev.workouts.find(w => w.id === workout.id);
      const newWorkouts = exists 
        ? prev.workouts.map(w => w.id === workout.id ? workout : w)
        : [...prev.workouts, workout];

      return {
        ...prev,
        workouts: newWorkouts
      };
    });
  };

  const startNewWorkout = (name: string, blocks?: WorkoutBlock[], plannedExercises: ExerciseDefinition[] = []) => {
    const toExercise = (definition: ExerciseDefinition): Exercise => {
      const isTimed = ['Cardio', 'Active Recovery'].includes(definition.category);
      const setCount = Math.max(1, definition.recommendedSets || 3);
      const [repMin, repMax] = definition.defaultRepRange || [8, 12];

      return {
        id: Math.random().toString(36).substr(2, 9),
        name: definition.name,
        category: definition.category,
        equipment: (definition.equipment || (isTimed ? 'bodyweight' : 'barbell')) as EquipmentType,
        sets: Array.from({ length: setCount }).map(() => ({
          reps: isTimed ? undefined : repMax,
          weight: isTimed ? undefined : 0,
          durationMinutes: isTimed ? 10 : undefined,
          isCompleted: false,
        })),
      };
    };

    const newWorkout: Workout = {
      id: Math.random().toString(36).substr(2, 9),
      name: name,
      date: new Date().toISOString(),
      exercises: plannedExercises.map(toExercise),
      completed: false,
      blocks
    };
    setState(prev => ({
      ...prev,
      workouts: [...prev.workouts, newWorkout]
    }));
  };

  const updateCycleConfig = (config: Partial<CycleConfig>) => {
    setState(prev => ({
      ...prev,
      cycleConfig: { ...prev.cycleConfig, ...config }
    }));
  };

  const handleNewExerciseCreated = (ex: ExerciseDefinition) => {
    setState(prev => ({
      ...prev,
      availableExercises: [...prev.availableExercises, normalizeExerciseDefinition(ex)]
    }));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Dashboard state={processedState} />;
      case 'workouts':
        const activeWorkout = processedState.workouts.find(w => !w.completed);
        const completedWorkouts = processedState.workouts.filter(w => w.completed).reverse();
        return (
          <WorkoutTracker 
            activeWorkout={activeWorkout} 
            completedWorkouts={completedWorkouts}
            onUpdate={updateWorkout} 
            onStart={startNewWorkout}
            trainingProgram={processedState.trainingProgram}
            availableExercises={processedState.availableExercises}
            onNewExerciseCreated={handleNewExerciseCreated}
            allHistory={processedState.workouts}
            todayStr={dayTick}
          />
        );
      case 'hydration':
        return (
          <HydrationPacer 
            logs={processedState.hydration}
            dailyGoal={processedState.dailyHydrationGoal}
            hydrationGoals={processedState.hydrationGoals}
            todayStr={dayTick}
            onAdd={addHydration} 
            onUpdateGoal={updateHydrationGoal}
          />
        );
      case 'mood':
        return <MoodJournal moods={processedState.moods} onAdd={addMood} />;
      case 'goals':
        return (
          <AlignmentCenter 
            state={processedState} 
            onUpdateCycle={updateCycleConfig}
            onAddGoal={addGoal}
            onDeleteGoal={deleteGoal}
            onUpdateTrainingProgram={(program: Partial<TrainingProgram>) => setState(prev => ({ ...prev, trainingProgram: { ...prev.trainingProgram, ...program } }))}
          />
        );
      default:
        return <Dashboard state={processedState} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;
