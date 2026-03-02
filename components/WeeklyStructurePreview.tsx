import React from 'react';
import { WeekDay } from '../types';

interface WeeklyStructurePreviewProps {
  week: WeekDay[];
  todayIndex?: number;
  completedDayIndexes?: number[];
}

const badgeClasses: Record<WeekDay['type'], string> = {
  lift: 'bg-blue-50 text-blue-600 border-blue-100',
  conditioning: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  rest: 'bg-stone-100 text-stone-500 border-stone-200',
};

const badgeLabel: Record<WeekDay['type'], string> = {
  lift: 'Lift',
  conditioning: 'Conditioning',
  rest: 'Rest',
};

const WeeklyStructurePreview: React.FC<WeeklyStructurePreviewProps> = ({ week, todayIndex, completedDayIndexes = [] }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
      {week.map((day) => {
        const isToday = todayIndex === day.dayIndex;
        const completed = completedDayIndexes.includes(day.dayIndex);
        return (
          <div
            key={day.dayIndex}
            className={`rounded-2xl border p-2.5 bg-white shadow-sm transition-all hover:shadow-md min-h-[112px] ${isToday ? 'ring-2 ring-[#7c9082]/30 border-[#7c9082]/30' : 'border-stone-100'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">{day.label.slice(0, 3)}</p>
              {completed && <span className="text-[9px] text-[#7c9082] font-bold">✓</span>}
            </div>
            <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${badgeClasses[day.type]}`}>
              {badgeLabel[day.type]}
            </span>
            <p className={`mt-2 text-[11px] ${day.type === 'rest' ? 'text-stone-400' : 'text-stone-600'} leading-snug line-clamp-2`}>
              {day.type === 'rest' ? 'Rest & Recovery' : day.focus || 'Session'}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default WeeklyStructurePreview;
