import { Exercise, ExerciseDefinition } from '../types';

export const getExerciseDefinition = (exercise: Exercise): ExerciseDefinition => exercise.definition;

export const getExerciseName = (exercise: Exercise) => exercise.definition.name;
export const getExerciseCategory = (exercise: Exercise) => exercise.definition.category;
