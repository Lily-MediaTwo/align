import { Exercise, ExerciseDefinition, ExerciseProgress, SetLog, Workout } from '../types';
import { getExerciseDefinition, getExerciseName } from './exercise';

const roundToIncrement = (value: number, increment: number) => Math.round(value / increment) * increment;

export const buildExerciseProgress = (exerciseName: string, workouts: Workout[]): ExerciseProgress | undefined => {
  const history = workouts
    .filter(w => w.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  for (const workout of history) {
    const ex = workout.exercises.find(e => getExerciseName(e).toLowerCase() === exerciseName.toLowerCase());
    if (!ex) continue;
    const reps = ex.sets.map(s => s.reps || 0).filter(Boolean);
    const weight = Math.max(...ex.sets.map(s => s.weight || 0), 0);
    return {
      lastWeight: weight,
      lastReps: reps,
      weeksStalled: 0,
    };
  }

  return undefined;
};

export const getProgressionSuggestion = (
  exercise: ExerciseDefinition,
  currentSets: SetLog[],
  progress?: ExerciseProgress,
) => {
  const [minRep, maxRep] = exercise.defaultRepRange;
  const reps = currentSets.map(s => s.reps || 0).filter(Boolean);
  const allAtTop = reps.length > 0 && reps.every(r => r >= maxRep);
  const belowBottom = reps.length > 0 && reps.some(r => r < minRep);

  if (!progress) return { message: undefined as string | undefined, nextWeight: undefined as number | undefined, deload: false };

  if (allAtTop) {
    const multiplier = exercise.isCompound ? 1.05 : 1.025;
    return {
      message: `You hit ${maxRep} reps on all sets last week. Increase weight today?`,
      nextWeight: roundToIncrement(progress.lastWeight * multiplier, 2.5),
      deload: false,
    };
  }

  if (belowBottom) {
    return {
      message: `Last session was below ${minRep} reps in spots. Consider reducing load slightly.`,
      nextWeight: roundToIncrement(progress.lastWeight * 0.97, 2.5),
      deload: false,
    };
  }

  return {
    message: undefined as string | undefined,
    nextWeight: undefined as number | undefined,
    deload: progress.weeksStalled >= 6,
  };
};

export const getSessionExerciseCap = (sessionLengthMin: number) => {
  if (sessionLengthMin <= 45) return 5;
  if (sessionLengthMin <= 75) return 6;
  return 7;
};

export const estimateWeeklyGluteSets = (workouts: Workout[]) => {
  return workouts
    .filter(w => w.completed)
    .flatMap(w => w.exercises)
    .filter(ex => getExerciseDefinition(ex).primaryMuscles?.includes('glutes'))
    .reduce((sum, ex) => sum + ex.sets.filter(s => s.isCompleted).length, 0);
};
