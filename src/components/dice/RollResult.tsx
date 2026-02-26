"use client";

import React from 'react';
import { Sword } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RollResult as RollResultType, RollBreakdown } from '@/lib/types';

type RollResultProps = {
  result: RollResultType;
  specialEffect: 'crit' | 'fail' | null;
};

const getCalculationData = (breakdown: RollBreakdown) => {
  const naturalD20 = breakdown.d20 ? breakdown.d20.reduce((acc, r) => acc + (r.dropped !== undefined ? 0 : r.value), 0) : 0;
  
  const otherDiceElements: { type: string, value: number }[] = [];
  Object.entries(breakdown).forEach(([dieType, rolls]) => {
    if (dieType !== 'd20' && rolls) {
      const sum = rolls.reduce((a, b) => a + b.value, 0);
      if (sum > 0) otherDiceElements.push({ type: dieType, value: sum });
    }
  });

  return { naturalD20, otherDiceElements };
};

export default function RollResult({ result, specialEffect }: RollResultProps) {
  const isD20Roll = result.hasD20;
  const calcData = getCalculationData(result.breakdown);
  const isSkillCheck = !!result.label && result.label.endsWith(' Check');
  const isMultiAttack = result.attacks && result.attacks.length > 1;
  const hasCrit = result.breakdown.d20?.some(r => r.value === 20 && r.dropped === undefined);
  const isFumble = !isMultiAttack && result.breakdown.d20?.some(r => r.value === 1 && r.dropped === undefined);

  return (
    <div className={cn(
      "bg-card rounded-2xl border-2 overflow-hidden shadow-2xl transition-colors duration-300 animate-in fade-in slide-in-from-bottom-4",
      specialEffect === 'crit' ? 'border-yellow-500/50' :
      specialEffect === 'fail' ? 'border-red-500/50' :
      'border-border'
    )}>
      <div className="bg-card p-6 text-center border-b border-border relative overflow-hidden">
        <div className={cn(
          "absolute top-0 left-0 w-full h-1 bg-gradient-to-r opacity-50",
          result.rollMode === 'advantage' ? 'from-transparent via-green-500 to-transparent' :
          result.rollMode === 'disadvantage' ? 'from-transparent via-red-500 to-transparent' :
          'from-transparent via-primary to-transparent'
        )}></div>
        
        {result.label && (
           <div className="mb-2 inline-block px-3 py-1 rounded-full bg-background border border-border text-primary text-xs font-bold uppercase tracking-widest">
              {result.label}
           </div>
        )}
        
        {isMultiAttack ? (
          <div className="space-y-4">
            <h3 className="text-muted-foreground uppercase tracking-widest text-xs font-semibold mb-2">Multiple Attacks</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.attacks?.map((atk, idx) => (
                <div key={idx} className={cn(
                  "bg-background/50 border rounded-xl p-4 flex flex-col gap-2 relative transition-all",
                  atk.isFumble && "border-destructive/30 opacity-60"
                )}>
                  <div className="absolute top-2 left-3 text-[10px] font-black text-muted-foreground uppercase tracking-tighter opacity-50">#0{idx+1}</div>
                  <div className="flex justify-around items-center pt-2">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-muted-foreground font-bold uppercase mb-1">To Hit</span>
                      <div className={cn("text-3xl font-black font-headline", atk.isCrit ? 'text-yellow-400' : atk.isFumble ? 'text-red-500' : 'text-foreground')}>
                        {atk.hit}
                      </div>
                    </div>
                    <div className="w-px h-10 bg-border"></div>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-muted-foreground font-bold uppercase mb-1">Damage</span>
                      <div className={cn("text-3xl font-black font-headline", atk.isFumble ? 'text-muted-foreground line-through' : 'text-red-400')}>
                        {atk.damage}
                      </div>
                    </div>
                  </div>
                  {/* FONT SIZE: Adjust text-[12px] below to change breakdown size for multi-attacks */}
                  <div className="text-[12px] font-code text-muted-foreground truncate px-2 text-center mt-1" title={atk.detailsStr}>
                    {atk.detailsStr}
                  </div>
                  {atk.isCrit && <div className="text-[10px] text-yellow-500 font-black uppercase tracking-widest text-center animate-pulse">Critical!</div>}
                  {atk.isFumble && <div className="text-[10px] text-destructive font-black uppercase tracking-widest text-center">Miss</div>}
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border/50">
               <span className="text-[10px] text-muted-foreground font-bold uppercase">Total Multi-Damage: </span>
               <span className="text-2xl font-black font-headline text-primary ml-2">{result.totalDamage}</span>
            </div>
          </div>
        ) : isD20Roll ? (
           <div className="flex flex-col items-center">
             <h3 className="text-muted-foreground uppercase tracking-widest text-xs font-semibold mb-2">Total Result</h3>
             <div className={cn(
                "text-7xl md:text-8xl font-black drop-shadow-lg tracking-tighter mb-4 font-headline",
                hasCrit ? 'text-yellow-400 animate-pulse' :
                isFumble ? 'text-red-500' : 'text-foreground'
             )}>
                {result.totalHit}
             </div>
             <div className="flex flex-col items-center gap-3 mb-4">
               <div className="flex items-center justify-center flex-wrap gap-4">
                 {result.breakdown.d20?.map((rollObj, idx) => (
                   <React.Fragment key={idx}>
                     {rollObj.dropped !== undefined && (
                       <div className="relative opacity-40 grayscale scale-75">
                          <div className="text-4xl md:text-5xl font-black text-muted-foreground select-none font-code">{rollObj.dropped}</div>
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-full h-1 bg-red-500/80 rotate-[-20deg]"></div>
                          </div>
                       </div>
                     )}
                     <div className="relative scale-90">
                        <div className={cn("text-4xl md:text-5xl font-black drop-shadow-lg tracking-tighter font-code", rollObj.value === 20 ? 'text-yellow-400' : rollObj.value === 1 ? 'text-red-500' : 'text-foreground')}>
                          {rollObj.value}
                        </div>
                        <span className="text-[10px] uppercase text-muted-foreground font-bold block text-center mt-1 font-headline">d20</span>
                     </div>
                   </React.Fragment>
                 ))}
               </div>
               <div className="text-muted-foreground font-code text-sm bg-background/50 px-3 py-1.5 rounded border border-border/50">
                  {result.breakdown.d20?.find(r => r.dropped === undefined)?.value} (d20)
                  {result.hitMod !== 0 && (result.hitMod > 0 ? ` + ${result.hitMod} (mod)` : ` - ${Math.abs(result.hitMod)} (mod)`)}
                  {isSkillCheck && calcData.otherDiceElements.map((item, idx) => (
                    <React.Fragment key={idx}> + {item.value} ({item.type})</React.Fragment>
                  ))}
                  <span className="text-foreground font-bold"> = {result.totalHit}</span>
               </div>
               {hasCrit && !isSkillCheck && (
                 <div className="text-[10px] text-yellow-500 font-black uppercase tracking-[0.2em] mt-2 animate-pulse">Critical Hit! Damage Dice Doubled</div>
               )}
               {isFumble && !isSkillCheck && (
                 <div className="text-[10px] text-destructive font-black uppercase tracking-[0.2em] mt-2">Automatic Miss - No Damage</div>
               )}
               {(calcData.otherDiceElements.length > 0 || result.dmgMod !== 0) && !isSkillCheck && (
                 <div className="flex flex-col items-center justify-center gap-1 mt-3 pt-3 border-t border-border/50 w-full">
                   <div className="flex items-center gap-2">
                     <Sword className="w-4 h-4 text-red-400" />
                     <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Damage</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <span className={cn("text-3xl font-black font-headline", isFumble ? "text-muted-foreground line-through" : "text-foreground")}>{result.totalDamage}</span>
                     <div className="text-xs text-muted-foreground font-code flex items-center">
                       ({calcData.otherDiceElements.map((item, idx) => (
                         <span key={idx} className="flex items-center">{idx > 0 && " + "}{item.value}</span>
                       ))}
                       {result.dmgMod !== 0 && (result.dmgMod > 0 ? ` + ${result.dmgMod}` : ` - ${Math.abs(result.dmgMod)}`)})
                     </div>
                   </div>
                 </div>
               )}
             </div>
           </div>
        ) : (
          <>
            <h3 className="text-muted-foreground uppercase tracking-widest text-xs font-semibold mb-2">{result.label ? 'Result' : 'Total'}</h3>
            <div className={cn("text-6xl md:text-7xl font-black drop-shadow-lg tracking-tighter font-headline", specialEffect === 'crit' ? 'text-yellow-400 animate-pulse' : specialEffect === 'fail' ? 'text-red-500 animate-shake' : 'text-foreground')}>
              {result.totalDamage}
            </div>
            {result.dmgMod !== 0 && (
              <div className="text-muted-foreground mt-2 text-sm font-code">
                (Roll: {result.damageRaw}) {result.dmgMod > 0 ? ` + ${result.dmgMod}` : ` - ${Math.abs(result.dmgMod)}`}
              </div>
            )}
          </>
        )}
      </div>

      {/* FONT SIZE: Adjust text-[12px] in the labels below to change bottom breakdown text size */}
      {!isMultiAttack && (
        <div className="p-4 bg-background/30 flex justify-center flex-wrap gap-2">
           {Object.entries(result.breakdown).map(([dieType, rolls]) => (
              <div key={dieType} className="flex gap-2 items-center">
                 <span className="text-[12px] font-bold text-muted-foreground uppercase mr-1">{dieType}</span>
                 {rolls?.map((r, i) => (
                    <div key={i} className={cn(
                      "w-8 h-8 flex items-center justify-center rounded border font-bold text-sm font-code transition-all",
                      r.dropped !== undefined ? 'opacity-30 line-through bg-muted border-transparent' : 'bg-background border-border/50 text-foreground',
                      r.value === 20 ? 'text-yellow-400 border-yellow-500/50 shadow-[0_0_5px_rgba(234,179,8,0.2)]' : 
                      r.value === 1 ? 'text-red-400 border-red-500/50' : ''
                    )}>
                       {r.value}
                    </div>
                 ))}
              </div>
           ))}
        </div>
      )}
    </div>
  );
}
