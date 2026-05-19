import {
  ExerciseDefinition,
  GeneratedWeek,
  MovementPattern,
  PrimaryMuscle,
  SessionFocus,
  TrainingModule,
  TrainingProgram,
  Workout,
  WorkoutBlock,
} from '../../types';
import { isInSameTrainingWeek, parseDayString } from '../../utils/dateUtils';
import { generateWeeklyStructure } from '../programGenerator';
import { getSessionExerciseCap } from '../progression';

export interface FocusOption {
  value: SessionFocus;
  label: string;
  description: string;
}

export interface ModuleOption {
  value: TrainingModule;
  label: string;
  description: string;
}

export interface WeeklyTargetSnapshot {
  liftSessionsTarget: number;
  liftSessionsCompleted: number;
  upperTarget: number;
  upperCompleted: number;
  lowerTarget: number;
  lowerCompleted: number;
  conditioningTarget: number;
  conditioningCompleted: number;
  coreTarget: number;
  coreCompleted: number;
}

export interface RecommendedWorkout {
  title: string;
  focus: SessionFocus;
  movementPriority: MovementPattern[];
  focusMuscles: PrimaryMuscle[];
  blocks: WorkoutBlock[];
  exercises: ExerciseDefinition[];
  weeklyTargets: WeeklyTargetSnapshot;
  rationale: string[];
}

interface BuildRecommendedWorkoutInput {
  program: TrainingProgram;
  availableExercises: ExerciseDefinition[];
  history: Workout[];
  todayStr: string;
  focusOverride?: SessionFocus;
  selectedModules?: TrainingModule[];
}

type ResolvedFocus = {
  title: string;
  focus: SessionFocus;
  movementPriority: MovementPattern[];
  focusMuscles: PrimaryMuscle[];
  preferredCategories: ExerciseDefinition['category'][];
  rationale: string;
};

export const SESSION_FOCUS_OPTIONS: FocusOption[] = [
  { value: 'scheduled', label: 'Scheduled', description: 'Use the weekly plan.' },
  { value: 'upper_body', label: 'Upper', description: 'Push and pull balance.' },
  { value: 'lower_body', label: 'Lower', description: 'Glutes, quads, hamstrings.' },
  { value: 'push', label: 'Push', description: 'Chest, shoulders, triceps.' },
  { value: 'pull', label: 'Pull', description: 'Back, biceps, grip.' },
  { value: 'conditioning', label: 'Conditioning', description: 'Engine, carries, core.' },
  { value: 'hyrox', label: 'HYROX', description: 'Hybrid conditioning drills.' },
  { value: 'calisthenics', label: 'Calisthenics', description: 'Bodyweight strength.' },
  { value: 'mobility', label: 'Mobility', description: 'Recovery and movement quality.' },
];

export const MODULE_OPTIONS: ModuleOption[] = [
  { value: 'hyrox', label: 'HYROX drills', description: 'Hybrid race-style conditioning.' },
  { value: 'calisthenics', label: 'Calisthenics', description: 'Pull-ups, dips, push-ups, body control.' },
  { value: 'handstand', label: 'Handstand', description: 'Wrist prep, wall line, balance work.' },
  { value: 'l_sit', label: 'L-sit', description: 'Compression and core hold practice.' },
  { value: 'mobility', label: 'Mobility', description: 'Joint prep and cooldown quality.' },
];

