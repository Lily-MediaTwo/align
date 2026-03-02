import { ExerciseDefinition, TrainingProgram, WorkoutSectionType } from '../types';

export interface WorkoutSection {
  type: WorkoutSectionType;
  title: string;
  collapsible: boolean;
}

export const defaultCollapsedState: Record<WorkoutSectionType, boolean> = {
  activation: true,
  primary: false,
  secondary: false,
  accessory: true,
  core: false,
  conditioning_optional: true,
  recovery_note: false,
};

export const getWorkoutSections = (dayType: 'lift' | 'conditioning' | 'rest'): WorkoutSection[] => {
  if (dayType === 'conditioning') {
    return [
      { type: 'activation', title: 'Activation', collapsible: true },
      { type: 'conditioning_optional', title: 'Conditioning Prescription', collapsible: true },
      { type: 'core', title: 'Core', collapsible: true },
      { type: 'recovery_note', title: 'Recovery Recommendation', collapsible: false },
    ];
  }

  if (dayType === 'rest') {
    return [{ type: 'recovery_note', title: 'Recovery Recommendation', collapsible: false }];
  }

  return [
    { type: 'activation', title: 'Activation', collapsible: true },
    { type: 'primary', title: 'Primary Lift', collapsible: true },
    { type: 'secondary', title: 'Secondary Lift', collapsible: true },
    { type: 'accessory', title: 'Accessory Block', collapsible: true },
    { type: 'core', title: 'Core (Mandatory)', collapsible: true },
    { type: 'conditioning_optional', title: 'Optional Conditioning', collapsible: true },
    { type: 'recovery_note', title: 'Recovery Recommendation', collapsible: false },
  ];
};

export const inferSectionType = (exercise: ExerciseDefinition, dayType: 'lift' | 'conditioning'): WorkoutSectionType => {
  if (exercise.movementPattern === 'core' || exercise.category === 'Core') return 'core';
  if (dayType === 'conditioning') return 'conditioning_optional';
  if (exercise.movementPattern === 'squat' || exercise.movementPattern === 'hinge' || exercise.movementPattern === 'horizontal_push' || exercise.movementPattern === 'vertical_pull') return 'primary';
  if (exercise.movementPattern === 'lunge' || exercise.movementPattern === 'horizontal_pull' || exercise.movementPattern === 'vertical_push' || exercise.movementPattern === 'glute_bridge') return 'secondary';
  if (exercise.category === 'Cardio' || exercise.category === 'Active Recovery') return 'conditioning_optional';
  return 'accessory';
};

export const getExerciseCapForSession = (program: TrainingProgram) => {
  if (program.sessionLengthMin <= 45) return 5;
  if (program.sessionLengthMin <= 75) return 6;
  return 7;
};
