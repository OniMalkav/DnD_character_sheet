"use client";

import { useCharacter } from "@/contexts/CharacterContext";
import { calculateModifier } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import type { Stat, Stats } from "@/lib/types";

// CENTRALIZED STYLE THEME FOR EASY EDITING
const THEME = {
  colors: {
    labels: '#A3A3A3',     // Neutral 400
    negativeMod: '#EF4444', // Red
  }
};

type StatBlockProps = {
    stats: Stats;
};

export default function StatBlock({ stats }: StatBlockProps) {
  const { updateStat } = useCharacter();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
      {Object.entries(stats).map(([stat, value]) => {
        const mod = calculateModifier(value);
        const sign = mod >= 0 ? '+' : '';
        
        return (
          <div key={stat} className="bg-background p-2 rounded-lg border flex flex-col items-center relative group">
            <label className="text-[10px] font-bold uppercase tracking-wider mb-1 font-headline" style={{ color: THEME.colors.labels }}>{stat}</label>
            <Input 
              type="number" 
              value={value} 
              onChange={(e) => updateStat(stat as Stat, parseInt(e.target.value))} 
              className="w-full bg-transparent text-center font-bold text-xl h-auto p-0 border-0 focus-visible:ring-0"
            />
            <div 
              className="text-xs font-mono font-bold mt-1 px-2 py-0.5 rounded"
              style={mod < 0 ? { backgroundColor: 'rgba(239, 68, 68, 0.2)', color: THEME.colors.negativeMod } : { backgroundColor: 'rgba(163, 163, 163, 0.1)', color: THEME.colors.labels }}
            >
              {sign}{mod}
            </div>
          </div>
        );
      })}
    </div>
  );
}