const FOCUS_CONFIG: Record<Exclude<SessionFocus, 'scheduled'>, ResolvedFocus> = {
  upper_body: {
    title: 'Upper Body',
    focus: 'upper_body',
    movementPriority: ['horizontal_push', 'horizontal_pull', 'vertical_push', 'vertical_pull', 'isolation', 'core'],
    focusMuscles: ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'core'],
    preferredCategories: ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Core'],
    rationale: 'Upper body keeps push and pull volume moving without adding lower-body fatigue.',
  },
  lower_body: {
    title: 'Lower Body',
    focus: 'lower_body',
    movementPriority: ['squat', 'hinge', 'glute_bridge', 'lunge', 'isolation', 'core'],
    focusMuscles: ['glutes', 'quads', 'hamstrings', 'calves', 'core'],
    preferredCategories: ['Legs', 'Core'],
    rationale: 'Lower body prioritizes a primary leg pattern, posterior chain work, and core.',
  },
  push: {
    title: 'Push',
    focus: 'push',
    movementPriority: ['horizontal_push', 'vertical_push', 'isolation', 'core'],
    focusMuscles: ['chest', 'shoulders', 'triceps', 'core'],
    preferredCategories: ['Chest', 'Shoulders', 'Triceps', 'Core'],
    rationale: 'Push focus gives chest, shoulders, and triceps a clear training priority today.',
  },
  pull: {
    title: 'Pull',
    focus: 'pull',
    movementPriority: ['vertical_pull', 'horizontal_pull', 'carry', 'isolation', 'core'],
    focusMuscles: ['back', 'biceps', 'shoulders', 'core'],
    preferredCategories: ['Back', 'Biceps', 'Shoulders', 'Core'],
    rationale: 'Pull focus supports back volume, grip, and posture without crowding push work.',
  },
  conditioning: {
    title: 'Conditioning + Core',
    focus: 'conditioning',
    movementPriority: ['carry', 'core', 'horizontal_pull', 'lunge', 'isolation'],
    focusMuscles: ['core', 'glutes', 'calves', 'back'],
    preferredCategories: ['Cardio', 'Core', 'Active Recovery'],
    rationale: 'Conditioning improves work capacity while keeping the lift plan flexible.',
  },
  hyrox: {
    title: 'HYROX Conditioning',
    focus: 'hyrox',
    movementPriority: ['carry', 'lunge', 'horizontal_pull', 'core', 'isolation'],
    focusMuscles: ['glutes', 'quads', 'hamstrings', 'back', 'core'],
    preferredCategories: ['Cardio', 'Legs', 'Back', 'Core'],
    rationale: 'HYROX-style conditioning blends running-machine work, carries, lunges, and core.',
  },
  calisthenics: {
    title: 'Calisthenics Strength',
    focus: 'calisthenics',
    movementPriority: ['vertical_pull', 'horizontal_push', 'vertical_push', 'core', 'isolation'],
    focusMuscles: ['back', 'chest', 'shoulders', 'triceps', 'biceps', 'core'],
    preferredCategories: ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Core'],
    rationale: 'Calisthenics keeps strength skillful with bodyweight push, pull, and core practice.',
  },
  mobility: {
    title: 'Mobility + Recovery',
    focus: 'mobility',
    movementPriority: ['isolation', 'core', 'carry'],
    focusMuscles: ['core', 'glutes', 'shoulders', 'back'],
    preferredCategories: ['Active Recovery', 'Core'],
    rationale: 'Mobility protects recovery and keeps the weekly rhythm intact.',
  },
};

