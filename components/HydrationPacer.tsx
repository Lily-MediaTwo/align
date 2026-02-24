
import React, { useState, useMemo } from 'react';
import { HydrationLog } from '../types';
import { formatLocalDate, formatLocalTime, getLastNDays, parseDayString } from '../utils/dateUtils';

interface HydrationPacerProps {
  logs: HydrationLog[];
  dailyGoal: number;
  hydrationGoals: Record<string, number>;
  todayStr: string;
  onAdd: (oz: number) => void;
  onUpdateGoal: (oz: number) => void;
}

const QUICK_AMOUNTS = [8, 12, 16, 20];

const HydrationPacer: React.FC<HydrationPacerProps> = ({ logs, dailyGoal, hydrationGoals, todayStr, onAdd, onUpdateGoal }) => {
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(dailyGoal);
  const [isLogging, setIsLogging] = useState(false);
  const [customAmount, setCustomAmount] = useState('24');

  // Sync tempGoal if dailyGoal changes externally
  React.useEffect(() => {
    setTempGoal(dailyGoal);
  }, [dailyGoal]);

  const now = new Date();
  const todayLogs = useMemo(
    () => logs
      .filter(l => l.date === todayStr)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [logs, todayStr],
  );

  const totalToday = todayLogs.reduce((sum, l) => sum + l.amountOz, 0);
  const progress = dailyGoal > 0 ? (totalToday / dailyGoal) * 100 : 0;

  // Dynamic Pacing Logic (7am - 11pm window = 16 hours)
  const hour = now.getHours();
  const startHour = 7;
  const endHour = 23;
  const totalActiveHours = endHour - startHour;
  const elapsedHours = Math.min(totalActiveHours, Math.max(0, hour - startHour));
  const targetAtThisHour = dailyGoal > 0
    ? Math.min(dailyGoal, (elapsedHours / totalActiveHours) * dailyGoal)
    : 0;
  const isBehind = totalToday < targetAtThisHour;

  const resolvedGoalByDay = useMemo(() => {
    const sortedGoalDays = Object.entries(hydrationGoals || {})
      .sort(([leftDay], [rightDay]) => leftDay.localeCompare(rightDay));

    return (dayString: string): number => {
      let goalForDay = dailyGoal;
      for (const [goalDay, goal] of sortedGoalDays) {
        if (goalDay <= dayString) {
          goalForDay = goal;
        } else {
          break;
        }
      }
      return goalForDay;
    };
  }, [dailyGoal, hydrationGoals]);

  const totalsByDay = useMemo(() => {
    return logs.reduce<Record<string, number>>((acc, log) => {
      acc[log.date] = (acc[log.date] || 0) + log.amountOz;
      return acc;
    }, {});
  }, [logs]);

  // History Calculation (Last 7 Days)
  const history = useMemo(() => {
    return getLastNDays(7).map((dayString) => {
      const dayTotal = totalsByDay[dayString] || 0;
      const goalForDay = resolvedGoalByDay(dayString);
      return {
        date: dayString,
        dayName: formatLocalDate(parseDayString(dayString), { weekday: 'short' }),
        total: dayTotal,
        goal: goalForDay,
        success: goalForDay > 0 && dayTotal >= goalForDay,
      };
    });
  }, [totalsByDay, resolvedGoalByDay]);

  const trendStats = useMemo(() => {
    const last14 = getLastNDays(14).map((dayString) => {
      const total = totalsByDay[dayString] || 0;
      const goal = resolvedGoalByDay(dayString);
      return { total, goal, success: goal > 0 && total >= goal };
    });

    const daysHitGoal = last14.filter(day => day.success).length;
    const avgOz = Math.round(last14.reduce((sum, day) => sum + day.total, 0) / Math.max(last14.length, 1));

    return { daysHitGoal, avgOz };
  }, [totalsByDay, resolvedGoalByDay]);

  const handleUpdateGoal = () => {
    const normalizedGoal = Math.max(1, Math.round(tempGoal));
    onUpdateGoal(normalizedGoal);
    setIsEditingGoal(false);
  };

  const handleAdd = (oz: number) => {
    if (isLogging) return;
    setIsLogging(true);
    onAdd(oz);
    setTimeout(() => setIsLogging(false), 500); // 500ms cooldown
  };

  const handleCustomAdd = () => {
    const parsedAmount = parseInt(customAmount, 10);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return;
    handleAdd(parsedAmount);
  };

  const radius = 85;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-12">
      <header className="text-center">
        <h2 className="serif text-2xl text-stone-800">Steady Pacing</h2>
        <p className="text-[9px] text-stone-300 font-bold uppercase tracking-widest mt-1">Updated {formatLocalTime(new Date(), { hour: '2-digit', minute: '2-digit' })}</p>
        <p className="text-sm text-stone-400 mt-2 italic">
          {isBehind ? "A small sip would put you back on track." : "You're perfectly on pace."}
        </p>
      </header>

      {/* Progress Circle - Resized to prevent cutoff */}
      <div className="relative w-56 h-56 mx-auto flex items-center justify-center">
        <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
          <circle
            cx="100"
            cy="100"
            r="85"
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth="10"
          />
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="transparent"
            stroke="#7c9082"
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - Math.min(progress, 100) / 100)}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-5xl font-light text-stone-700">{totalToday}</span>
          <div className="mt-1 flex flex-col items-center">
             <span className="text-[10px] text-stone-400 uppercase tracking-widest">oz / {dailyGoal}</span>
             <button
                onClick={() => setIsEditingGoal(true)}
                className="mt-2 text-[9px] font-bold text-[#7c9082] uppercase bg-[#7c9082]/10 px-3 py-1 rounded-full hover:bg-[#7c9082]/20 transition-all"
             >
               Set Goal
             </button>
          </div>
        </div>
      </div>

      {isEditingGoal && (
        <div className="bg-white border-2 border-[#7c9082]/20 p-6 rounded-[2rem] shadow-xl animate-in zoom-in-95 space-y-4">
           <div className="flex justify-between items-center">
             <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Daily Hydration Goal</h3>
             <button onClick={() => setIsEditingGoal(false)} className="text-stone-300">✕</button>
           </div>
           <div className="flex gap-2">
             <input
               type="number"
               value={tempGoal}
               min={1}
               onChange={(e) => setTempGoal(parseInt(e.target.value, 10) || 0)}
               className="flex-1 bg-stone-50 border border-stone-100 rounded-2xl px-4 py-3 text-sm"
             />
             <button
               onClick={handleUpdateGoal}
               className="bg-[#7c9082] text-white px-6 rounded-2xl text-sm font-bold"
             >
               Save
             </button>
           </div>
        </div>
      )}

      {/* Manual Logging */}
      <div className="grid grid-cols-2 gap-3">
        {QUICK_AMOUNTS.map((amount) => (
          <button
            key={amount}
            onClick={() => handleAdd(amount)}
            disabled={isLogging}
            className={`bg-white border border-stone-100 p-5 rounded-3xl shadow-sm hover:border-[#7c9082] transition-colors group text-left ${isLogging ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="text-xs font-bold uppercase tracking-widest text-stone-300 block mb-1">Quick Add</span>
            <span className="text-lg font-medium text-stone-700">+{amount}oz</span>
          </button>
        ))}
      </div>

      <div className="bg-white border border-stone-100 p-4 rounded-3xl space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Custom amount</p>
        <div className="flex gap-2">
          <input
            type="number"
            min={1}
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            className="flex-1 bg-stone-50 border border-stone-100 rounded-2xl px-4 py-3 text-sm"
            placeholder="oz"
          />
          <button
            onClick={handleCustomAdd}
            disabled={isLogging}
            className={`bg-[#7c9082] text-white px-5 rounded-2xl text-sm font-bold ${isLogging ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Add
          </button>
        </div>
      </div>

      {/* History Visualization */}
      <section>
        <div className="flex justify-between items-end mb-4 px-2">
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Weekly Achievement</h3>
            <p className="text-[9px] text-stone-300 mt-0.5 font-medium">Goal: {dailyGoal}oz daily</p>
          </div>
        </div>
        <div className="flex justify-between gap-1">
          {history.map((day, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                  day.success ? 'bg-[#7c9082] text-white shadow-lg shadow-[#7c9082]/20' : 'bg-stone-50 text-stone-200 border border-stone-100'
                }`}
              >
                {day.success ? '✓' : ''}
              </div>
              <span className={`text-[8px] font-bold uppercase ${day.success ? 'text-[#7c9082]' : 'text-stone-300'}`}>
                {day.dayName}
              </span>
              {/* Tooltip for historical goal */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-[8px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                {day.total} / {day.goal} oz
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className="bg-[#f0f4f1] p-4 rounded-2xl border border-[#7c9082]/10">
          <p className="text-[9px] font-bold uppercase tracking-widest text-[#7c9082]">14-day consistency</p>
          <p className="text-2xl font-light text-stone-700 mt-1">{trendStats.daysHitGoal}/14</p>
          <p className="text-[10px] text-stone-400">days hit goal</p>
        </div>
        <div className="bg-[#fcf8f4] p-4 rounded-2xl border border-[#d4a373]/10">
          <p className="text-[9px] font-bold uppercase tracking-widest text-[#d4a373]">14-day average</p>
          <p className="text-2xl font-light text-stone-700 mt-1">{trendStats.avgOz}oz</p>
          <p className="text-[10px] text-stone-400">per day</p>
        </div>
      </section>

      <section>
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-4 px-2">Recent Logs</h3>
        <div className="space-y-2">
          {todayLogs.length === 0 ? (
            <p className="text-center text-xs text-stone-300 py-4">No water logged yet today.</p>
          ) : (
            todayLogs.slice(0, 5).map(log => (
              <div key={log.id} className="flex justify-between items-center bg-stone-50/50 px-4 py-3 rounded-2xl border border-stone-100/50">
                <span className="text-sm text-stone-600 font-medium">{log.amountOz}oz sip</span>
                <span className="text-[10px] text-stone-400 font-bold uppercase">
                  {formatLocalTime(log.timestamp, { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default HydrationPacer;
