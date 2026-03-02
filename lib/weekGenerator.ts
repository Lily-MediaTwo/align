import { TrainingProgram, WeekDay } from '../types';
import { generateWeeklyStructure } from './programGenerator';

const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export const getFullWeekStructure = (program: TrainingProgram): WeekDay[] => {
  const generated = generateWeeklyStructure(program);
  const byDay = new Map(generated.map((g) => [g.day, g]));

  return DAY_SHORT.map((short, idx) => {
    const entry = byDay.get(short);
    if (!entry) {
      return { dayIndex: idx as WeekDay['dayIndex'], label: DAY_LABELS[idx], type: 'rest', focus: 'Rest & Recovery' };
    }

    if (entry.isConditioning) {
      return {
        dayIndex: idx as WeekDay['dayIndex'],
        label: DAY_LABELS[idx],
        type: 'conditioning',
        focus: entry.label,
      };
    }

    return {
      dayIndex: idx as WeekDay['dayIndex'],
      label: DAY_LABELS[idx],
      type: 'lift',
      focus: entry.label,
    };
  });
};
