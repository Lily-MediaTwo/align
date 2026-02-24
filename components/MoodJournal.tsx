
import React, { useState } from 'react';
import { Mood, MoodEntry } from '../types';
import { MOOD_CONFIG } from '../constants';

interface MoodJournalProps {
  moods: MoodEntry[];
  onAdd: (entry: Omit<MoodEntry, 'id' | 'date'>) => void;
}

const MoodJournal: React.FC<MoodJournalProps> = ({ moods, onAdd }) => {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    if (selectedMood) {
      onAdd({ mood: selectedMood, note });
      setSelectedMood(null);
      setNote('');
    }
  };

  const sortedMoods = [...moods].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 pb-20">
      <header>
        <h2 className="serif text-3xl text-stone-800">Internal Compass</h2>
        <p className="text-sm text-stone-400 mt-1 italic">How are you arriving in this moment?</p>
      </header>

      {/* Mood Selection Grid */}
      <div className="grid grid-cols-3 gap-3">
        {(Object.entries(MOOD_CONFIG) as [Mood, { emoji: string; color: string }][]).map(([mood, config]) => (
          <button
            key={mood}
            onClick={() => setSelectedMood(mood)}
            className={`flex flex-col items-center gap-2 p-4 rounded-[2rem] transition-all border ${
              selectedMood === mood 
                ? 'border-[#7c9082] bg-white shadow-md ring-1 ring-[#7c9082]/10' 
                : 'border-stone-100 bg-white shadow-sm'
            }`}
          >
            <span className="text-2xl">{config.emoji}</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400">
              {mood}
            </span>
          </button>
        ))}
      </div>

      {/* Input Form */}
      {selectedMood && (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
          <textarea
            className="w-full bg-white border border-stone-100 rounded-[2rem] p-5 text-sm focus:outline-none focus:ring-1 focus:ring-[#7c9082] transition-all min-h-[140px] shadow-sm"
            placeholder={`Tell me more about feeling ${selectedMood}... (Optional)`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <button
            onClick={handleSubmit}
            className="w-full bg-[#7c9082] text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-[#7c9082]/20 transition-transform active:scale-95"
          >
            Check in
          </button>
        </div>
      )}

      {/* Pattern Insight */}
      <div className="p-7 bg-amber-50/50 rounded-[2.5rem] border border-amber-100 shadow-sm">
        <h4 className="text-[10px] font-bold text-amber-900/40 uppercase tracking-widest mb-3">Compass Insights</h4>
        <p className="text-sm text-amber-800/70 leading-relaxed italic">
          {moods.length === 0 
            ? "Your compass is waiting for its first entry. Check in today to start building your internal map."
            : moods.length < 5 
            ? `You've checked in ${moods.length} ${moods.length === 1 ? 'time' : 'times'}. As you build this habit, I'll identify how your mood connects to your workouts and cycle.`
            : `With ${moods.length} reflections logged, we're starting to see clarity in your energy patterns. Keep checking in to deepen your self-understanding.`}
        </p>
      </div>

      {/* Mood History */}
      <section className="space-y-4">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 px-2">Recent Reflections</h3>
        {sortedMoods.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-stone-100 rounded-[2.5rem]">
            <p className="text-xs text-stone-300 italic">No history yet. Start where you are.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedMoods.slice(0, 10).map((entry) => (
              <div key={entry.id} className="bg-white border border-stone-100 p-5 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{MOOD_CONFIG[entry.mood]?.emoji}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 capitalize">{entry.mood}</span>
                  </div>
                  <span className="text-[10px] font-bold text-stone-300">
                    {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {entry.note && (
                  <p className="text-sm text-stone-600 italic border-l-2 border-stone-50 pl-4 py-1">
                    {entry.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default MoodJournal;
