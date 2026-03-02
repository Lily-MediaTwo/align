import { Exercise, ExerciseDefinition } from '../types';

export const getExerciseDefinition = (exercise: Exercise): ExerciseDefinition => ({
  name: exercise.definition?.name || exercise.name || 'Exercise',
  category: exercise.definition?.category || exercise.category || 'Core',
  equipment: exercise.definition?.equipment || exercise.equipment || 'bodyweight',
  recommendedSets: exercise.definition?.recommendedSets || exercise.recommendedSets || 3,
  primaryMuscles: exercise.definition?.primaryMuscles || exercise.primaryMuscles || ['core'],
  movementPattern: exercise.definition?.movementPattern || exercise.movementPattern || 'isolation',
  isCompound: exercise.definition?.isCompound ?? exercise.isCompound ?? false,
  defaultRepRange: exercise.definition?.defaultRepRange || exercise.defaultRepRange || [8, 12],
  defaultRestSec: exercise.definition?.defaultRestSec || exercise.defaultRestSec || 60,
  difficulty: exercise.definition?.difficulty || exercise.difficulty || 'beginner',
});

export const getExerciseName = (exercise: Exercise) => getExerciseDefinition(exercise).name;
export const getExerciseCategory = (exercise: Exercise) => getExerciseDefinition(exercise).category;
