
import React, { useState } from 'react';
import { AppState, CycleConfig, UserGoal, TrainingProgram } from '../types';
import { formatLocalDate, parseDayString, toLocalDayString } from '../utils/dateUtils';
import { generateWeeklyStructure } from '../lib/programGenerator';

interface AlignmentCenterProps {
  state: AppState;
  onUpdateCycle: (config: Partial<CycleConfig>) => void;
  onAddGoal: (goal: Omit<UserGoal, 'id' | 'progress' | 'current'>) => void;
  onDeleteGoal: (id: string) => void;
  onUpdateTrainingProgram: (program: Partial<TrainingProgram>) => void;
}

const CalendarPicker: React.FC<{ 
  selectedDate: string; 
  onChange: (date: string) => void 
}> = ({ selectedDate, onChange }) => {
  const [viewDate, setViewDate] = useState(() => {
    if (selectedDate) {
      return parseDayString(selectedDate);
    }
    return new Date();
  });
  
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
  
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleString('default', { month: 'long' });
  
  const totalDays = daysInMonth(year, month);
  const startDay = (firstDayOfMonth(year, month) + 6) % 7; // Adjust for Monday start
  
  const days = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let i = 1; i <= totalDays; i++) days.push(i);

  const handlePrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(year, month + 1, 1));
  
  const isSelected = (day: number) => {
    const d = new Date(year, month, day);
    return toLocalDayString(d) === selectedDate;
  };

  const selectDay = (day: number) => {
    const d = new Date(year, month, day);
    onChange(toLocalDayString(d));
  };

  return (
    <div className="bg-stone-50 rounded-3xl p-4 border border-stone-100">
      <div className="flex justify-between items-center mb-4 px-2">
        <button onClick={handlePrevMonth} className="text-stone-400 hover:text-stone-600 p-1">←</button>
        <span className="serif text-sm font-medium text-stone-700">{monthName} {year}</span>
        <button onClick={handleNextMonth} className="text-stone-400 hover:text-stone-600 p-1">→</button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={i} className="text-[9px] font-bold text-stone-300 text-center uppercase">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => (
          <div key={i} className="aspect-square flex items-center justify-center">
            {day && (
              <button
                onClick={() => selectDay(day)}
                className={`w-8 h-8 rounded-full text-xs transition-all ${
                  isSelected(day)
                    ? 'bg-[#7c9082] text-white font-bold shadow-sm'
                    : 'text-stone-600 hover:bg-stone-200/50'
                }`}
              >
                {day}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const AlignmentCenter: React.FC<AlignmentCenterProps> = ({ 
  state, 
  onUpdateCycle,
  onAddGoal,
  onDeleteGoal,
  onUpdateTrainingProgram
}) => {
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [newGoal, setNewGoal] = useState<Omit<UserGoal, 'id' | 'progress' | 'current'>>({
    title: '',
    type: 'weekly',
    target: 1,
    unit: 'workouts',
    autoTrack: 'workouts'
  });

  const handleAddGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title) return;
    onAddGoal(newGoal);
    setShowGoalForm(false);
    setNewGoal({
      title: '',
      type: 'weekly',
      target: 1,
      unit: 'workouts',
      autoTrack: 'workouts'
    });
  };


  const generatedPreview = generateWeeklyStructure(state.trainingProgram);

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-24">
      <header>
        <h2 className="serif text-3xl text-stone-800">Alignment Center</h2>
        <p className="text-sm text-stone-400 mt-1 italic">Define your intent and structure your momentum.</p>
      </header>

      {/* Goal Alignment Section */}
      <section className="space-y-6">
        <div className="flex justify-between items-end px-1">
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4a373] mb-1">Current Intentions</h3>
            <p className="text-xs text-stone-400">Behavior-driven focus points.</p>
          </div>
          <button 
            onClick={() => setShowGoalForm(!showGoalForm)}
            className="text-[10px] font-bold uppercase tracking-widest text-[#7c9082] bg-[#7c9082]/10 px-4 py-2 rounded-full"
          >
            {showGoalForm ? 'Cancel' : '+ New Intention'}
          </button>
        </div>

        {showGoalForm && (
          <form onSubmit={handleAddGoalSubmit} className="bg-white border-2 border-[#7c9082]/20 rounded-[2rem] p-6 shadow-xl animate-in zoom-in-95 space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-300 uppercase tracking-widest ml-1">Title</label>
              <input 
                type="text" 
                placeholder="e.g. Strength Training Momentum"
                className="w-full bg-stone-50 p-4 rounded-2xl text-sm outline-none border border-transparent focus:border-stone-100"
                value={newGoal.title}
                onChange={e => setNewGoal({...newGoal, title: e.target.value})}
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-300 uppercase tracking-widest ml-1">Type</label>
                <select 
                  className="w-full bg-stone-50 p-4 rounded-2xl text-sm outline-none border border-transparent appearance-none"
                  value={newGoal.type}
                  onChange={e => setNewGoal({...newGoal, type: e.target.value as any})}
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-300 uppercase tracking-widest ml-1">Auto-Track</label>
                <select 
                  className="w-full bg-stone-50 p-4 rounded-2xl text-sm outline-none border border-transparent appearance-none"
                  value={newGoal.autoTrack}
                  onChange={e => {
                    const track = e.target.value as any;
                    setNewGoal({
                      ...newGoal, 
                      autoTrack: track,
                      unit: track === 'workouts' ? 'workouts' : track === 'hydration' ? 'oz' : 'units'
                    });
                  }}
                >
                  <option value="workouts">Workouts</option>
                  <option value="hydration">Hydration</option>
                  <option value="none">Manual</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-300 uppercase tracking-widest ml-1">Target</label>
                <input 
                  type="number" 
                  className="w-full bg-stone-50 p-4 rounded-2xl text-sm outline-none"
                  value={newGoal.target}
                  onChange={e => setNewGoal({...newGoal, target: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-300 uppercase tracking-widest ml-1">Unit</label>
                <input 
                  type="text" 
                  className="w-full bg-stone-50 p-4 rounded-2xl text-sm outline-none"
                  value={newGoal.unit}
                  onChange={e => setNewGoal({...newGoal, unit: e.target.value})}
                />
              </div>
            </div>
            <button 
              type="submit"
              className="w-full bg-[#7c9082] text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-[#7c9082]/20"
            >
              Set Intention
            </button>
          </form>
        )}

        <div className="space-y-4">
          {state.goals.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-stone-100 rounded-[2.5rem]">
              <p className="text-xs text-stone-300 italic">No intentions set yet. What matters this week?</p>
            </div>
          ) : (
            state.goals.map(goal => (
              <div key={goal.id} className="bg-white border border-stone-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-300">{goal.type}</span>
                      {goal.autoTrack !== 'none' && (
                        <span className="text-[8px] bg-[#7c9082]/10 text-[#7c9082] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">Auto</span>
                      )}
                    </div>
                    <h4 className="font-semibold text-stone-700">{goal.title}</h4>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-medium text-[#7c9082]">{goal.current}/{goal.target} {goal.unit}</span>
                    <button 
                      onClick={() => onDeleteGoal(goal.id)}
                      className="text-stone-200 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="w-full bg-stone-50 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#7c9082] h-full transition-all duration-1000 ease-out" 
                    style={{ width: `${goal.progress}%` }} 
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="space-y-6">
        <div className="px-1">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4a373] mb-1">Training Program</h3>
          <p className="text-xs text-stone-400">Unified configuration for goal, frequency, focus and conditioning.</p>
        </div>
        <div className="bg-white border border-stone-100 rounded-[2.5rem] p-6 shadow-sm space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block ml-1">Goal</label>
              <select value={state.trainingProgram.goal} onChange={(e) => onUpdateTrainingProgram({ goal: e.target.value as TrainingProgram['goal'] })} className="w-full bg-stone-50 border border-transparent focus:border-stone-100 rounded-2xl px-4 py-3 text-xs font-medium text-stone-700 outline-none">
                <option value="hypertrophy">Hypertrophy</option>
                <option value="strength">Strength</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block ml-1">Days per Week</label>
              <select value={state.trainingProgram.daysPerWeek} onChange={(e) => onUpdateTrainingProgram({ daysPerWeek: Number(e.target.value) as TrainingProgram['daysPerWeek'] })} className="w-full bg-stone-50 border border-transparent focus:border-stone-100 rounded-2xl px-4 py-3 text-xs font-medium text-stone-700 outline-none">
                <option value={3}>3</option><option value={4}>4</option><option value={5}>5</option><option value={6}>6</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block ml-1">Focus</label>
              <select value={state.trainingProgram.emphasis} onChange={(e) => onUpdateTrainingProgram({ emphasis: e.target.value as TrainingProgram['emphasis'] })} className="w-full bg-stone-50 border border-transparent focus:border-stone-100 rounded-2xl px-4 py-3 text-xs font-medium text-stone-700 outline-none">
                <option value="balanced">Balanced</option>
                <option value="glutes_legs">Glutes/Legs</option>
                <option value="upper_body">Upper Body</option>
                <option value="push_bias">Push Bias</option>
                <option value="pull_bias">Pull Bias</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block ml-1">Session Length</label>
              <select value={state.trainingProgram.sessionLengthMin} onChange={(e) => onUpdateTrainingProgram({ sessionLengthMin: Number(e.target.value) as TrainingProgram['sessionLengthMin'] })} className="w-full bg-stone-50 border border-transparent focus:border-stone-100 rounded-2xl px-4 py-3 text-xs font-medium text-stone-700 outline-none">
                <option value={45}>45</option><option value={60}>60</option><option value={75}>75</option><option value={90}>90</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block ml-1">Conditioning Days</label>
            <select value={state.trainingProgram.conditioningPreference} onChange={(e) => onUpdateTrainingProgram({ conditioningPreference: e.target.value as TrainingProgram['conditioningPreference'] })} className="w-full bg-stone-50 border border-transparent focus:border-stone-100 rounded-2xl px-4 py-3 text-xs font-medium text-stone-700 outline-none">
              <option value="none">None</option>
              <option value="1_day">1 Day</option>
              <option value="2_days">2 Days</option>
            </select>
          </div>

          <div className="bg-stone-50 rounded-2xl p-4 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Your Weekly Structure</p>
            {generatedPreview.map((day) => (
              <p key={day.day} className="text-xs text-stone-600"><span className="font-semibold">{day.day}</span> — {day.label}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Cycle Configuration Section */}
      <section className="space-y-6">
        <div className="px-1">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4a373] mb-1">Cycle Configuration</h3>
          <p className="text-xs text-stone-400">Sync your tracking to your internal rhythm.</p>
        </div>
        <div className="bg-white border border-stone-100 rounded-[2.5rem] p-6 shadow-sm space-y-6">
           <div className="space-y-4">
             <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block ml-1">Last Cycle Start</label>
             <CalendarPicker 
                selectedDate={state.cycleConfig.lastStartDate} 
                onChange={(date) => onUpdateCycle({ lastStartDate: date })} 
             />
             <div className="px-1 py-2 flex justify-between items-center bg-stone-50 rounded-2xl px-4">
                <span className="text-[10px] text-stone-400 font-bold uppercase">Selected</span>
                <span className="text-xs font-medium text-[#7c9082]">
                  {formatLocalDate(parseDayString(state.cycleConfig.lastStartDate), { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
             </div>
           </div>
           <div className="space-y-2">
             <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block ml-1">Average Cycle Length</label>
             <div className="relative">
               <input 
                 type="number"
                 value={state.cycleConfig.cycleLength}
                 onChange={(e) => onUpdateCycle({ cycleLength: parseInt(e.target.value) || 28 })}
                 className="w-full bg-stone-50 border border-transparent focus:border-stone-100 rounded-2xl px-5 py-4 text-sm font-medium text-stone-700 outline-none transition-all pr-16"
               />
               <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-stone-300 uppercase">Days</span>
             </div>
           </div>
        </div>
      </section>


    </div>
  );
};

export default AlignmentCenter;
