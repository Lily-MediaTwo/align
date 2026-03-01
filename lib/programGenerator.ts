import { ProgramDayTemplate, ProgramSettings } from '../types';

export const generateWeeklyProgram = (settings: ProgramSettings): ProgramDayTemplate[] => {
  const { daysPerWeek, emphasis } = settings;

  if (emphasis === 'glutes_legs_3x' && daysPerWeek >= 5) {
    return [
      {
        name: 'Lower A (Quad + Glute)',
        focusMuscles: ['quads', 'glutes', 'calves'],
        movementPriority: ['squat', 'glute_bridge', 'lunge', 'isolation', 'core'],
      },
      {
        name: 'Upper A',
        focusMuscles: ['chest', 'back', 'shoulders', 'triceps', 'biceps'],
        movementPriority: ['horizontal_push', 'horizontal_pull', 'vertical_push', 'vertical_pull', 'isolation'],
      },
      {
        name: 'Lower B (Hamstring + Glute)',
        focusMuscles: ['hamstrings', 'glutes', 'core'],
        movementPriority: ['hinge', 'isolation', 'glute_bridge', 'core', 'carry'],
      },
      {
        name: 'Upper B',
        focusMuscles: ['back', 'chest', 'shoulders', 'biceps', 'triceps'],
        movementPriority: ['vertical_pull', 'horizontal_push', 'horizontal_pull', 'vertical_push', 'isolation'],
      },
      {
        name: 'Lower C (Glute Pump + Unilateral + Calves)',
        focusMuscles: ['glutes', 'quads', 'calves'],
        movementPriority: ['squat', 'lunge', 'isolation', 'glute_bridge', 'core'],
      },
      ...(daysPerWeek === 6
        ? [{
            name: 'Recovery / Conditioning',
            focusMuscles: ['core', 'calves'],
            movementPriority: ['carry', 'core', 'isolation'],
          } as ProgramDayTemplate]
        : []),
    ];
  }

  const balancedTemplates: Record<ProgramSettings['daysPerWeek'], ProgramDayTemplate[]> = {
    3: [
      { name: 'Full Body A', focusMuscles: ['quads', 'glutes', 'chest', 'back', 'core'], movementPriority: ['squat', 'horizontal_push', 'horizontal_pull', 'core', 'isolation'] },
      { name: 'Full Body B', focusMuscles: ['hamstrings', 'glutes', 'shoulders', 'back', 'core'], movementPriority: ['hinge', 'vertical_push', 'vertical_pull', 'lunge', 'core'] },
      { name: 'Full Body C', focusMuscles: ['quads', 'glutes', 'chest', 'back', 'calves'], movementPriority: ['squat', 'horizontal_push', 'horizontal_pull', 'isolation', 'carry'] },
    ],
    4: [
      { name: 'Upper A', focusMuscles: ['chest', 'back', 'shoulders', 'triceps'], movementPriority: ['horizontal_push', 'horizontal_pull', 'vertical_push', 'vertical_pull', 'isolation'] },
      { name: 'Lower A', focusMuscles: ['quads', 'glutes', 'calves'], movementPriority: ['squat', 'lunge', 'isolation', 'core'] },
      { name: 'Upper B', focusMuscles: ['back', 'chest', 'biceps', 'shoulders'], movementPriority: ['vertical_pull', 'horizontal_push', 'horizontal_pull', 'isolation'] },
      { name: 'Lower B', focusMuscles: ['hamstrings', 'glutes', 'core'], movementPriority: ['hinge', 'glute_bridge', 'isolation', 'core'] },
    ],
    5: [
      { name: 'Lower A', focusMuscles: ['quads', 'glutes'], movementPriority: ['squat', 'lunge', 'isolation', 'core'] },
      { name: 'Upper A', focusMuscles: ['chest', 'back', 'shoulders'], movementPriority: ['horizontal_push', 'horizontal_pull', 'vertical_push', 'isolation'] },
      { name: 'Lower B', focusMuscles: ['hamstrings', 'glutes', 'calves'], movementPriority: ['hinge', 'glute_bridge', 'isolation', 'core'] },
      { name: 'Upper B', focusMuscles: ['back', 'chest', 'arms'], movementPriority: ['vertical_pull', 'horizontal_push', 'isolation'] },
      { name: 'Full Body Pump', focusMuscles: ['glutes', 'back', 'shoulders', 'core'], movementPriority: ['lunge', 'horizontal_pull', 'vertical_push', 'core'] },
    ],
    6: [
      { name: 'Push', focusMuscles: ['chest', 'shoulders', 'triceps'], movementPriority: ['horizontal_push', 'vertical_push', 'isolation'] },
      { name: 'Pull', focusMuscles: ['back', 'biceps'], movementPriority: ['horizontal_pull', 'vertical_pull', 'isolation'] },
      { name: 'Lower', focusMuscles: ['quads', 'glutes', 'calves'], movementPriority: ['squat', 'lunge', 'isolation'] },
      { name: 'Push', focusMuscles: ['chest', 'shoulders', 'triceps'], movementPriority: ['horizontal_push', 'vertical_push', 'isolation'] },
      { name: 'Pull', focusMuscles: ['back', 'biceps'], movementPriority: ['horizontal_pull', 'vertical_pull', 'isolation'] },
      { name: 'Lower', focusMuscles: ['hamstrings', 'glutes', 'core'], movementPriority: ['hinge', 'glute_bridge', 'isolation', 'core'] },
    ],
  };

  return balancedTemplates[daysPerWeek];
};
