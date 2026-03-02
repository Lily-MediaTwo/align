
import React, { useEffect, useState } from 'react';
import { AppState, CyclePhase } from '../types';
import { getAdaptiveNudge } from '../services/geminiService';
import { formatLocalDate, getDateDaysAgo, parseDayString, isOnOrAfterDate, formatLocalTime } from '../utils/dateUtils';
import { generateWeeklyStructure } from '../lib/programGenerator';

interface DashboardProps {
  state: AppState;
}

const Dashboard: React.FC<DashboardProps> = ({ state }) => {
  const [nudge, setNudge] = useState<string>("Aligning your momentum...");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const nudgeMsg = await getAdaptiveNudge(state);
      setNudge(nudgeMsg);
      setIsLoading(false);
    };
    fetchData();
  }, [state]);

  const localToday = parseDayString(state.todayStr);
  const dateStr = formatLocalDate(localToday, { weekday: 'long', month: 'long', day: 'numeric' }, 'en-US');
  const dayIndex = (localToday.getDay() + 6) % 7;
  const weeklyStructure = generateWeeklyStructure(state.trainingProgram);
  const weekDays = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const todayKey = weekDays[dayIndex];
  const todaySplit = weeklyStructure.find(item => item.day === todayKey) || weeklyStructure[0];

  // Cycle Phase Calculation
  const getCycleDay = () => {
    const startDate = parseDayString(state.cycleConfig.lastStartDate);
    // Set both to midnight to compare full days
    const t = new Date(localToday.getFullYear(), localToday.getMonth(), localToday.getDate());
    const diffTime = Math.abs(t.getTime() - startDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return (diffDays % state.cycleConfig.cycleLength) + 1;
  };
  
  const dayOfCycle = getCycleDay();
  
  let currentPhase: CyclePhase = 'follicular';
  if (dayOfCycle <= 5) currentPhase = 'menstrual';
  else if (dayOfCycle <= 13) currentPhase = 'follicular';
  else if (dayOfCycle === 14) currentPhase = 'ovulatory';
  else currentPhase = 'luteal';

  const todayStr = state.todayStr;
  const todayHydration = state.hydration
    .filter(h => h.date === todayStr)
    .reduce((sum, h) => sum + h.amountOz, 0);
  const hydrationGoal = state.dailyHydrationGoal;

  const getGreeting = () => {
    const hour = Number(formatLocalTime(new Date(), { hour: 'numeric', hour12: false }));
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const cycleAdvice: Record<string, string> = {
    menstrual: "Prioritize rest and warm comfort. Movement should be intuitive and gentle.",
    follicular: "Strength and creativity are peaking. Lean into your higher energy capacity.",
    ovulatory: "Social energy and physical power are at their zenith. Go for that peak performance.",
    luteal: "Metabolism is higher, but endurance may dip. Focus on steady, restorative pacing."
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      {/* Date Header */}
      <section className="pt-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#d4a373] mb-2">{getGreeting()}</p>
        <h2 className="serif text-4xl font-semibold text-stone-800 tracking-tight">{dateStr}</h2>
        
        {/* Today's Focus Highlight */}
        <div className="mt-8 flex items-center gap-4 bg-white border border-stone-100 p-6 rounded-[2.5rem] shadow-sm relative group transition-all">
          <div className="w-16 h-16 rounded-[1.5rem] bg-[#7c9082]/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
            {todaySplit?.label.toLowerCase().includes('rest') ? '🌿' : '⚡'}
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-300">Today's Focus</p>
            <h3 className="text-2xl font-medium text-[#4a5d50] serif">{todaySplit?.label || 'Balance'}</h3>
          </div>
        </div>
      </section>

      {/* Full 7-Day Split Rhythm */}
      <section>
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Weekly Rhythm</h3>
        </div>
        <div className="flex justify-between gap-1">
          {weeklyStructure.map((item) => {
            const isToday = item.day === todayKey;
            return (
              <div 
                key={item.day}
                className={`flex-1 flex flex-col items-center py-4 rounded-2xl border transition-all duration-300 ${
                  isToday 
                    ? 'bg-[#7c9082] border-[#7c9082] text-white shadow-lg' 
                    : 'bg-white border-stone-50 text-stone-300'
                }`}
              >
                <span className={`text-[8px] font-bold uppercase mb-1.5 ${isToday ? 'text-white/70' : 'text-stone-300'}`}>
                  {item.day[0]}
                </span>
                <span className="text-[8px] font-bold text-center leading-[1.1] scale-[0.85] origin-top">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Adaptive Nudge (Gemini) */}
      <section className="bg-white border border-stone-100 p-6 rounded-[2rem] relative overflow-hidden shadow-sm">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7c9082]"></span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7c9082]">Companion Insight</span>
          </div>
          <p className="serif text-lg leading-relaxed text-stone-700 italic">
            "{isLoading ? <span className="opacity-50">Listening to your patterns...</span> : nudge}"
          </p>
        </div>
      </section>

      {/* Main Stats Momentum */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#f0f4f1] p-6 rounded-[2.5rem] border border-[#7c9082]/10 group">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[#7c9082] text-[10px] font-bold uppercase tracking-widest">Hydration</span>
            <span className="group-hover:animate-bounce">💧</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-light text-stone-700">{todayHydration}</span>
            <span className="text-xs text-stone-400 font-medium">oz</span>
          </div>
          <div className="w-full bg-white/50 h-1.5 mt-4 rounded-full overflow-hidden">
            <div 
              className="bg-[#7c9082] h-full transition-all duration-1000 ease-out" 
              style={{ width: `${Math.min((todayHydration / hydrationGoal) * 100, 100)}%` }} 
            />
          </div>
        </div>

        <div className="bg-[#fcf8f4] p-6 rounded-[2.5rem] border border-[#d4a373]/10 group">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[#d4a373] text-[10px] font-bold uppercase tracking-widest">Momentum</span>
            <span className="group-hover:rotate-12 transition-transform">💪</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-light text-stone-700">
              {state.workouts.filter(w => w.completed && isOnOrAfterDate(w.date, getDateDaysAgo(7))).length}
            </span>
            <span className="text-xs text-stone-400 font-medium">this week</span>
          </div>
        </div>
      </div>

      {/* Dynamic Cycle Intelligence */}
      <section className="bg-gradient-to-br from-[#fdf2f2] to-[#fff9f0] p-7 rounded-[2.5rem] border border-rose-100/50 shadow-sm">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-lg">🌸</div>
             <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-800/40">Cycle Intelligence</h3>
          </div>
          <span className="text-[9px] px-3 py-1 bg-white rounded-full text-rose-500 font-bold uppercase tracking-widest shadow-sm border border-rose-50 capitalize">
            {currentPhase} Phase
          </span>
        </div>
        <div className="space-y-2">
          <p className="text-base text-stone-700 serif font-medium italic leading-snug">
            "{cycleAdvice[currentPhase]}"
          </p>
          <p className="text-[10px] text-rose-300 font-bold uppercase tracking-widest mt-2">— Day {dayOfCycle} of {state.cycleConfig.cycleLength}</p>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
