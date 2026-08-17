"use client";

import { useCharacter } from "@/contexts/CharacterContext";
import { calculateModifier } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
    onRollSave?: (stat: Stat) => void;
};

import { cn } from "@/lib/utils";

export default function StatBlock({ stats, onRollSave }: StatBlockProps) {
  const { updateStat, profs, pb, toggleProficiency, charInfo } = useCharacter();

  const totalLevel = (parseInt(charInfo.level?.toString() || '1') || 0) + (parseInt(charInfo.level2?.toString() || '0') || 0);
  const mathPb = 1 + Math.ceil(totalLevel / 4);
  const activePb = pb || mathPb;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as const).map((stat) => {
        const value = stats[stat];
        const mod = calculateModifier(value);
        const isSaveProf = profs.has(`SAVE_${stat.toUpperCase()}`);
        const saveMod = mod + (isSaveProf ? activePb : 0);
        const modSign = mod >= 0 ? '+' : '';
        const saveSign = saveMod >= 0 ? '+' : '';
        
        return (
          <div key={stat} className="bg-background/40 p-4 rounded-xl border-2 flex flex-col items-center justify-between min-h-[140px] transition-all hover:bg-background/60 hover:border-primary/40 group relative overflow-hidden">
            {/* STAT HEADER - CENTERED */}
            <div className="w-full flex items-center justify-center gap-2 mb-2">
                <Checkbox 
                    checked={isSaveProf} 
                    onCheckedChange={() => toggleProficiency(`SAVE_${stat.toUpperCase()}`)}
                    className="h-4 w-4 border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <label className="text-xs font-black uppercase tracking-[0.1em] text-foreground/90">{stat}</label>
            </div>
            
            <div className="flex w-full items-center justify-around gap-2 flex-grow">
                {/* MAIN MODIFIER */}
                <div className="flex flex-col items-center">
                    <span className="text-[8px] font-bold uppercase tracking-tighter opacity-80 mb-1">Mod</span>
                    <div className="text-3xl font-black tracking-tighter tabular-nums text-foreground/80">
                        {modSign}{mod}
                    </div>
                </div>

                <div className="w-[1px] h-8 bg-muted-foreground/10" />

                {/* SAVING THROW - CLICKABLE TO ROLL */}
                <button 
                    onClick={() => onRollSave?.(stat as Stat)}
                    className="flex flex-col items-center group/save cursor-pointer active:scale-95 transition-transform"
                >
                    <span className="text-[8px] font-bold uppercase tracking-tighter opacity-80 mb-1 group-hover/save:text-primary transition-colors">Save</span>
                    <div className={cn(
                        "text-3xl font-black tracking-tighter tabular-nums transition-all",
                        isSaveProf ? "text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.3)]" : "text-foreground/80",
                        "active:scale-95"
                    )}>
                        {saveSign}{saveMod}
                    </div>
                </button>
            </div>

            {/* SMALL SCORE INPUT */}
            <div className="mt-3 pt-2 border-t border-muted-foreground/5 w-full flex justify-center">
              <div className="relative flex items-center gap-2">
                <span className="text-[9px] font-bold uppercase opacity-80">Score</span>
                <Input 
                    type="number" 
                    value={value} 
                    onChange={(e) => updateStat(stat as Stat, parseInt(e.target.value))} 
                    className="w-11 h-6 text-[11px] font-bold text-center bg-muted/20 border-muted-foreground/10 rounded-md p-0 focus-visible:ring-primary/40"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
