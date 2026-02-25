"use client";

import { DICE_TYPES } from "@/lib/constants";
import type { DiceCounts, DiceType } from "@/lib/types";
import { Button } from "@/components/ui/button";

type DiceGridProps = {
  counts: DiceCounts;
  updateCount: (dieType: DiceType, delta: number) => void;
};

export default function DiceGrid({ counts, updateCount }: DiceGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {DICE_TYPES.map((die) => (
        <div key={die.type} className={`relative bg-card rounded-xl border-2 transition-all duration-200 overflow-hidden ${counts[die.type] > 0 ? 'border-primary/50 ring-1 ring-primary/20' : 'border-border hover:border-border'}`}>
          <div className={`absolute top-0 left-0 w-1 h-full ${die.color} opacity-80`}></div>
          <div className="p-3 pl-5 flex flex-col items-center justify-between h-full min-h-[110px]">
            <div className="text-lg font-bold uppercase tracking-wider text-muted-foreground mb-2 font-code">{die.type}</div>
            <div className="flex items-center gap-3 w-full justify-center">
              <Button 
                variant="secondary"
                size="icon"
                className="w-8 h-8 rounded-full text-xl font-bold pb-1"
                onClick={() => updateCount(die.type, -1)} 
                disabled={counts[die.type] === 0}
              >
                -
              </Button>
              <div className={`text-2xl font-bold w-8 text-center font-code ${counts[die.type] > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>{counts[die.type]}</div>
              <Button 
                size="icon"
                className={`w-8 h-8 rounded-full text-xl font-bold pb-1 text-white shadow-lg ${die.color} ${die.hover}`}
                onClick={() => updateCount(die.type, 1)}
              >
                +
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
