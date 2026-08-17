"use client";

import { DICE_TYPES } from "@/lib/constants";
import type { DiceCounts, DiceType } from "@/lib/types";
import { Button } from "@/components/ui/button";

type DiceGridProps = {
  counts: DiceCounts;
  updateCount: (dieType: DiceType, delta: number) => void;
};

// Style variables are now centralized in globals.css

export default function DiceGrid({ counts, updateCount }: DiceGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {DICE_TYPES.map((die) => (
        <div 
          key={die.type} 
          className="relative bg-card rounded-xl border-2 transition-all duration-200 overflow-hidden"
          style={{ 
            borderColor: counts[die.type] > 0 ? 'rgba(199, 124, 26, 0.4)' : 'rgba(163, 163, 163, 0.1)',
            boxShadow: counts[die.type] > 0 ? '0 0 10px rgba(199, 124, 26, 0.1)' : 'none'
          }}
        >
          <div 
            className="absolute top-0 left-0 w-1 h-full opacity-80" 
            style={{ backgroundColor: `var(--dice-${die.type})` }}
          ></div>
          <div className="p-3 pl-5 flex flex-col items-center justify-between h-full min-h-[110px]">
            <div 
              className="text-[length:var(--dice-font-grid-label)] font-bold uppercase tracking-wider mb-2 font-code"
              style={{ color: 'var(--dice-grid-text-muted)' }}
            >{die.type}</div>
            <div className="flex items-center gap-3 w-full justify-center">
              <Button 
                variant="secondary"
                size="icon"
                className="w-8 h-8 rounded-full text-[length:var(--dice-font-grid-pm-btn)] font-bold pb-1"
                onClick={() => updateCount(die.type, -1)} 
                disabled={counts[die.type] === 0}
              >
                -
              </Button>
              <div 
                className="text-[length:var(--dice-font-grid-count)] font-bold w-8 text-center font-code"
                style={{ color: counts[die.type] > 0 ? '#FFFFFF' : 'var(--dice-grid-text-muted)' }}
              >
                {counts[die.type]}
              </div>
              <Button 
                size="icon"
                className="w-8 h-8 rounded-full text-[length:var(--dice-font-grid-pm-btn)] font-bold pb-1 text-white shadow-lg border-0"
                style={{ backgroundColor: `var(--dice-${die.type})` }}
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