const MODULE_DRILLS: Partial<Record<TrainingModule, ExerciseDefinition[]>> = {
  hyrox: [
    { name: 'SkiErg Intervals', category: 'Cardio', equipment: 'machine', primaryMuscles: ['back', 'core'], movementPattern: 'horizontal_pull', isCompound: true, defaultSets: 4, defaultRepRange: [8, 12], defaultRestSec: 75, difficulty: 'intermediate', modules: ['hyrox', 'conditioning'], skillTags: ['erg', 'intervals'] },
    { name: 'Sled Push', category: 'Legs', equipment: 'machine', primaryMuscles: ['glutes', 'quads'], movementPattern: 'squat', isCompound: true, defaultSets: 4, defaultRepRange: [10, 20], defaultRestSec: 90, difficulty: 'intermediate', modules: ['hyrox', 'conditioning'], skillTags: ['sled'] },
    { name: 'Sled Pull', category: 'Back', equipment: 'machine', primaryMuscles: ['back', 'hamstrings'], movementPattern: 'horizontal_pull', isCompound: true, defaultSets: 4, defaultRepRange: [10, 20], defaultRestSec: 90, difficulty: 'intermediate', modules: ['hyrox', 'conditioning'], skillTags: ['sled'] },
    { name: 'Burpee Broad Jump', category: 'Cardio', equipment: 'bodyweight', primaryMuscles: ['glutes', 'chest', 'core'], movementPattern: 'horizontal_push', isCompound: true, defaultSets: 3, defaultRepRange: [6, 10], defaultRestSec: 75, difficulty: 'intermediate', modules: ['hyrox', 'conditioning'], skillTags: ['burpee'] },
    { name: 'Wall Balls', category: 'Legs', equipment: 'machine', primaryMuscles: ['quads', 'glutes', 'shoulders'], movementPattern: 'squat', isCompound: true, defaultSets: 3, defaultRepRange: [15, 25], defaultRestSec: 75, difficulty: 'intermediate', modules: ['hyrox', 'conditioning'], skillTags: ['wall-ball'] },
  ],
  calisthenics: [
    { name: 'Assisted Pull Ups', category: 'Back', equipment: 'bodyweight', primaryMuscles: ['back', 'biceps'], movementPattern: 'vertical_pull', isCompound: true, defaultSets: 3, defaultRepRange: [5, 8], defaultRestSec: 90, difficulty: 'beginner', modules: ['calisthenics'], skillTags: ['pull-up'] },
    { name: 'Tempo Push Ups', category: 'Chest', equipment: 'bodyweight', primaryMuscles: ['chest', 'triceps', 'core'], movementPattern: 'horizontal_push', isCompound: true, defaultSets: 3, defaultRepRange: [8, 12], defaultRestSec: 75, difficulty: 'beginner', modules: ['calisthenics'], skillTags: ['tempo'] },
    { name: 'Bench Dips', category: 'Triceps', equipment: 'bodyweight', primaryMuscles: ['triceps', 'chest'], movementPattern: 'horizontal_push', isCompound: true, defaultSets: 3, defaultRepRange: [8, 12], defaultRestSec: 75, difficulty: 'beginner', modules: ['calisthenics'], skillTags: ['dip'] },
  ],
  handstand: [
    { name: 'Wrist Prep Flow', category: 'Active Recovery', equipment: 'bodyweight', primaryMuscles: ['shoulders', 'core'], movementPattern: 'isolation', isCompound: false, defaultSets: 1, defaultRepRange: [8, 12], defaultRestSec: 30, difficulty: 'beginner', modules: ['handstand', 'mobility'], skillTags: ['wrist-prep'] },
    { name: 'Chest-to-Wall Handstand Hold', category: 'Active Recovery', equipment: 'bodyweight', primaryMuscles: ['shoulders', 'core'], movementPattern: 'vertical_push', isCompound: true, defaultSets: 4, defaultRepRange: [20, 40], defaultRestSec: 75, difficulty: 'intermediate', modules: ['handstand'], skillTags: ['hold'] },
    { name: 'Wall Shoulder Taps', category: 'Active Recovery', equipment: 'bodyweight', primaryMuscles: ['shoulders', 'core'], movementPattern: 'vertical_push', isCompound: true, defaultSets: 3, defaultRepRange: [6, 10], defaultRestSec: 75, difficulty: 'intermediate', modules: ['handstand'], skillTags: ['balance'] },
  ],
  l_sit: [
    { name: 'Seated Compression Pulses', category: 'Core', equipment: 'bodyweight', primaryMuscles: ['core'], movementPattern: 'core', isCompound: false, defaultSets: 3, defaultRepRange: [10, 15], defaultRestSec: 45, difficulty: 'beginner', modules: ['l_sit', 'core'], skillTags: ['compression'] },
    { name: 'Tuck L-Sit Hold', category: 'Core', equipment: 'bodyweight', primaryMuscles: ['core', 'triceps'], movementPattern: 'core', isCompound: true, defaultSets: 4, defaultRepRange: [10, 20], defaultRestSec: 75, difficulty: 'beginner', modules: ['l_sit', 'core'], skillTags: ['hold'] },
    { name: 'One-Leg L-Sit Hold', category: 'Core', equipment: 'bodyweight', primaryMuscles: ['core', 'triceps'], movementPattern: 'core', isCompound: true, defaultSets: 3, defaultRepRange: [8, 15], defaultRestSec: 75, difficulty: 'intermediate', modules: ['l_sit', 'core'], skillTags: ['hold'] },
  ],
  mobility: [
    { name: 'Hip CARs', category: 'Active Recovery', equipment: 'bodyweight', primaryMuscles: ['glutes', 'core'], movementPattern: 'isolation', isCompound: false, defaultSets: 2, defaultRepRange: [5, 8], defaultRestSec: 30, difficulty: 'beginner', modules: ['mobility'], skillTags: ['hips'] },
    { name: 'T-Spine Open Books', category: 'Active Recovery', equipment: 'bodyweight', primaryMuscles: ['back', 'shoulders'], movementPattern: 'isolation', isCompound: false, defaultSets: 2, defaultRepRange: [6, 10], defaultRestSec: 30, difficulty: 'beginner', modules: ['mobility'], skillTags: ['t-spine'] },
  ],
};

