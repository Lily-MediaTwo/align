
import React from 'react';
import { AppState, UserGoal, Workout, ExerciseDefinition, SplitDay, SplitTemplate, EquipmentType, TrainingProgram, Mood } from './types';
import { getTodayString } from './utils/dateUtils';

const todayString = getTodayString();

export const DEFAULT_TRAINING_PROGRAM: TrainingProgram = {
  goal: 'hypertrophy',
  daysPerWeek: 4,
  emphasis: 'balanced',
  sessionLengthMin: 60,
  conditioningPreference: 'none',
};

export const PROGRAM_EXERCISES: ExerciseDefinition[] = [
  { name: 'Ab Wheel Rollout', category: 'Core', equipment: 'bodyweight', primaryMuscles: ['core'], movementPattern: 'core', isCompound: false, defaultSets: 3, defaultRepRange: [8,12], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Arnold Press', category: 'Shoulders', equipment: 'dumbbell', primaryMuscles: ['shoulders','triceps'], movementPattern: 'vertical_push', isCompound: true, defaultSets: 3, defaultRepRange: [8,12], defaultRestSec: 90, difficulty: 'intermediate' },
  { name: 'Assault Bike', category: 'Cardio', equipment: 'machine', primaryMuscles: ['glutes','core'], movementPattern: 'isolation', isCompound: false, defaultSets: 1, defaultRepRange: [8,12], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Back Extension', category: 'Back', equipment: 'bodyweight', primaryMuscles: ['back','biceps'], movementPattern: 'isolation', isCompound: false, defaultSets: 3, defaultRepRange: [13,17], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Back Squat', category: 'Legs', equipment: 'barbell', primaryMuscles: ['quads','glutes'], movementPattern: 'squat', isCompound: true, defaultSets: 4, defaultRepRange: [6,10], defaultRestSec: 120, difficulty: 'intermediate' },
  { name: 'Barbell Hip Thrust', category: 'Legs', equipment: 'barbell', primaryMuscles: ['glutes','hamstrings'], movementPattern: 'glute_bridge', isCompound: true, defaultSets: 4, defaultRepRange: [8,12], defaultRestSec: 90, difficulty: 'intermediate' },
  { name: 'Barbell RDL', category: 'Legs', equipment: 'barbell', primaryMuscles: ['hamstrings','glutes'], movementPattern: 'hinge', isCompound: true, defaultSets: 4, defaultRepRange: [6,10], defaultRestSec: 120, difficulty: 'intermediate' },
  { name: 'Belt Squat', category: 'Legs', equipment: 'machine', primaryMuscles: ['quads','glutes'], movementPattern: 'squat', isCompound: true, defaultSets: 4, defaultRepRange: [8,12], defaultRestSec: 90, difficulty: 'intermediate' },
  { name: 'Bench Press', category: 'Chest', equipment: 'barbell', primaryMuscles: ['chest','triceps'], movementPattern: 'horizontal_push', isCompound: true, defaultSets: 3, defaultRepRange: [8,12], defaultRestSec: 90, difficulty: 'intermediate' },
  { name: 'Bent Over Row', category: 'Back', equipment: 'barbell', primaryMuscles: ['back','biceps'], movementPattern: 'horizontal_pull', isCompound: true, defaultSets: 3, defaultRepRange: [8,12], defaultRestSec: 90, difficulty: 'intermediate' },
  { name: 'Bicep Curl', category: 'Biceps', equipment: 'dumbbell', primaryMuscles: ['biceps'], movementPattern: 'isolation', isCompound: false, defaultSets: 3, defaultRepRange: [10,14], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Bulgarian Split Squat', category: 'Legs', equipment: 'dumbbell', primaryMuscles: ['glutes','quads'], movementPattern: 'lunge', isCompound: true, defaultSets: 3, defaultRepRange: [8,12], defaultRestSec: 90, difficulty: 'intermediate' },
  { name: 'Cable Crossover', category: 'Chest', equipment: 'cable', primaryMuscles: ['chest','triceps'], movementPattern: 'isolation', isCompound: false, defaultSets: 3, defaultRepRange: [13,17], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Cable Kickbacks', category: 'Legs', equipment: 'cable', primaryMuscles: ['glutes'], movementPattern: 'isolation', isCompound: false, defaultSets: 3, defaultRepRange: [12,20], defaultRestSec: 45, difficulty: 'beginner' },
  { name: 'Cable Pull Through', category: 'Legs', equipment: 'cable', primaryMuscles: ['quads','glutes','hamstrings'], movementPattern: 'isolation', isCompound: false, defaultSets: 3, defaultRepRange: [13,17], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Calf Raise', category: 'Legs', equipment: 'machine', primaryMuscles: ['quads','glutes','hamstrings'], movementPattern: 'isolation', isCompound: false, defaultSets: 3, defaultRepRange: [13,17], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Chest Fly', category: 'Chest', equipment: 'dumbbell', primaryMuscles: ['chest','triceps'], movementPattern: 'isolation', isCompound: false, defaultSets: 3, defaultRepRange: [10,14], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Chest Supported Row', category: 'Back', equipment: 'dumbbell', primaryMuscles: ['back','biceps'], movementPattern: 'horizontal_pull', isCompound: true, defaultSets: 3, defaultRepRange: [10,14], defaultRestSec: 90, difficulty: 'intermediate' },
  { name: 'Chin Ups', category: 'Back', equipment: 'bodyweight', primaryMuscles: ['back','biceps'], movementPattern: 'vertical_pull', isCompound: true, defaultSets: 3, defaultRepRange: [6,10], defaultRestSec: 90, difficulty: 'intermediate' },
  { name: 'Close Grip Bench Press', category: 'Triceps', equipment: 'barbell', primaryMuscles: ['triceps'], movementPattern: 'isolation', isCompound: false, defaultSets: 3, defaultRepRange: [8,12], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Concentration Curl', category: 'Biceps', equipment: 'dumbbell', primaryMuscles: ['biceps'], movementPattern: 'isolation', isCompound: false, defaultSets: 3, defaultRepRange: [10,14], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Crunch', category: 'Core', equipment: 'bodyweight', primaryMuscles: ['core'], movementPattern: 'core', isCompound: false, defaultSets: 3, defaultRepRange: [18,22], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Cycling', category: 'Cardio', equipment: 'machine', primaryMuscles: ['glutes','core'], movementPattern: 'isolation', isCompound: false, defaultSets: 1, defaultRepRange: [8,12], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Dead Bug', category: 'Core', equipment: 'bodyweight', primaryMuscles: ['core'], movementPattern: 'core', isCompound: false, defaultSets: 3, defaultRepRange: [10,14], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Deadlift', category: 'Back', equipment: 'barbell', primaryMuscles: ['back','biceps'], movementPattern: 'hinge', isCompound: true, defaultSets: 3, defaultRepRange: [6,10], defaultRestSec: 90, difficulty: 'intermediate' },
  { name: 'Decline Press', category: 'Chest', equipment: 'barbell', primaryMuscles: ['chest','triceps'], movementPattern: 'horizontal_push', isCompound: true, defaultSets: 3, defaultRepRange: [8,12], defaultRestSec: 90, difficulty: 'intermediate' },
  { name: 'Dips', category: 'Chest', equipment: 'bodyweight', primaryMuscles: ['chest','triceps'], movementPattern: 'isolation', isCompound: false, defaultSets: 3, defaultRepRange: [8,12], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Elliptical', category: 'Cardio', equipment: 'machine', primaryMuscles: ['glutes','core'], movementPattern: 'isolation', isCompound: false, defaultSets: 1, defaultRepRange: [8,12], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Face Pulls', category: 'Back', equipment: 'cable', primaryMuscles: ['back','biceps'], movementPattern: 'isolation', isCompound: false, defaultSets: 3, defaultRepRange: [13,17], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Farmer Carry', category: 'Core', equipment: 'dumbbell', primaryMuscles: ['core'], movementPattern: 'carry', isCompound: false, defaultSets: 3, defaultRepRange: [8,12], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Foam Rolling', category: 'Active Recovery', equipment: 'bodyweight', primaryMuscles: ['core'], movementPattern: 'isolation', isCompound: false, defaultSets: 1, defaultRepRange: [8,12], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Front Raise', category: 'Shoulders', equipment: 'dumbbell', primaryMuscles: ['shoulders','triceps'], movementPattern: 'isolation', isCompound: false, defaultSets: 3, defaultRepRange: [10,14], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Front Squat', category: 'Legs', equipment: 'barbell', primaryMuscles: ['quads','glutes','core'], movementPattern: 'squat', isCompound: true, defaultSets: 4, defaultRepRange: [5,8], defaultRestSec: 120, difficulty: 'advanced' },
  { name: 'Glute Bridge', category: 'Legs', equipment: 'bodyweight', primaryMuscles: ['quads','glutes','hamstrings'], movementPattern: 'glute_bridge', isCompound: true, defaultSets: 3, defaultRepRange: [13,17], defaultRestSec: 90, difficulty: 'intermediate' },
  { name: 'Goblet Squat', category: 'Legs', equipment: 'kettlebell', primaryMuscles: ['quads','glutes','hamstrings'], movementPattern: 'squat', isCompound: true, defaultSets: 3, defaultRepRange: [10,14], defaultRestSec: 90, difficulty: 'intermediate' },
  { name: 'Good Morning', category: 'Legs', equipment: 'barbell', primaryMuscles: ['quads','glutes','hamstrings'], movementPattern: 'isolation', isCompound: false, defaultSets: 3, defaultRepRange: [8,12], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Hack Squat', category: 'Legs', equipment: 'machine', primaryMuscles: ['quads','glutes'], movementPattern: 'squat', isCompound: true, defaultSets: 4, defaultRepRange: [8,12], defaultRestSec: 90, difficulty: 'intermediate' },
  { name: 'Hammer Curl', category: 'Biceps', equipment: 'dumbbell', primaryMuscles: ['biceps'], movementPattern: 'isolation', isCompound: false, defaultSets: 3, defaultRepRange: [10,14], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Hanging Leg Raise', category: 'Core', equipment: 'bodyweight', primaryMuscles: ['core'], movementPattern: 'core', isCompound: false, defaultSets: 3, defaultRepRange: [10,14], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Hip Abduction', category: 'Legs', equipment: 'machine', primaryMuscles: ['glutes'], movementPattern: 'isolation', isCompound: false, defaultSets: 3, defaultRepRange: [12,20], defaultRestSec: 45, difficulty: 'beginner' },
  { name: 'Hip Adduction', category: 'Legs', equipment: 'machine', primaryMuscles: ['quads','glutes'], movementPattern: 'isolation', isCompound: false, defaultSets: 3, defaultRepRange: [12,20], defaultRestSec: 45, difficulty: 'beginner' },
  { name: 'Hip Thrust', category: 'Legs', equipment: 'barbell', primaryMuscles: ['quads','glutes','hamstrings'], movementPattern: 'glute_bridge', isCompound: true, defaultSets: 3, defaultRepRange: [8,12], defaultRestSec: 90, difficulty: 'intermediate' },
  { name: 'Incline Dumbbell Press', category: 'Chest', equipment: 'dumbbell', primaryMuscles: ['chest','triceps'], movementPattern: 'horizontal_push', isCompound: true, defaultSets: 3, defaultRepRange: [10,14], defaultRestSec: 90, difficulty: 'intermediate' },
  { name: 'Jump Rope', category: 'Cardio', equipment: 'bodyweight', primaryMuscles: ['glutes','core'], movementPattern: 'isolation', isCompound: false, defaultSets: 1, defaultRepRange: [8,12], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Kettlebell Clean and Press', category: 'Shoulders', equipment: 'kettlebell', primaryMuscles: ['shoulders','triceps'], movementPattern: 'vertical_push', isCompound: true, defaultSets: 3, defaultRepRange: [6,10], defaultRestSec: 90, difficulty: 'intermediate' },
  { name: 'Kettlebell Swing', category: 'Cardio', equipment: 'kettlebell', primaryMuscles: ['glutes','core'], movementPattern: 'isolation', isCompound: false, defaultSets: 3, defaultRepRange: [18,22], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Lat Pulldown', category: 'Back', equipment: 'machine', primaryMuscles: ['back','biceps'], movementPattern: 'vertical_pull', isCompound: true, defaultSets: 3, defaultRepRange: [10,14], defaultRestSec: 90, difficulty: 'intermediate' },
  { name: 'Lateral Raise', category: 'Shoulders', equipment: 'dumbbell', primaryMuscles: ['shoulders','triceps'], movementPattern: 'isolation', isCompound: false, defaultSets: 3, defaultRepRange: [13,17], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Leg Curl', category: 'Legs', equipment: 'machine', primaryMuscles: ['quads','glutes','hamstrings'], movementPattern: 'isolation', isCompound: false, defaultSets: 3, defaultRepRange: [10,14], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Leg Extension', category: 'Legs', equipment: 'machine', primaryMuscles: ['quads','glutes','hamstrings'], movementPattern: 'isolation', isCompound: false, defaultSets: 3, defaultRepRange: [10,14], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Leg Press', category: 'Legs', equipment: 'machine', primaryMuscles: ['quads','glutes','hamstrings'], movementPattern: 'isolation', isCompound: false, defaultSets: 3, defaultRepRange: [10,14], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Lunge', category: 'Legs', equipment: 'dumbbell', primaryMuscles: ['quads','glutes','hamstrings'], movementPattern: 'lunge', isCompound: true, defaultSets: 3, defaultRepRange: [8,12], defaultRestSec: 90, difficulty: 'intermediate' },
  { name: 'Lying Leg Curl', category: 'Legs', equipment: 'machine', primaryMuscles: ['hamstrings'], movementPattern: 'isolation', isCompound: false, defaultSets: 3, defaultRepRange: [10,15], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Machine Abduction', category: 'Legs', equipment: 'machine', primaryMuscles: ['glutes'], movementPattern: 'isolation', isCompound: false, defaultSets: 3, defaultRepRange: [15,25], defaultRestSec: 45, difficulty: 'beginner' },
  { name: 'Machine Hip Thrust', category: 'Legs', equipment: 'machine', primaryMuscles: ['glutes','hamstrings'], movementPattern: 'glute_bridge', isCompound: true, defaultSets: 4, defaultRepRange: [10,15], defaultRestSec: 75, difficulty: 'beginner' },
  { name: 'Machine Shoulder Press', category: 'Shoulders', equipment: 'machine', primaryMuscles: ['shoulders','triceps'], movementPattern: 'vertical_push', isCompound: true, defaultSets: 3, defaultRepRange: [10,14], defaultRestSec: 90, difficulty: 'intermediate' },
  { name: 'Mobility Flow', category: 'Active Recovery', equipment: 'bodyweight', primaryMuscles: ['core'], movementPattern: 'isolation', isCompound: false, defaultSets: 1, defaultRepRange: [8,12], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Mountain Climbers', category: 'Core', equipment: 'bodyweight', primaryMuscles: ['core'], movementPattern: 'core', isCompound: false, defaultSets: 3, defaultRepRange: [28,32], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Neutral Grip Lat Pulldown', category: 'Back', equipment: 'machine', primaryMuscles: ['back','biceps'], movementPattern: 'vertical_pull', isCompound: true, defaultSets: 3, defaultRepRange: [10,14], defaultRestSec: 90, difficulty: 'intermediate' },
  { name: 'Nordic Curl', category: 'Legs', equipment: 'bodyweight', primaryMuscles: ['hamstrings','glutes'], movementPattern: 'hinge', isCompound: true, defaultSets: 3, defaultRepRange: [5,8], defaultRestSec: 90, difficulty: 'advanced' },
  { name: 'Overhead Cable Tricep Extension', category: 'Triceps', equipment: 'cable', primaryMuscles: ['triceps'], movementPattern: 'isolation', isCompound: false, defaultSets: 3, defaultRepRange: [13,17], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Overhead Press', category: 'Shoulders', equipment: 'barbell', primaryMuscles: ['shoulders','triceps'], movementPattern: 'vertical_push', isCompound: true, defaultSets: 3, defaultRepRange: [8,12], defaultRestSec: 90, difficulty: 'intermediate' },
  { name: 'Pallof Press', category: 'Core', equipment: 'cable', primaryMuscles: ['core'], movementPattern: 'core', isCompound: false, defaultSets: 3, defaultRepRange: [10,14], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Pec Deck', category: 'Chest', equipment: 'machine', primaryMuscles: ['chest','triceps'], movementPattern: 'isolation', isCompound: false, defaultSets: 3, defaultRepRange: [10,14], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Pilates', category: 'Active Recovery', equipment: 'bodyweight', primaryMuscles: ['core'], movementPattern: 'isolation', isCompound: false, defaultSets: 1, defaultRepRange: [8,12], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Plank', category: 'Core', equipment: 'bodyweight', primaryMuscles: ['core'], movementPattern: 'core', isCompound: false, defaultSets: 3, defaultRepRange: [8,12], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Preacher Curl', category: 'Biceps', equipment: 'barbell', primaryMuscles: ['biceps'], movementPattern: 'isolation', isCompound: false, defaultSets: 3, defaultRepRange: [10,14], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Pull Ups', category: 'Back', equipment: 'bodyweight', primaryMuscles: ['back','biceps'], movementPattern: 'vertical_pull', isCompound: true, defaultSets: 3, defaultRepRange: [6,10], defaultRestSec: 90, difficulty: 'intermediate' },
  { name: 'Push Ups', category: 'Chest', equipment: 'bodyweight', primaryMuscles: ['chest','triceps'], movementPattern: 'isolation', isCompound: false, defaultSets: 3, defaultRepRange: [13,17], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Rear Delt Fly', category: 'Shoulders', equipment: 'dumbbell', primaryMuscles: ['shoulders','triceps'], movementPattern: 'isolation', isCompound: false, defaultSets: 3, defaultRepRange: [13,17], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Romanian Deadlift', category: 'Legs', equipment: 'barbell', primaryMuscles: ['quads','glutes','hamstrings'], movementPattern: 'hinge', isCompound: true, defaultSets: 3, defaultRepRange: [8,12], defaultRestSec: 90, difficulty: 'intermediate' },
  { name: 'Rowing Machine', category: 'Cardio', equipment: 'machine', primaryMuscles: ['glutes','core'], movementPattern: 'horizontal_pull', isCompound: true, defaultSets: 1, defaultRepRange: [8,12], defaultRestSec: 90, difficulty: 'intermediate' },
  { name: 'Running', category: 'Cardio', equipment: 'bodyweight', primaryMuscles: ['glutes','core'], movementPattern: 'isolation', isCompound: false, defaultSets: 1, defaultRepRange: [8,12], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Russian Twist', category: 'Core', equipment: 'bodyweight', primaryMuscles: ['core'], movementPattern: 'core', isCompound: false, defaultSets: 3, defaultRepRange: [18,22], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Seated Cable Row', category: 'Back', equipment: 'cable', primaryMuscles: ['back','biceps'], movementPattern: 'horizontal_pull', isCompound: true, defaultSets: 3, defaultRepRange: [10,14], defaultRestSec: 90, difficulty: 'intermediate' },
  { name: 'Seated Calf Raise', category: 'Legs', equipment: 'machine', primaryMuscles: ['calves'], movementPattern: 'isolation', isCompound: false, defaultSets: 4, defaultRepRange: [12,20], defaultRestSec: 45, difficulty: 'beginner' },
  { name: 'Seated Dumbbell Shoulder Press', category: 'Shoulders', equipment: 'dumbbell', primaryMuscles: ['shoulders','triceps'], movementPattern: 'vertical_push', isCompound: true, defaultSets: 3, defaultRepRange: [8,12], defaultRestSec: 90, difficulty: 'intermediate' },
  { name: 'Seated Leg Curl', category: 'Legs', equipment: 'machine', primaryMuscles: ['hamstrings'], movementPattern: 'isolation', isCompound: false, defaultSets: 3, defaultRepRange: [10,15], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Shrugs', category: 'Shoulders', equipment: 'dumbbell', primaryMuscles: ['shoulders','triceps'], movementPattern: 'isolation', isCompound: false, defaultSets: 3, defaultRepRange: [10,14], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Side Plank', category: 'Core', equipment: 'bodyweight', primaryMuscles: ['core'], movementPattern: 'core', isCompound: false, defaultSets: 3, defaultRepRange: [8,12], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Single Arm Dumbbell Row', category: 'Back', equipment: 'dumbbell', primaryMuscles: ['back','biceps'], movementPattern: 'horizontal_pull', isCompound: true, defaultSets: 3, defaultRepRange: [8,12], defaultRestSec: 90, difficulty: 'intermediate' },
  { name: 'Single Leg RDLs', category: 'Legs', equipment: 'dumbbell', primaryMuscles: ['hamstrings','glutes'], movementPattern: 'hinge', isCompound: true, defaultSets: 3, defaultRepRange: [8,12], defaultRestSec: 75, difficulty: 'beginner' },
  { name: 'Single Leg Romanian Deadlift', category: 'Legs', equipment: 'dumbbell', primaryMuscles: ['quads','glutes','hamstrings'], movementPattern: 'hinge', isCompound: true, defaultSets: 3, defaultRepRange: [8,12], defaultRestSec: 90, difficulty: 'intermediate' },
  { name: 'Single-Leg Hip Thrust', category: 'Legs', equipment: 'bodyweight', primaryMuscles: ['glutes','hamstrings'], movementPattern: 'glute_bridge', isCompound: true, defaultSets: 3, defaultRepRange: [10,15], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Skull Crushers', category: 'Triceps', equipment: 'barbell', primaryMuscles: ['triceps'], movementPattern: 'isolation', isCompound: false, defaultSets: 3, defaultRepRange: [10,14], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Squat', category: 'Legs', equipment: 'barbell', primaryMuscles: ['quads','glutes','hamstrings'], movementPattern: 'squat', isCompound: true, defaultSets: 3, defaultRepRange: [8,12], defaultRestSec: 90, difficulty: 'intermediate' },
  { name: 'Stair Climber', category: 'Cardio', equipment: 'machine', primaryMuscles: ['glutes','core'], movementPattern: 'isolation', isCompound: false, defaultSets: 1, defaultRepRange: [8,12], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Standing Calf Raise', category: 'Legs', equipment: 'machine', primaryMuscles: ['calves'], movementPattern: 'isolation', isCompound: false, defaultSets: 4, defaultRepRange: [12,20], defaultRestSec: 45, difficulty: 'beginner' },
  { name: 'Step Ups', category: 'Legs', equipment: 'dumbbell', primaryMuscles: ['glutes','quads'], movementPattern: 'lunge', isCompound: true, defaultSets: 3, defaultRepRange: [10,15], defaultRestSec: 75, difficulty: 'beginner' },
  { name: 'Stretching', category: 'Active Recovery', equipment: 'bodyweight', primaryMuscles: ['core'], movementPattern: 'isolation', isCompound: false, defaultSets: 1, defaultRepRange: [8,12], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Suitcase Carry', category: 'Core', equipment: 'kettlebell', primaryMuscles: ['core'], movementPattern: 'carry', isCompound: false, defaultSets: 3, defaultRepRange: [8,12], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Swimming', category: 'Cardio', equipment: 'bodyweight', primaryMuscles: ['glutes','core'], movementPattern: 'isolation', isCompound: false, defaultSets: 1, defaultRepRange: [8,12], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'T-Bar Row', category: 'Back', equipment: 'barbell', primaryMuscles: ['back','biceps'], movementPattern: 'horizontal_pull', isCompound: true, defaultSets: 3, defaultRepRange: [8,12], defaultRestSec: 90, difficulty: 'intermediate' },
  { name: 'Tibialis Raises', category: 'Legs', equipment: 'bodyweight', primaryMuscles: ['calves'], movementPattern: 'isolation', isCompound: false, defaultSets: 3, defaultRepRange: [15,25], defaultRestSec: 45, difficulty: 'beginner' },
  { name: 'Trap Bar Deadlift', category: 'Legs', equipment: 'barbell', primaryMuscles: ['glutes','quads','hamstrings'], movementPattern: 'hinge', isCompound: true, defaultSets: 3, defaultRepRange: [4,8], defaultRestSec: 150, difficulty: 'advanced' },
  { name: 'Tricep Extension', category: 'Triceps', equipment: 'dumbbell', primaryMuscles: ['triceps'], movementPattern: 'isolation', isCompound: false, defaultSets: 3, defaultRepRange: [10,14], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Tricep Pushdown', category: 'Triceps', equipment: 'cable', primaryMuscles: ['triceps'], movementPattern: 'isolation', isCompound: false, defaultSets: 3, defaultRepRange: [13,17], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Turkish Get Up', category: 'Active Recovery', equipment: 'kettlebell', primaryMuscles: ['core'], movementPattern: 'isolation', isCompound: false, defaultSets: 3, defaultRepRange: [3,7], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Upright Row', category: 'Shoulders', equipment: 'barbell', primaryMuscles: ['shoulders','triceps'], movementPattern: 'horizontal_pull', isCompound: true, defaultSets: 3, defaultRepRange: [10,14], defaultRestSec: 90, difficulty: 'intermediate' },
  { name: 'Walking', category: 'Cardio', equipment: 'bodyweight', primaryMuscles: ['glutes','core'], movementPattern: 'isolation', isCompound: false, defaultSets: 1, defaultRepRange: [8,12], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Walking Lunges', category: 'Legs', equipment: 'dumbbell', primaryMuscles: ['glutes','quads','hamstrings'], movementPattern: 'lunge', isCompound: true, defaultSets: 3, defaultRepRange: [10,16], defaultRestSec: 75, difficulty: 'beginner' },
  { name: 'Woodchopper', category: 'Core', equipment: 'cable', primaryMuscles: ['core'], movementPattern: 'core', isCompound: false, defaultSets: 3, defaultRepRange: [13,17], defaultRestSec: 60, difficulty: 'beginner' },
  { name: 'Yoga', category: 'Active Recovery', equipment: 'bodyweight', primaryMuscles: ['core'], movementPattern: 'isolation', isCompound: false, defaultSets: 1, defaultRepRange: [8,12], defaultRestSec: 60, difficulty: 'beginner' },
];

export const COMMON_EXERCISES: ExerciseDefinition[] = PROGRAM_EXERCISES;

export const EQUIPMENT_CONFIG: Record<EquipmentType, { label: string; icon: string }> = {
  bodyweight: { label: 'Bodyweight', icon: '👤' },
  dumbbell: { label: 'Dumbbell', icon: '⚵' },
  barbell: { label: 'Barbell', icon: '🏋️' },
  cable: { label: 'Cable', icon: '⛓️' },
  kettlebell: { label: 'Kettlebell', icon: '🔔' },
  machine: { label: 'Machine', icon: '⚙️' }
};

export const SPLIT_TEMPLATES: SplitTemplate[] = [
  {
    id: 'ppl-6',
    name: 'Push / Pull / Legs',
    description: 'The gold standard for muscle growth. 6 days per week.',
    days: [
      { day: 'Mon', label: 'Push' },
      { day: 'Tue', label: 'Pull' },
      { day: 'Wed', label: 'Legs' },
      { day: 'Thu', label: 'Push' },
      { day: 'Fri', label: 'Pull' },
      { day: 'Sat', label: 'Legs' },
      { day: 'Sun', label: 'Rest' }
    ]
  },
  {
    id: 'ul-4',
    name: 'Upper / Lower',
    description: 'Great balance of recovery and intensity. 4 days per week.',
    days: [
      { day: 'Mon', label: 'Upper' },
      { day: 'Tue', label: 'Lower' },
      { day: 'Wed', label: 'Rest' },
      { day: 'Thu', label: 'Upper' },
      { day: 'Fri', label: 'Lower' },
      { day: 'Sat', label: 'Rest' },
      { day: 'Sun', label: 'Rest' }
    ]
  },
  {
    id: 'fb-3',
    name: 'Full Body Focus',
    description: 'Ideal for busy schedules. 3 heavy days per week.',
    days: [
      { day: 'Mon', label: 'Full Body' },
      { day: 'Tue', label: 'Rest' },
      { day: 'Wed', label: 'Full Body' },
      { day: 'Thu', label: 'Rest' },
      { day: 'Fri', label: 'Full Body' },
      { day: 'Sat', label: 'Rest' },
      { day: 'Sun', label: 'Rest' }
    ]
  },
  {
    id: 'athlete-5',
    name: 'Performance Split',
    description: 'Mixed modality for general athleticism. 5 days per week.',
    days: [
      { day: 'Mon', label: 'Strength' },
      { day: 'Tue', label: 'Mobility' },
      { day: 'Wed', label: 'Condition' },
      { day: 'Thu', label: 'Strength' },
      { day: 'Fri', label: 'Endurance' },
      { day: 'Sat', label: 'Rest' },
      { day: 'Sun', label: 'Rest' }
    ]
  }
];

export const INITIAL_STATE: AppState = {
  workouts: [],
  goals: [
    { id: 'g3', title: 'Strength Training Momentum', type: 'weekly', progress: 0, target: 4, current: 0, unit: 'workouts', autoTrack: 'workouts' }
  ],
  moods: [],
  hydration: [],
  cycle: [],
  cycleConfig: {
    lastStartDate: todayString,
    cycleLength: 28
  },
  availableExercises: COMMON_EXERCISES,
  dailyHydrationGoal: 64,
  hydrationGoals: { [todayString]: 64 },
  todayStr: todayString,
  trainingProgram: DEFAULT_TRAINING_PROGRAM
};

export const MOOD_CONFIG: Record<Mood, { emoji: string; color: string }> = {
  calm: { emoji: '🌿', color: 'bg-emerald-50' },
  energized: { emoji: '⚡', color: 'bg-amber-50' },
  tired: { emoji: '☁️', color: 'bg-blue-50' },
  anxious: { emoji: '🌊', color: 'bg-indigo-50' },
  neutral: { emoji: '✨', color: 'bg-stone-50' },
  happy: { emoji: '☀️', color: 'bg-yellow-50' },
  motivated: { emoji: '🔥', color: 'bg-rose-50' },
  stressed: { emoji: '🧩', color: 'bg-violet-50' },
  sore: { emoji: '🦵', color: 'bg-orange-50' },
  focused: { emoji: '🎯', color: 'bg-cyan-50' },
  frustrated: { emoji: '😤', color: 'bg-red-50' },
  sad: { emoji: '🌧️', color: 'bg-slate-100' }
};

export const COLORS = {
  primary: '#7c9082', // Sage Green
  secondary: '#a4b1a8',
  accent: '#d4a373', // Muted Gold/Brown
  background: '#fcfbf7', // Warm Cream
  card: '#ffffff'
};
