"use client";

import { Dices, RotateCcw } from "lucide-react";
import DiceGrid from "@/components/dice/DiceGrid";
import RollControls from "@/components/dice/RollControls";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { DiceCounts, DiceType, RollMode, RollResult, RollBreakdown, AttackResult } from "@/lib/types";
import { cn } from "@/lib/utils";

type DiceRollerTabProps = {
    counts: DiceCounts;
    setCounts: React.Dispatch<React.SetStateAction<DiceCounts>>;
    modifier: number;
    setModifier: React.Dispatch<React.SetStateAction<number>>;
    damageMod: number;
    setDamageMod: React.Dispatch<React.SetStateAction<number>>;
    rollMode: RollMode;
    setRollMode: React.Dispatch<React.SetStateAction<RollMode>>;
    isRolling: boolean;
    setIsRolling: React.Dispatch<React.SetStateAction<boolean>>;
    setResult: React.Dispatch<React.SetStateAction<RollResult | null>>;
    setHistory: React.Dispatch<React.SetStateAction<RollResult[]>>;
    setSpecialEffect: React.Dispatch<React.SetStateAction<'crit' | 'fail' | null>>;
    result: RollResult | null;
}

export default function DiceRollerTab({ 
    counts, setCounts, modifier, setModifier, damageMod, setDamageMod, rollMode, setRollMode, 
    isRolling, setIsRolling, setResult, setHistory, setSpecialEffect, result
}: DiceRollerTabProps) {

    const updateCount = (dieType: DiceType, delta: number) => {
        setCounts(prev => ({
          ...prev,
          [dieType]: Math.max(0, prev[dieType] + delta)
        }));
    };

    const resetSelections = () => {
        const hasInputs = Object.values(counts).some(v => v > 0) || modifier !== 0 || damageMod !== 0 || rollMode !== 'normal';
        if (hasInputs) {
          setCounts({ d4: 0, d6: 0, d8: 0, d10: 0, d12: 0, d20: 0, d100: 0 });
          setModifier(0);
          setDamageMod(0);
          setRollMode('normal');
        } else {
          setResult(null);
          setSpecialEffect(null);
        }
    };
    
    const rollDice = () => {
        const totalDice = Object.values(counts).reduce((a, b) => a + b, 0);
        if (totalDice === 0) return;
    
        setIsRolling(true);
        setResult(null);
        setSpecialEffect(null);
        
        setTimeout(() => {
          let breakdown: RollBreakdown = {};
          let rollDetails: string[] = [];
          let hasNat20 = false, hasNat1 = false;
          let d20Sum = 0, damageSum = 0, d20Count = counts.d20;
          const attacks: AttackResult[] = [];

          // EFFECT: Multi-Attack Logic
          // If rolling multiple d20s in Normal mode, treat each as a separate attack with its own damage roll.
          const isMultiAttack = rollMode === 'normal' && d20Count > 1;

          if (isMultiAttack) {
            for (let i = 0; i < d20Count; i++) {
              const d20Val = Math.floor(Math.random() * 20) + 1;
              let attackDamage = 0;
              let attackDamageDetails: string[] = [];

              // Roll individual damage set for this specific attack
              Object.entries(counts).forEach(([die, count]) => {
                if (die !== 'd20' && count > 0) {
                  const sides = parseInt(die.substring(1));
                  const rolls = [];
                  for (let j = 0; j < count; j++) {
                    const r = Math.floor(Math.random() * sides) + 1;
                    rolls.push(r);
                    attackDamage += r;
                  }
                  attackDamageDetails.push(`${count}${die}: [${rolls.join(',')}]`);
                }
              });

              attacks.push({
                hit: d20Val + modifier,
                damage: attackDamage + damageMod,
                d20Value: d20Val,
                isCrit: d20Val === 20,
                isFumble: d20Val === 1,
                detailsStr: `d20: [${d20Val}] + ${attackDamageDetails.join(' + ')}`
              });

              if (d20Val === 20) hasNat20 = true;
              if (d20Val === 1) hasNat1 = true;
              
              d20Sum += d20Val;
              damageSum += attackDamage;
            }
            
            // Populate overall breakdown for history (summary only)
            breakdown.d20 = attacks.map(a => ({ value: a.d20Value }));
            rollDetails.push(`${d20Count} Attacks Rolled`);
          } else {
            // STANDARD LOGIC (Single d20 or Adv/Dis)
            Object.entries(counts).forEach(([die, count]) => {
              if (count > 0) {
                const sides = parseInt(die.substring(1));
                const dieRolls = [];
                
                for (let i = 0; i < count; i++) {
                  if (die === 'd20') {
                      const r1 = Math.floor(Math.random() * sides) + 1;
                      if (rollMode !== 'normal') {
                          const r2 = Math.floor(Math.random() * sides) + 1;
                          const kept = rollMode === 'advantage' ? Math.max(r1, r2) : Math.min(r1, r2);
                          const dropped = rollMode === 'advantage' ? Math.min(r1, r2) : Math.max(r1, r2);
                          dieRolls.push({ value: kept, dropped: dropped, mode: rollMode });
                          d20Sum += kept;
                      } else {
                          dieRolls.push({ value: r1 });
                          d20Sum += r1;
                      }
                  } else {
                      const roll = Math.floor(Math.random() * sides) + 1;
                      dieRolls.push({ value: roll });
                      damageSum += roll;
                  }
                }
                breakdown[die as DiceType] = dieRolls;
      
                if (die === 'd20') {
                  dieRolls.forEach(r => {
                    if (r.value === 20 && !r.dropped) hasNat20 = true;
                    if (r.value === 1 && !r.dropped) hasNat1 = true;
                  });
                }
      
                const rollValues = dieRolls.map(r => r.value).join(', ');
                const modeTag = (rollMode !== 'normal' && die === 'd20') ? ` (${rollMode.substring(0,3).toUpperCase()})` : '';
                rollDetails.push(`${count}${die}${modeTag}: [${rollValues}]`);
              }
            });
          }
    
          const resultObj: RollResult = {
            total: (d20Sum + (modifier * (isMultiAttack ? d20Count : 1))) + (damageSum + (damageMod * (isMultiAttack ? d20Count : 1))),
            totalHit: d20Sum + (modifier * (isMultiAttack ? d20Count : 1)),
            totalDamage: damageSum + (damageMod * (isMultiAttack ? d20Count : 1)),
            hasD20: d20Count > 0,
            hasDamage: damageSum > 0 || damageMod !== 0,
            damageRaw: damageSum,
            breakdown,
            hitMod: modifier,
            dmgMod: damageMod,
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
            detailsStr: rollDetails.join(' + '),
            rollMode,
            label: null,
            attacks: attacks.length > 0 ? attacks : undefined
          };
    
          setResult(resultObj);
          setHistory(prev => [resultObj, ...prev].slice(0, 20));
          setIsRolling(false);
    
          if (d20Count > 0) {
            if (hasNat20) setSpecialEffect('crit');
            else if (hasNat1) setSpecialEffect('fail');
          }
        }, 600);
    };

    const hasSelections = Object.values(counts).some(v => v > 0) || modifier !== 0 || damageMod !== 0 || rollMode !== 'normal';

    return (
        <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
            <Card>
                <CardContent className="p-2 flex gap-1">
                    <Button onClick={() => setRollMode('normal')} variant={rollMode === 'normal' ? 'secondary' : 'ghost'} className="flex-1 uppercase font-bold">Normal</Button>
                    <Button 
                        onClick={() => setRollMode('advantage')} 
                        variant={rollMode === 'advantage' ? 'success' : 'ghost'} 
                        className={cn("flex-1 uppercase font-bold", rollMode !== 'advantage' && "text-success hover:bg-success/20 hover:text-success")}
                    >Advantage</Button>
                    <Button 
                        onClick={() => setRollMode('disadvantage')} 
                        variant={rollMode === 'disadvantage' ? 'destructive' : 'ghost'} 
                        className={cn("flex-1 uppercase font-bold", rollMode !== 'disadvantage' && "text-destructive hover:bg-destructive/20 hover:text-destructive")}
                    >Disadvantage</Button>
                </CardContent>
            </Card>

            <DiceGrid counts={counts} updateCount={updateCount} />

            <RollControls 
                modifier={modifier}
                setModifier={setModifier}
                damageMod={damageMod}
                setDamageMod={setDamageMod}
                resetSelections={() => resetSelections()}
                hasSelections={hasSelections || result !== null}
            />

            <Button 
                onClick={rollDice} 
                disabled={!hasSelections || isRolling} 
                className="w-full py-8 text-2xl uppercase tracking-widest shadow-xl transition-all transform active:scale-95"
                size="lg"
            >
                {isRolling ? (
                    <>
                        <RotateCcw className="w-6 h-6 mr-3 animate-spin" /> Rolling...
                    </>
                ) : (
                    <>
                        <Dices className="w-8 h-8 mr-3" /> Roll
                    </>
                )}
            </Button>
        </div>
    );
}