const completedWorkoutsThisWeek = (history: Workout[], todayStr: string) =>
  history.filter(workout =>
    workout.completed &&
    isInSameTrainingWeek(workout.date, parseDayString(todayStr)) &&
    workout.exercises.some(exercise => exercise.sets.some(set => set.isCompleted)),
  );

const nameLooksLower = (name: string) => /lower|legs|leg|glute|quad|ham/i.test(name);
const nameLooksUpper = (name: string) => /upper|push|pull|chest|back|shoulder/i.test(name);
const nameLooksConditioning = (name: string) => /conditioning|hyrox|cardio|engine|endurance/i.test(name);

export const getWeeklyTargetSnapshot = (
  program: TrainingProgram,
  history: Workout[],
  todayStr: string,
): WeeklyTargetSnapshot => {
  const weekPlan = generateWeeklyStructure(program);
  const completed = completedWorkoutsThisWeek(history, todayStr);

  const liftDays = weekPlan.filter(day => !day.isConditioning);
  const lowerTarget = Math.max(1, liftDays.filter(day => nameLooksLower(day.label) || /full body/i.test(day.label)).length);
  const upperTarget = Math.max(1, liftDays.filter(day => nameLooksUpper(day.label) || /full body/i.test(day.label)).length);
  const conditioningTarget = program.conditioningPreference === '2_days' ? 2 : program.conditioningPreference === '1_day' ? 1 : 0;
  const coreTarget = program.daysPerWeek >= 5 ? 3 : 2;

  return {
    liftSessionsTarget: liftDays.length,
    liftSessionsCompleted: completed.filter(workout => !nameLooksConditioning(workout.name)).length,
    upperTarget,
    upperCompleted: completed.filter(workout => nameLooksUpper(workout.name)).length,
    lowerTarget,
    lowerCompleted: completed.filter(workout => nameLooksLower(workout.name)).length,
    conditioningTarget,
    conditioningCompleted: completed.filter(workout => nameLooksConditioning(workout.name)).length,
    coreTarget,
    coreCompleted: completed.filter(workout =>
      workout.exercises.some(exercise => exercise.definition?.category === 'Core' || exercise.category === 'Core'),
    ).length,
  };
};

const getTodayGenerated = (program: TrainingProgram, todayStr: string): GeneratedWeek | undefined => {
  const localToday = parseDayString(todayStr);
  const dayIndex = (localToday.getDay() + 6) % 7;
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const day = dayLabels[dayIndex];
  return generateWeeklyStructure(program).find(item => item.day === day);
};

const scheduledToFocus = (generated?: GeneratedWeek): ResolvedFocus | undefined => {
  if (!generated) return undefined;
  if (generated.isConditioning) return FOCUS_CONFIG.conditioning;

  const label = generated.label.toLowerCase();
  if (label.includes('lower') || label.includes('legs')) return FOCUS_CONFIG.lower_body;
  if (label.includes('push')) return FOCUS_CONFIG.push;
  if (label.includes('pull')) return FOCUS_CONFIG.pull;
  if (label.includes('upper')) return FOCUS_CONFIG.upper_body;

  return {
    title: generated.label,
    focus: 'scheduled',
    movementPriority: generated.movementPriority,
    focusMuscles: generated.focusMuscles,
    preferredCategories: ['Chest', 'Back', 'Shoulders', 'Legs', 'Core'],
    rationale: `Today is scheduled as ${generated.label}.`,
  };
};

const chooseFallbackFocus = (targets: WeeklyTargetSnapshot): ResolvedFocus => {
  const lowerRemaining = targets.lowerTarget - targets.lowerCompleted;
  const upperRemaining = targets.upperTarget - targets.upperCompleted;
  const conditioningRemaining = targets.conditioningTarget - targets.conditioningCompleted;

  if (conditioningRemaining > 0 && conditioningRemaining >= lowerRemaining && conditioningRemaining >= upperRemaining) {
    return FOCUS_CONFIG.conditioning;
  }
  if (lowerRemaining > upperRemaining) return FOCUS_CONFIG.lower_body;
  if (upperRemaining > 0) return FOCUS_CONFIG.upper_body;
  return FOCUS_CONFIG.mobility;
};

const resolveFocus = (input: BuildRecommendedWorkoutInput, targets: WeeklyTargetSnapshot): ResolvedFocus => {
  if (input.focusOverride && input.focusOverride !== 'scheduled') return FOCUS_CONFIG[input.focusOverride];

  const scheduled = scheduledToFocus(getTodayGenerated(input.program, input.todayStr));
  if (scheduled) return scheduled;

  return chooseFallbackFocus(targets);
};

