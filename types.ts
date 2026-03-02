export type Mood = 'calm' | 'energized' | 'tired' | 'anxious' | 'neutral' | 'happy';

export type EquipmentType = 'bodyweight' | 'dumbbell' | 'barbell' | 'cable' | 'kettlebell' | 'machine';

export type WorkoutBlockType = 'warmup' | 'skill_power' | 'compound' | 'accessory' | 'cooldown';

export type MovementPattern =
  | 'squat'
  | 'hinge'
  | 'lunge'
  | 'horizontal_push'
  | 'vertical_push'
  | 'horizontal_pull'
  | 'vertical_pull'
  | 'glute_bridge'
  | 'isolation'
  | 'carry'
  | 'core';

export type PrimaryMuscle =
  | 'glutes'
  | 'quads'
  | 'hamstrings'
  | 'calves'
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'core';

export type Goal = 'hypertrophy' | 'strength';

export type Emphasis =
  | 'balanced'
  | 'glutes_legs'
  | 'upper_body'
  | 'push_bias'
  | 'pull_bias';

export type ConditioningPreference = 'none' | '1_day' | '2_days';

export interface TrainingProgram {
  goal: Goal;
  daysPerWeek: 3 | 4 | 5 | 6;
  emphasis: Emphasis;
  sessionLengthMin: 45 | 60 | 75 | 90;
  conditioningPreference: ConditioningPreference;
}

export interface GeneratedWeek {
  day: string;
  label: string;
  focusMuscles: PrimaryMuscle[];
  movementPriority: MovementPattern[];
  isConditioning?: boolean;
}



export interface WeekDay {
  dayIndex: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  label: string;
  type: 'lift' | 'conditioning' | 'rest';
  focus?: string;
}

export type WorkoutSectionType =
  | 'activation'
  | 'primary'
  | 'secondary'
  | 'accessory'
  | 'core'
  | 'conditioning_optional'
  | 'recovery_note';

export interface ProgramDayTemplate {
  name: string;
  focusMuscles: PrimaryMuscle[];
  movementPriority: MovementPattern[];
}

export interface ExerciseProgress {
  lastWeight: number;
  lastReps: number[];
  weeksStalled: number;
}

export interface WorkoutBlock {
  type: WorkoutBlockType;
  title: string;
  durationMin: number;
  targetCategories: string[];
  recommendedRestSeconds?: number;
  notes?: string;
}

export interface SetLog {
  reps?: number;
  weight?: number;
  rir?: number;
  durationMinutes?: number;
  isCompleted: boolean;
}

export interface ExerciseDefinition {
  name: string;
  category: string;
  equipment: EquipmentType;
  recommendedSets: number;
  primaryMuscles: PrimaryMuscle[];
  movementPattern: MovementPattern;
  isCompound: boolean;
  defaultRepRange: [number, number];
  defaultRestSec: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface Exercise extends ExerciseDefinition {
  id: string;
  sets: SetLog[];
  equipment?: EquipmentType;
  previousStats?: {
    reps?: number;
    weight?: number;
    durationMinutes?: number;
  }[];
  progression?: ExerciseProgress;
  sectionType?: WorkoutSectionType;
}

export interface Workout {
  id: string;
  name: string;
  date: string;
  exercises: Exercise[];
  completed: boolean;
  blocks?: WorkoutBlock[];
}

export interface UserGoal {
  id: string;
  title: string;
  type: 'yearly' | 'quarterly' | 'monthly' | 'weekly';
  progress: number;
  target: number;
  current: number;
  unit: string;
  parentId?: string;
  autoTrack?: 'workouts' | 'hydration' | 'none';
}

export interface MoodEntry {
  id: string;
  date: string;
  mood: Mood;
  note?: string;
}

export interface HydrationLog {
  id: string;
  date: string;
  amountOz: number;
  timestamp: string;
}

export type CyclePhase = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';

export interface CycleEntry {
  id: string;
  startDate: string;
  phase: CyclePhase;
  symptoms: string[];
  energyLevel: number;
}

export interface SplitDay {
  day: string;
  label: string;
}

export interface SplitTemplate {
  id: string;
  name: string;
  description: string;
  days: SplitDay[];
}

export interface CycleConfig {
  lastStartDate: string;
  cycleLength: number;
}

export interface AppState {
  workouts: Workout[];
  goals: UserGoal[];
  moods: MoodEntry[];
  hydration: HydrationLog[];
  cycle: CycleEntry[];
  cycleConfig: CycleConfig;
  availableExercises: ExerciseDefinition[];
  dailyHydrationGoal: number;
  hydrationGoals: Record<string, number>;
  todayStr: string;
  trainingProgram: TrainingProgram;
}
