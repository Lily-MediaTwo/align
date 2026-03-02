
import { GoogleGenAI } from "@google/genai";
import { AppState } from "../types";
import { parseDayString } from "../utils/dateUtils";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAdaptiveNudge = async (state: AppState) => {
  try {
    const workoutCount = state.workouts.filter(w => w.completed).length;
    const hydrationTotal = state.hydration.reduce((acc, h) => acc + h.amountOz, 0);
    const lastMood = state.moods[state.moods.length - 1]?.mood || 'neutral';
    
    // Determine current phase for Gemini context
    const diff = Math.floor((new Date().getTime() - parseDayString(state.cycleConfig.lastStartDate).getTime()) / (1000 * 60 * 60 * 24));
    const dayOfCycle = (diff % state.cycleConfig.cycleLength) + 1;
    let phase = 'unknown';
    if (dayOfCycle <= 5) phase = 'menstrual';
    else if (dayOfCycle <= 13) phase = 'follicular';
    else if (dayOfCycle === 14) phase = 'ovulatory';
    else phase = 'luteal';

    const prompt = `
      As a gentle, supportive wellness companion called Align, provide a short, 1-2 sentence "adaptive nudge" based on this data:
      - Workouts completed: ${workoutCount}
      - Hydration today: ${hydrationTotal}oz
      - Latest Mood: ${lastMood}
      - Estimated Cycle Phase: ${phase}
      - Latest Goal: ${state.goals[0]?.title} is at ${state.goals[0]?.progress}%
      
      Focus on the intersection of these stats. If they are in Luteal phase, suggest grace. If they are crushing goals, suggest sustainable pacing.
      Return ONLY the text of the nudge.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "You're building something beautiful. One breath at a time.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Let's take a deep breath and start small today.";
  }
};