const getModuleExercises = (modules: TrainingModule[]): ExerciseDefinition[] => {
  const selected = new Set(modules);
  const result: ExerciseDefinition[] = [];
  selected.forEach(module => {
    result.push(...(MODULE_DRILLS[module] || []));
  });
  return result;
};

const dedupeExercises = (exercises: ExerciseDefinition[]) => {
  const seen = new Set<string>();
  return exercises.filter(exercise => {
    const key = exercise.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const recentExercisePenalty = (exercise: ExerciseDefinition, history: Workout[]) => {
  const recent = [...history]
    .filter(workout => workout.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  const recentIndex = recent.findIndex(workout =>
    workout.exercises.some(item => item.definition?.name?.toLowerCase() === exercise.name.toLowerCase() || item.name.toLowerCase() === exercise.name.toLowerCase()),
  );

  if (recentIndex === -1) return 0;
  return 8 - recentIndex;
};

const scoreExercise = (
  exercise: ExerciseDefinition,
  focus: ResolvedFocus,
  history: Workout[],
  selectedModules: TrainingModule[],
) => {
  let score = 0;

  if (focus.movementPriority.includes(exercise.movementPattern)) score += 24;
  if (focus.preferredCategories.includes(exercise.category)) score += 18;
  if (exercise.primaryMuscles.some(muscle => focus.focusMuscles.includes(muscle))) score += 16;
  if (exercise.isCompound) score += 6;
  if (exercise.category === 'Core') score += 4;

  const moduleHit = exercise.modules?.some(module => selectedModules.includes(module));
  if (moduleHit) score += 30;

  score -= recentExercisePenalty(exercise, history) * 4;

  if (exercise.difficulty === 'advanced') score -= 4;

  return score;
};

const takeBest = (
  pool: ExerciseDefinition[],
  predicate: (exercise: ExerciseDefinition) => boolean,
  count: number,
  focus: ResolvedFocus,
  history: Workout[],
  selectedModules: TrainingModule[],
  excluded: Set<string>,
) => {
  return pool
    .filter(predicate)
    .filter(exercise => !excluded.has(exercise.name.toLowerCase()))
    .map(exercise => ({ exercise, score: scoreExercise(exercise, focus, history, selectedModules) }))
    .sort((a, b) => b.score - a.score || a.exercise.name.localeCompare(b.exercise.name))
    .slice(0, count)
    .map(item => item.exercise);
};

const blocksForFocus = (focus: ResolvedFocus, selectedModules: TrainingModule[]): WorkoutBlock[] => {
  if (focus.focus === 'conditioning' || focus.focus === 'hyrox') {
    return [
      { type: 'activation', title: 'Warm-up + Movement Prep', description: 'Start easy, prime joints, and rehearse today\'s movement patterns.' },
      { type: 'conditioning_optional', title: focus.focus === 'hyrox' ? 'HYROX Conditioning' : 'Conditioning Prescription', description: 'Main engine work for today.' },
      { type: 'core', title: 'Core', description: 'Mandatory trunk work to finish the session.' },
      { type: 'recovery_note', title: 'Cooldown + Recovery', description: 'Downshift before you leave the session.' },
    ];
  }

  if (focus.focus === 'mobility') {
    return [
      { type: 'activation', title: 'Mobility Prep', description: 'Gentle joint prep and breath-led movement.' },
      { type: 'core', title: 'Core Stability', description: 'Light trunk work without draining recovery.' },
      { type: 'recovery_note', title: 'Recovery Recommendation', description: 'Keep this restorative.' },
    ];
  }

  return [
    { type: 'activation', title: 'Activation', description: 'Prime the body part and movement pattern for today.' },
    { type: 'primary', title: 'Primary Lift', description: 'Highest-priority lift. Keep form and progression clean.' },
    { type: 'secondary', title: 'Secondary Lift', description: 'Support the main pattern without stealing recovery.' },
    { type: 'accessory', title: 'Accessory Block', description: 'Targeted volume for today\'s muscles.' },
    { type: 'core', title: 'Core (Mandatory)', description: 'Finish with ab or trunk work.' },
    { type: 'conditioning_optional', title: selectedModules.includes('hyrox') ? 'HYROX Finisher' : 'Optional Conditioning', description: 'Only add this if it supports recovery and time allows.' },
    { type: 'recovery_note', title: 'Recovery Recommendation', description: 'Walk, stretch, hydrate, and log how the session felt.' },
  ];
};

const selectExercises = (
  input: BuildRecommendedWorkoutInput,
  focus: ResolvedFocus,
): ExerciseDefinition[] => {
  const selectedModules = input.selectedModules || [];
  const cap = getSessionExerciseCap(input.program.sessionLengthMin);
  const pool = dedupeExercises([
    ...input.availableExercises,
    ...getModuleExercises(selectedModules),
  ]);

  const selected: ExerciseDefinition[] = [];
  const excluded = new Set<string>();
  const add = (items: ExerciseDefinition[]) => {
    items.forEach(item => {
      const key = item.name.toLowerCase();
      if (excluded.has(key)) return;
      selected.push(item);
      excluded.add(key);
    });
  };

  const mainCount = focus.focus === 'conditioning' || focus.focus === 'hyrox' ? 2 : 1;
  add(takeBest(
    pool,
    exercise => focus.movementPriority.includes(exercise.movementPattern) && exercise.isCompound,
    mainCount,
    focus,
    input.history,
    selectedModules,
    excluded,
  ));

  if (focus.focus !== 'conditioning' && focus.focus !== 'hyrox' && focus.focus !== 'mobility') {
    add(takeBest(
      pool,
      exercise => focus.movementPriority.includes(exercise.movementPattern) && !exercise.isCompound,
      Math.max(1, cap - 3),
      focus,
      input.history,
      selectedModules,
      excluded,
    ));
  }

  if (selectedModules.length) {
    add(takeBest(
      pool,
      exercise => Boolean(exercise.modules?.some(module => selectedModules.includes(module))),
      selectedModules.includes('hyrox') ? 3 : 2,
      focus,
      input.history,
      selectedModules,
      excluded,
    ));
  }

  add(takeBest(
    pool,
    exercise => exercise.category === 'Core' || exercise.primaryMuscles.includes('core'),
    focus.focus === 'conditioning' || focus.focus === 'hyrox' ? 2 : 1,
    focus,
    input.history,
    selectedModules,
    excluded,
  ));

  if (focus.focus === 'conditioning' || focus.focus === 'hyrox') {
    add(takeBest(
      pool,
      exercise => exercise.category === 'Cardio' || exercise.category === 'Active Recovery' || exercise.modules?.includes('conditioning'),
      3,
      focus,
      input.history,
      selectedModules,
      excluded,
    ));
  }

  return selected.slice(0, Math.max(cap, selectedModules.length ? cap + 2 : cap));
};

const formatRemaining = (completed: number, target: number) => `${Math.max(target - completed, 0)} remaining`;

export const buildRecommendedWorkout = (input: BuildRecommendedWorkoutInput): RecommendedWorkout => {
  const weeklyTargets = getWeeklyTargetSnapshot(input.program, input.history, input.todayStr);
  const focus = resolveFocus(input, weeklyTargets);
  const selectedModules = input.selectedModules || [];
  const exercises = selectExercises(input, focus);

  const rationale = [
    focus.rationale,
    `Weekly balance: upper ${weeklyTargets.upperCompleted}/${weeklyTargets.upperTarget}, lower ${weeklyTargets.lowerCompleted}/${weeklyTargets.lowerTarget}, core ${weeklyTargets.coreCompleted}/${weeklyTargets.coreTarget}, conditioning ${weeklyTargets.conditioningCompleted}/${weeklyTargets.conditioningTarget}.`,
  ];

  if (selectedModules.length) {
    rationale.push(`Today's add-ons: ${selectedModules.map(module => MODULE_OPTIONS.find(option => option.value === module)?.label || module).join(', ')}.`);
  }

  if (input.focusOverride && input.focusOverride !== 'scheduled') {
    rationale.push(`Focus changed for today. The weekly plan still needs upper ${formatRemaining(weeklyTargets.upperCompleted, weeklyTargets.upperTarget)}, lower ${formatRemaining(weeklyTargets.lowerCompleted, weeklyTargets.lowerTarget)}, and conditioning ${formatRemaining(weeklyTargets.conditioningCompleted, weeklyTargets.conditioningTarget)}.`);
  }

  return {
    title: focus.title,
    focus: focus.focus,
    movementPriority: focus.movementPriority,
    focusMuscles: focus.focusMuscles,
    blocks: blocksForFocus(focus, selectedModules),
    exercises,
    weeklyTargets,
    rationale,
  };
};
