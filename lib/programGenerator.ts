import { GeneratedWeek, ProgramDayTemplate, TrainingProgram } from '../types';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const conditioningTemplate = (day: string): GeneratedWeek => ({
  day,
  label: 'Conditioning',
  focusMuscles: ['core', 'calves'],
  movementPriority: ['carry', 'core', 'isolation'],
  isConditioning: true,
});

const toGenerated = (day: string, name: string, focusMuscles: GeneratedWeek['focusMuscles'], movementPriority: GeneratedWeek['movementPriority']): GeneratedWeek => ({
  day,
  label: name,
  focusMuscles,
  movementPriority,
});

const baseByDays = (program: TrainingProgram): GeneratedWeek[] => {
  const { daysPerWeek, emphasis } = program;

  if (daysPerWeek === 3) {
    return [
      toGenerated('Mon', 'Full Body A', ['quads', 'glutes', 'chest', 'back', 'core'], ['squat', 'horizontal_push', 'horizontal_pull', 'core']),
      toGenerated('Wed', 'Full Body B', ['hamstrings', 'glutes', 'shoulders', 'back', 'core'], ['hinge', 'vertical_push', 'vertical_pull', 'core']),
      toGenerated('Fri', 'Full Body C', ['quads', 'glutes', 'back', 'core'], ['lunge', 'horizontal_pull', 'horizontal_push', 'core']),
    ];
  }

  if (daysPerWeek === 4) {
    return [
      toGenerated('Mon', 'Upper A', ['chest', 'back', 'shoulders', 'triceps'], ['horizontal_push', 'horizontal_pull', 'vertical_push', 'isolation']),
      toGenerated('Tue', 'Lower A', ['quads', 'glutes', 'calves'], ['squat', 'lunge', 'isolation', 'core']),
      toGenerated('Thu', 'Upper B', ['back', 'chest', 'biceps', 'shoulders'], ['vertical_pull', 'horizontal_push', 'horizontal_pull', 'isolation']),
      toGenerated('Fri', 'Lower B', ['hamstrings', 'glutes', 'calves'], ['hinge', 'glute_bridge', 'isolation', 'core']),
    ];
  }

  if (daysPerWeek === 5 && emphasis === 'glutes_legs') {
    return [
      toGenerated('Mon', 'Lower (Glute/Quad)', ['glutes', 'quads', 'calves'], ['squat', 'glute_bridge', 'lunge', 'isolation']),
      toGenerated('Tue', 'Upper A', ['chest', 'back', 'shoulders', 'triceps'], ['horizontal_push', 'horizontal_pull', 'vertical_push', 'isolation']),
      toGenerated('Wed', 'Lower (Ham/Glute)', ['hamstrings', 'glutes', 'core'], ['hinge', 'isolation', 'glute_bridge', 'core']),
      toGenerated('Fri', 'Upper B', ['back', 'chest', 'biceps', 'shoulders'], ['vertical_pull', 'horizontal_push', 'horizontal_pull', 'isolation']),
      toGenerated('Sat', 'Lower (Pump)', ['glutes', 'quads', 'calves'], ['lunge', 'isolation', 'glute_bridge', 'core']),
    ];
  }

  if (daysPerWeek === 6) {
    return [
      toGenerated('Mon', 'Push', ['chest', 'shoulders', 'triceps'], ['horizontal_push', 'vertical_push', 'isolation']),
      toGenerated('Tue', 'Pull', ['back', 'biceps'], ['horizontal_pull', 'vertical_pull', 'isolation']),
      toGenerated('Wed', 'Legs', ['quads', 'glutes', 'hamstrings'], ['squat', 'hinge', 'lunge', 'isolation']),
      toGenerated('Thu', 'Push', ['chest', 'shoulders', 'triceps'], ['horizontal_push', 'vertical_push', 'isolation']),
      toGenerated('Fri', 'Pull', ['back', 'biceps'], ['horizontal_pull', 'vertical_pull', 'isolation']),
      toGenerated('Sat', 'Legs', ['quads', 'glutes', 'hamstrings'], ['squat', 'hinge', 'lunge', 'isolation']),
    ];
  }

  // default 5-day balanced
  return [
    toGenerated('Mon', 'Upper A', ['chest', 'back', 'shoulders'], ['horizontal_push', 'horizontal_pull', 'vertical_push']),
    toGenerated('Tue', 'Lower A', ['quads', 'glutes', 'calves'], ['squat', 'lunge', 'isolation']),
    toGenerated('Wed', 'Upper B', ['back', 'chest', 'biceps'], ['vertical_pull', 'horizontal_push', 'horizontal_pull']),
    toGenerated('Fri', 'Lower B', ['hamstrings', 'glutes', 'core'], ['hinge', 'glute_bridge', 'core']),
    toGenerated('Sat', 'Upper/Conditioning', ['shoulders', 'core'], ['carry', 'core', 'isolation']),
  ];
};

const canInsertConditioningBetween = (prev?: GeneratedWeek, next?: GeneratedWeek) => {
  if (!prev || !next) return true;
  const prevHeavyLower = /lower|legs/i.test(prev.label) && !prev.isConditioning;
  const nextHeavyLower = /lower|legs/i.test(next.label) && !next.isConditioning;
  return !(prevHeavyLower && nextHeavyLower);
};

export const generateWeeklyStructure = (program: TrainingProgram): GeneratedWeek[] => {
  const base = baseByDays(program);

  const needed = program.conditioningPreference === '2_days' ? 2 : program.conditioningPreference === '1_day' ? 1 : 0;
  if (!needed) return base;

  const result = [...base];
  const candidateSlots = [2, 3, 4, 1, 5]; // mid-week first

  let inserted = 0;
  for (const slot of candidateSlots) {
    if (inserted >= needed) break;
    const day = DAYS[slot];
    if (result.some(r => r.day === day)) continue;

    // find insertion index by day order
    const insertionIndex = result.findIndex(r => DAYS.indexOf(r.day) > slot);
    const idx = insertionIndex === -1 ? result.length : insertionIndex;

    const prev = result[idx - 1];
    const next = result[idx];
    if (!canInsertConditioningBetween(prev, next)) continue;

    result.splice(idx, 0, conditioningTemplate(day));
    inserted += 1;
  }

  return result.sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day));
};

export const getTodayStructure = (program: TrainingProgram, todayIndex: number): GeneratedWeek => {
  const generated = generateWeeklyStructure(program);
  const day = DAYS[todayIndex];
  return generated.find(g => g.day === day) || generated[0];
};

// Backward-compatible export for old callsites while refactoring
export const generateWeeklyProgram = (settings: any): ProgramDayTemplate[] =>
  generateWeeklyStructure({
    goal: settings.goal || 'hypertrophy',
    daysPerWeek: settings.daysPerWeek || 4,
    emphasis: settings.emphasis || 'balanced',
    sessionLengthMin: settings.sessionLengthMin || 60,
    conditioningPreference: settings.conditioningPreference || 'none',
  }).map(day => ({
    name: day.label,
    focusMuscles: day.focusMuscles,
    movementPriority: day.movementPriority,
  }));
