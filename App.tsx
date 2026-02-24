
import React, { useState, useEffect, useMemo } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import WorkoutTracker from './components/WorkoutTracker';
import HydrationPacer from './components/HydrationPacer';
import MoodJournal from './components/MoodJournal';
import AlignmentCenter from './components/AlignmentCenter';
import { AppState, MoodEntry, Workout, HydrationLog, ExerciseDefinition, SplitDay, CycleConfig, Goal } from './types';
import { INITIAL_STATE } from './constants';
import { getDateDaysAgo, getTodayString, isOnOrAfterDate, isSameLocalDay } from './utils/dateUtils';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [dayTick, setDayTick] = useState(() => getTodayString());
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('align_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...INITIAL_STATE,
        ...parsed,
        hydrationGoals: parsed.hydrationGoals || { [INITIAL_STATE.todayStr]: INITIAL_STATE.dailyHydrationGoal }
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
    
    const newLog: HydrationLog = {
      id: Math.random().toString(36).substr(2, 9),
      date: localDateStr,
      amountOz: normalizedAmount,
      timestamp: now.toISOString()
    };
    setState(prev => ({
      ...prev,
      hydration: [...prev.hydration, newLog]
    }));
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

  const addGoal = (goal: Omit<Goal, 'id' | 'progress' | 'current'>) => {
    const newGoal: Goal = {
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

  const startNewWorkout = (name: string) => {
    const newWorkout: Workout = {
      id: Math.random().toString(36).substr(2, 9),
      name: name,
      date: new Date().toISOString(),
      exercises: [],
      completed: false
    };
    setState(prev => ({
      ...prev,
      workouts: [...prev.workouts, newWorkout]
    }));
  };

  const updateSplit = (days: SplitDay[], templateId?: string) => {
    setState(prev => ({
      ...prev,
      weeklySplit: days,
      selectedTemplateId: templateId || prev.selectedTemplateId
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
      availableExercises: [...prev.availableExercises, ex]
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
            availableExercises={processedState.availableExercises}
            onNewExerciseCreated={handleNewExerciseCreated}
            weeklySplit={processedState.weeklySplit}
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
            onUpdateSplit={updateSplit} 
            onUpdateCycle={updateCycleConfig}
            onAddGoal={addGoal}
            onDeleteGoal={deleteGoal}
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
