
export type Mood = 'calm' | 'energized' | 'tired' | 'anxious' | 'neutral' | 'happy';

export type EquipmentType = 'bodyweight' | 'dumbbell' | 'barbell' | 'cable' | 'kettlebell' | 'machine';

export type TrainingGoal = 'strength' | 'hypertrophy' | 'endurance';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type SplitPreference = 'auto' | 'full_body' | 'upper_lower' | 'ppl';

export type WorkoutBlockType = 'warmup' | 'skill_power' | 'compound' | 'accessory' | 'cooldown';

export interface WorkoutBlock {
  type: WorkoutBlockType;
  title: string;
  durationMin: number;
  targetCategories: string[];
  recommendedRestSeconds?: number;
  notes?: string;
}

export interface TrainingProfile {
  goal: TrainingGoal;
  daysPerWeek: 3 | 4 | 5 | 6;
  experience: ExperienceLevel;
  splitPreference: SplitPreference;
  sessionLengthMin: 45 | 60 | 75;
}

export interface SetLog {
  reps?: number;
  weight?: number;
  durationMinutes?: number;
  isCompleted: boolean;
}

export interface ExerciseDefinition {
  name: string;
  category: string;
  equipment?: EquipmentType;
  recommendedSets?: { reps?: number; weight?: number; durationMinutes?: number }[];
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
}

export interface Workout {
  id: string;
  name: string;
  date: string;
  exercises: Exercise[];
  completed: boolean;
  blocks?: WorkoutBlock[];
}

export interface Goal {
  id: string;
  title: string;
  type: 'yearly' | 'quarterly' | 'monthly' | 'weekly';
  progress: number; // 0-100
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
  energyLevel: number; // 1-5
}

export interface SplitDay {
  day: string; // e.g., "Mon"
  label: string; // e.g., "Push"
}

export interface SplitTemplate {
  id: string;
  name: string;
  description: string;
  days: SplitDay[];
}

export interface CycleConfig {
  lastStartDate: string;
  cycleLength: number; // default usually 28
}

export interface AppState {
  workouts: Workout[];
  goals: Goal[];
  moods: MoodEntry[];
  hydration: HydrationLog[];
  cycle: CycleEntry[];
  cycleConfig: CycleConfig;
  availableExercises: ExerciseDefinition[];
  weeklySplit: SplitDay[];
  selectedTemplateId?: string;
  dailyHydrationGoal: number;
  hydrationGoals: Record<string, number>;
  todayStr: string;
  trainingProfile: TrainingProfile;
}
