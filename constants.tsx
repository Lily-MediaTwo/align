
import React from 'react';
import { AppState, Goal, Workout, ExerciseDefinition, SplitDay, SplitTemplate, EquipmentType, TrainingProfile } from './types';
import { getTodayString } from './utils/dateUtils';

const todayString = getTodayString();

export const DEFAULT_TRAINING_PROFILE: TrainingProfile = {
  goal: 'hypertrophy',
  daysPerWeek: 4,
  experience: 'intermediate',
  splitPreference: 'auto',
  sessionLengthMin: 60,
};

export const COMMON_EXERCISES: ExerciseDefinition[] = [
  // Chest
  { name: 'Bench Press', category: 'Chest', equipment: 'barbell', recommendedSets: [{ reps: 10, weight: 45 }, { reps: 10, weight: 95 }, { reps: 8, weight: 135 }] },
  { name: 'Incline Dumbbell Press', category: 'Chest', equipment: 'dumbbell', recommendedSets: [{ reps: 12, weight: 25 }, { reps: 10, weight: 35 }, { reps: 10, weight: 40 }] },
  { name: 'Chest Fly', category: 'Chest', equipment: 'dumbbell', recommendedSets: [{ reps: 12, weight: 15 }, { reps: 12, weight: 20 }, { reps: 12, weight: 20 }] },
  { name: 'Push Ups', category: 'Chest', equipment: 'bodyweight', recommendedSets: [{ reps: 15, weight: 0 }, { reps: 15, weight: 0 }, { reps: 15, weight: 0 }] },
  { name: 'Dips', category: 'Chest', equipment: 'bodyweight', recommendedSets: [{ reps: 10, weight: 0 }, { reps: 10, weight: 0 }, { reps: 10, weight: 0 }] },
  { name: 'Cable Crossover', category: 'Chest', equipment: 'cable', recommendedSets: [{ reps: 15, weight: 20 }, { reps: 15, weight: 25 }, { reps: 15, weight: 25 }] },
  { name: 'Decline Press', category: 'Chest', equipment: 'barbell', recommendedSets: [{ reps: 10, weight: 95 }, { reps: 10, weight: 115 }, { reps: 10, weight: 135 }] },
  { name: 'Pec Deck', category: 'Chest', equipment: 'machine', recommendedSets: [{ reps: 12, weight: 40 }, { reps: 12, weight: 50 }, { reps: 12, weight: 60 }] },
  
  // Back
  { name: 'Pull Ups', category: 'Back', equipment: 'bodyweight', recommendedSets: [{ reps: 8, weight: 0 }, { reps: 8, weight: 0 }, { reps: 8, weight: 0 }] },
  { name: 'Lat Pulldown', category: 'Back', equipment: 'machine', recommendedSets: [{ reps: 12, weight: 70 }, { reps: 10, weight: 85 }, { reps: 10, weight: 100 }] },
  { name: 'Bent Over Row', category: 'Back', equipment: 'barbell', recommendedSets: [{ reps: 10, weight: 65 }, { reps: 10, weight: 85 }, { reps: 10, weight: 95 }] },
  { name: 'Deadlift', category: 'Back', equipment: 'barbell', recommendedSets: [{ reps: 8, weight: 135 }, { reps: 5, weight: 185 }, { reps: 5, weight: 225 }] },
  { name: 'Seated Cable Row', category: 'Back', equipment: 'cable', recommendedSets: [{ reps: 12, weight: 60 }, { reps: 12, weight: 75 }, { reps: 12, weight: 90 }] },
  { name: 'Single Arm Dumbbell Row', category: 'Back', equipment: 'dumbbell', recommendedSets: [{ reps: 10, weight: 30 }, { reps: 10, weight: 40 }, { reps: 10, weight: 40 }] },
  { name: 'T-Bar Row', category: 'Back', equipment: 'barbell', recommendedSets: [{ reps: 10, weight: 45 }, { reps: 10, weight: 70 }, { reps: 10, weight: 90 }] },
  { name: 'Face Pulls', category: 'Back', equipment: 'cable', recommendedSets: [{ reps: 15, weight: 30 }, { reps: 15, weight: 35 }, { reps: 15, weight: 40 }] },
  { name: 'Back Extension', category: 'Back', equipment: 'bodyweight', recommendedSets: [{ reps: 15, weight: 0 }, { reps: 15, weight: 0 }, { reps: 15, weight: 0 }] },
  { name: 'Chin Ups', category: 'Back', equipment: 'bodyweight', recommendedSets: [{ reps: 8, weight: 0 }, { reps: 8, weight: 0 }, { reps: 8, weight: 0 }] },
  { name: 'Chest Supported Row', category: 'Back', equipment: 'dumbbell', recommendedSets: [{ reps: 12, weight: 25 }, { reps: 10, weight: 35 }, { reps: 10, weight: 40 }] },
  { name: 'Neutral Grip Lat Pulldown', category: 'Back', equipment: 'machine', recommendedSets: [{ reps: 12, weight: 70 }, { reps: 10, weight: 85 }, { reps: 10, weight: 100 }] },
  
  // Shoulders
  { name: 'Overhead Press', category: 'Shoulders', equipment: 'barbell', recommendedSets: [{ reps: 10, weight: 45 }, { reps: 8, weight: 65 }, { reps: 8, weight: 75 }] },
  { name: 'Lateral Raise', category: 'Shoulders', equipment: 'dumbbell', recommendedSets: [{ reps: 15, weight: 10 }, { reps: 15, weight: 12 }, { reps: 15, weight: 12 }] },
  { name: 'Front Raise', category: 'Shoulders', equipment: 'dumbbell', recommendedSets: [{ reps: 12, weight: 10 }, { reps: 12, weight: 12 }, { reps: 12, weight: 12 }] },
  { name: 'Rear Delt Fly', category: 'Shoulders', equipment: 'dumbbell', recommendedSets: [{ reps: 15, weight: 10 }, { reps: 15, weight: 12 }, { reps: 15, weight: 12 }] },
  { name: 'Arnold Press', category: 'Shoulders', equipment: 'dumbbell', recommendedSets: [{ reps: 10, weight: 25 }, { reps: 10, weight: 30 }, { reps: 10, weight: 35 }] },
  { name: 'Upright Row', category: 'Shoulders', equipment: 'barbell', recommendedSets: [{ reps: 12, weight: 45 }, { reps: 12, weight: 55 }, { reps: 12, weight: 65 }] },
  { name: 'Shrugs', category: 'Shoulders', equipment: 'dumbbell', recommendedSets: [{ reps: 12, weight: 50 }, { reps: 12, weight: 60 }, { reps: 12, weight: 70 }] },
  { name: 'Seated Dumbbell Shoulder Press', category: 'Shoulders', equipment: 'dumbbell', recommendedSets: [{ reps: 10, weight: 20 }, { reps: 10, weight: 30 }, { reps: 8, weight: 35 }] },
  { name: 'Machine Shoulder Press', category: 'Shoulders', equipment: 'machine', recommendedSets: [{ reps: 12, weight: 50 }, { reps: 10, weight: 70 }, { reps: 10, weight: 90 }] },
  
  // Legs
  { name: 'Squat', category: 'Legs', equipment: 'barbell', recommendedSets: [{ reps: 10, weight: 45 }, { reps: 10, weight: 95 }, { reps: 10, weight: 135 }] },
  { name: 'Leg Press', category: 'Legs', equipment: 'machine', recommendedSets: [{ reps: 12, weight: 90 }, { reps: 12, weight: 140 }, { reps: 12, weight: 180 }] },
  { name: 'Leg Curl', category: 'Legs', equipment: 'machine', recommendedSets: [{ reps: 12, weight: 50 }, { reps: 12, weight: 60 }, { reps: 12, weight: 70 }] },
  { name: 'Leg Extension', category: 'Legs', equipment: 'machine', recommendedSets: [{ reps: 12, weight: 50 }, { reps: 12, weight: 60 }, { reps: 12, weight: 70 }] },
  { name: 'Lunge', category: 'Legs', equipment: 'dumbbell', recommendedSets: [{ reps: 10, weight: 20 }, { reps: 10, weight: 20 }, { reps: 10, weight: 20 }] },
  { name: 'Bulgarian Split Squat', category: 'Legs', equipment: 'dumbbell', recommendedSets: [{ reps: 10, weight: 15 }, { reps: 10, weight: 20 }, { reps: 10, weight: 20 }] },
  { name: 'Romanian Deadlift', category: 'Legs', equipment: 'barbell', recommendedSets: [{ reps: 10, weight: 95 }, { reps: 10, weight: 115 }, { reps: 10, weight: 135 }] },
  { name: 'Calf Raise', category: 'Legs', equipment: 'machine', recommendedSets: [{ reps: 15, weight: 70 }, { reps: 15, weight: 90 }, { reps: 15, weight: 110 }] },
  { name: 'Hack Squat', category: 'Legs', equipment: 'machine', recommendedSets: [{ reps: 10, weight: 45 }, { reps: 10, weight: 90 }, { reps: 10, weight: 135 }] },
  { name: 'Glute Bridge', category: 'Legs', equipment: 'bodyweight', recommendedSets: [{ reps: 15, weight: 0 }, { reps: 15, weight: 0 }, { reps: 15, weight: 0 }] },
  { name: 'Hip Thrust', category: 'Legs', equipment: 'barbell', recommendedSets: [{ reps: 10, weight: 95 }, { reps: 10, weight: 135 }, { reps: 10, weight: 155 }] },
  { name: 'Good Morning', category: 'Legs', equipment: 'barbell', recommendedSets: [{ reps: 10, weight: 45 }, { reps: 10, weight: 65 }, { reps: 8, weight: 85 }] },
  { name: 'Cable Pull Through', category: 'Legs', equipment: 'cable', recommendedSets: [{ reps: 15, weight: 40 }, { reps: 12, weight: 50 }, { reps: 12, weight: 60 }] },
  { name: 'Single Leg Romanian Deadlift', category: 'Legs', equipment: 'dumbbell', recommendedSets: [{ reps: 10, weight: 15 }, { reps: 10, weight: 20 }, { reps: 10, weight: 25 }] },
  { name: 'Nordic Curl', category: 'Legs', equipment: 'bodyweight', recommendedSets: [{ reps: 6, weight: 0 }, { reps: 6, weight: 0 }, { reps: 6, weight: 0 }] },
  
  // Arms
  { name: 'Bicep Curl', category: 'Arms', equipment: 'dumbbell', recommendedSets: [{ reps: 12, weight: 15 }, { reps: 12, weight: 20 }, { reps: 12, weight: 20 }] },
  { name: 'Tricep Extension', category: 'Arms', equipment: 'dumbbell', recommendedSets: [{ reps: 12, weight: 20 }, { reps: 12, weight: 25 }, { reps: 12, weight: 25 }] },
  { name: 'Hammer Curl', category: 'Arms', equipment: 'dumbbell', recommendedSets: [{ reps: 12, weight: 15 }, { reps: 12, weight: 20 }, { reps: 12, weight: 20 }] },
  { name: 'Preacher Curl', category: 'Arms', equipment: 'barbell', recommendedSets: [{ reps: 12, weight: 35 }, { reps: 10, weight: 45 }, { reps: 10, weight: 45 }] },
  { name: 'Skull Crushers', category: 'Arms', equipment: 'barbell', recommendedSets: [{ reps: 12, weight: 35 }, { reps: 10, weight: 45 }, { reps: 10, weight: 45 }] },
  { name: 'Tricep Pushdown', category: 'Arms', equipment: 'cable', recommendedSets: [{ reps: 15, weight: 30 }, { reps: 15, weight: 40 }, { reps: 15, weight: 50 }] },
  { name: 'Concentration Curl', category: 'Arms', equipment: 'dumbbell', recommendedSets: [{ reps: 12, weight: 15 }, { reps: 12, weight: 20 }, { reps: 12, weight: 20 }] },
  { name: 'Close Grip Bench Press', category: 'Arms', equipment: 'barbell', recommendedSets: [{ reps: 10, weight: 65 }, { reps: 10, weight: 95 }, { reps: 10, weight: 115 }] },
  { name: 'Overhead Cable Tricep Extension', category: 'Arms', equipment: 'cable', recommendedSets: [{ reps: 15, weight: 20 }, { reps: 12, weight: 30 }, { reps: 12, weight: 35 }] },
  
  // Core
  { name: 'Plank', category: 'Core', equipment: 'bodyweight', recommendedSets: [{ reps: 0, weight: 0, durationMinutes: 1 }, { reps: 0, weight: 0, durationMinutes: 1 }, { reps: 0, weight: 0, durationMinutes: 1 }] },
  { name: 'Hanging Leg Raise', category: 'Core', equipment: 'bodyweight', recommendedSets: [{ reps: 12, weight: 0 }, { reps: 12, weight: 0 }, { reps: 12, weight: 0 }] },
  { name: 'Crunch', category: 'Core', equipment: 'bodyweight', recommendedSets: [{ reps: 20, weight: 0 }, { reps: 20, weight: 0 }, { reps: 20, weight: 0 }] },
  { name: 'Russian Twist', category: 'Core', equipment: 'bodyweight', recommendedSets: [{ reps: 20, weight: 0 }, { reps: 20, weight: 0 }, { reps: 20, weight: 0 }] },
  { name: 'Dead Bug', category: 'Core', equipment: 'bodyweight', recommendedSets: [{ reps: 12, weight: 0 }, { reps: 12, weight: 0 }, { reps: 12, weight: 0 }] },
  { name: 'Mountain Climbers', category: 'Core', equipment: 'bodyweight', recommendedSets: [{ reps: 30, weight: 0 }, { reps: 30, weight: 0 }, { reps: 30, weight: 0 }] },
  { name: 'Ab Wheel Rollout', category: 'Core', equipment: 'bodyweight', recommendedSets: [{ reps: 10, weight: 0 }, { reps: 10, weight: 0 }, { reps: 10, weight: 0 }] },
  { name: 'Woodchopper', category: 'Core', equipment: 'cable', recommendedSets: [{ reps: 15, weight: 20 }, { reps: 15, weight: 25 }, { reps: 15, weight: 25 }] },
  { name: 'Pallof Press', category: 'Core', equipment: 'cable', recommendedSets: [{ reps: 12, weight: 15 }, { reps: 12, weight: 20 }, { reps: 12, weight: 20 }] },
  { name: 'Side Plank', category: 'Core', equipment: 'bodyweight', recommendedSets: [{ reps: 0, weight: 0, durationMinutes: 1 }, { reps: 0, weight: 0, durationMinutes: 1 }, { reps: 0, weight: 0, durationMinutes: 1 }] },
  { name: 'Farmer Carry', category: 'Core', equipment: 'dumbbell', recommendedSets: [{ reps: 0, weight: 40, durationMinutes: 1 }, { reps: 0, weight: 50, durationMinutes: 1 }, { reps: 0, weight: 60, durationMinutes: 1 }] },
  { name: 'Suitcase Carry', category: 'Core', equipment: 'kettlebell', recommendedSets: [{ reps: 0, weight: 25, durationMinutes: 1 }, { reps: 0, weight: 35, durationMinutes: 1 }, { reps: 0, weight: 45, durationMinutes: 1 }] },
  
  // Cardio
  { name: 'Running', category: 'Cardio', equipment: 'bodyweight', recommendedSets: [{ reps: 0, weight: 0, durationMinutes: 20 }] },
  { name: 'Cycling', category: 'Cardio', equipment: 'machine', recommendedSets: [{ reps: 0, weight: 0, durationMinutes: 30 }] },
  { name: 'Swimming', category: 'Cardio', equipment: 'bodyweight', recommendedSets: [{ reps: 0, weight: 0, durationMinutes: 20 }] },
  { name: 'Walking', category: 'Cardio', equipment: 'bodyweight', recommendedSets: [{ reps: 0, weight: 0, durationMinutes: 30 }] },
  { name: 'Elliptical', category: 'Cardio', equipment: 'machine', recommendedSets: [{ reps: 0, weight: 0, durationMinutes: 20 }] },
  { name: 'Rowing Machine', category: 'Cardio', equipment: 'machine', recommendedSets: [{ reps: 0, weight: 0, durationMinutes: 15 }] },
  { name: 'Jump Rope', category: 'Cardio', equipment: 'bodyweight', recommendedSets: [{ reps: 0, weight: 0, durationMinutes: 10 }] },
  { name: 'Stair Climber', category: 'Cardio', equipment: 'machine', recommendedSets: [{ reps: 0, weight: 0, durationMinutes: 15 }] },
  { name: 'Assault Bike', category: 'Cardio', equipment: 'machine', recommendedSets: [{ reps: 0, weight: 0, durationMinutes: 12 }] },
  
  // Active Recovery
  { name: 'Yoga', category: 'Active Recovery', equipment: 'bodyweight', recommendedSets: [{ reps: 0, weight: 0, durationMinutes: 30 }] },
  { name: 'Stretching', category: 'Active Recovery', equipment: 'bodyweight', recommendedSets: [{ reps: 0, weight: 0, durationMinutes: 15 }] },
  { name: 'Foam Rolling', category: 'Active Recovery', equipment: 'bodyweight', recommendedSets: [{ reps: 0, weight: 0, durationMinutes: 10 }] },
  { name: 'Pilates', category: 'Active Recovery', equipment: 'bodyweight', recommendedSets: [{ reps: 0, weight: 0, durationMinutes: 30 }] },
  { name: 'Mobility Flow', category: 'Active Recovery', equipment: 'bodyweight', recommendedSets: [{ reps: 0, weight: 0, durationMinutes: 15 }] },
  { name: 'Turkish Get Up', category: 'Active Recovery', equipment: 'kettlebell', recommendedSets: [{ reps: 5, weight: 15 }, { reps: 5, weight: 20 }, { reps: 5, weight: 25 }] },
  { name: 'Kettlebell Swing', category: 'Cardio', equipment: 'kettlebell', recommendedSets: [{ reps: 20, weight: 20 }, { reps: 20, weight: 25 }, { reps: 20, weight: 35 }] },
  { name: 'Goblet Squat', category: 'Legs', equipment: 'kettlebell', recommendedSets: [{ reps: 12, weight: 20 }, { reps: 10, weight: 30 }, { reps: 10, weight: 40 }] },
  { name: 'Kettlebell Clean and Press', category: 'Shoulders', equipment: 'kettlebell', recommendedSets: [{ reps: 8, weight: 20 }, { reps: 8, weight: 25 }, { reps: 8, weight: 35 }] }
];

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
  weeklySplit: SPLIT_TEMPLATES[0].days,
  selectedTemplateId: 'ppl-6',
  dailyHydrationGoal: 64,
  hydrationGoals: { [todayString]: 64 },
  todayStr: todayString,
  trainingProfile: DEFAULT_TRAINING_PROFILE
};

export const MOOD_CONFIG: Record<string, { emoji: string; color: string }> = {
  calm: { emoji: '🌿', color: 'bg-emerald-50' },
  energized: { emoji: '⚡', color: 'bg-amber-50' },
  tired: { emoji: '☁️', color: 'bg-blue-50' },
  anxious: { emoji: '🌊', color: 'bg-indigo-50' },
  neutral: { emoji: '✨', color: 'bg-stone-50' },
  happy: { emoji: '☀️', color: 'bg-yellow-50' }
};

export const COLORS = {
  primary: '#7c9082', // Sage Green
  secondary: '#a4b1a8',
  accent: '#d4a373', // Muted Gold/Brown
  background: '#fcfbf7', // Warm Cream
  card: '#ffffff'
};
