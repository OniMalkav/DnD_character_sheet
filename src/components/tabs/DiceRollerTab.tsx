"use client";

import { Dices, RotateCcw } from "lucide-react";
import DiceGrid from "@/components/dice/DiceGrid";
import RollControls from "@/components/dice/RollControls";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { DiceCounts, DiceType, RollMode, RollResult, RollBreakdown, AttackResult, DieRoll, DieRollWithMode } from "@/lib/types";
import { cn } from "@/lib/utils";

// CENTRALIZED STYLE THEME FOR EASY EDITING
const THEME = {
  colors: {
    primary: '#c77c1aff',      // Amber (Main Theme)
    advantage: '#72b7dfff',    // Green/Blue
    disadvantage: '#EF4444',   // Red
    rollButton: '#c77c1aff',   // Amber
    rollButtonText: '#FFFFFF', // White
  }
};

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
// ... existing logic ...
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

    // Helper: Internal logic for rolling a d20 based on the current mode
    const rollD20 = (mode: RollMode) => {
      const r1 = Math.floor(Math.random() * 20) + 1;
      if (mode === 'normal') {
        return { value: r1, isCrit: r1 === 20, isFumble: r1 === 1, details: `[${r1}]` };
      }
      const r2 = Math.floor(Math.random() * 20) + 1;
      const kept = mode === 'advantage' ? Math.max(r1, r2) : Math.min(r1, r2);
      const dropped = mode === 'advantage' ? Math.min(r1, r2) : Math.max(r1, r2);
      const modeTag = mode === 'advantage' ? 'ADV' : 'DIS';
      return { 
        value: kept, 
        dropped, 
        isCrit: kept === 20, 
        isFumble: kept === 1, 
        details: `${modeTag}:[${kept}] drop:[${dropped}]`
      };
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

          // EFFECT: Multi-Attack Logic triggered if more than 1 d20 is rolled
          const isMultiAttack = d20Count > 1;

          if (isMultiAttack) {
            let totalMultiDamage = 0;
            let hitsCount = 0;

            for (let i = 0; i < d20Count; i++) {
              const d20Result = rollD20(rollMode);
              const isCrit = d20Result.isCrit;
              const isFumble = d20Result.isFumble;
              let attackDiceTotal = 0;
              let attackDamageDetails: string[] = [];

              // Roll individual damage set for this specific attack
              Object.entries(counts).forEach(([die, count]) => {
                if (die !== 'd20' && count > 0) {
                  const sides = parseInt(die.substring(1));
                  const rolls = [];
                  
                  // CRIT EFFECT: 2024 Rules - Double the number of damage dice on a Critical Hit
                  const effectiveCount = isCrit ? count * 2 : count;
                  
                  for (let j = 0; j < effectiveCount; j++) {
                    const r = Math.floor(Math.random() * sides) + 1;
                    rolls.push(r);
                    attackDiceTotal += r;
                  }
                  attackDamageDetails.push(`${die}:[${rolls.join(',')}]`);
                }
              });

              const attackTotalDamage = attackDiceTotal + damageMod;

              attacks.push({
                hit: d20Result.value + modifier,
                damage: isFumble ? 0 : attackTotalDamage,
                d20Value: d20Result.value,
                isCrit: isCrit,
                isFumble: isFumble,
                detailsStr: `${d20Result.details} + ${attackDamageDetails.join(' + ') || '0'}`
              });

              if (isCrit) hasNat20 = true;
              if (isFumble) hasNat1 = true;
              
              d20Sum += d20Result.value;
              
              // EFFECT: Automatic Miss on Natural 1 - Damage excluded from total multi-damage calculation
              if (!isFumble) {
                totalMultiDamage += attackTotalDamage;
                hitsCount++;
              }
            }
            
            damageSum = totalMultiDamage;
            breakdown.d20 = attacks.map(a => ({ value: a.d20Value }));
            rollDetails.push(`${d20Count} Attacks (${hitsCount} Hits)`);
          } else {
            // STANDARD LOGIC (Single d20 or Adv/Dis)
            let critDoubling = false;
            let d20Rolls: DieRoll[] = [];

            if (d20Count > 0) {
              const d20Result = rollD20(rollMode);
              d20Rolls.push({ value: d20Result.value, dropped: d20Result.dropped, mode: rollMode });
              d20Sum += d20Result.value;
              if (d20Result.isCrit) critDoubling = true;
              if (d20Result.isFumble) hasNat1 = true;
              hasNat20 = critDoubling;
              breakdown.d20 = d20Rolls;
            }

            // 2. Roll other dice (Damage/Modifier dice)
            Object.entries(counts).forEach(([die, count]) => {
              if (die !== 'd20' && count > 0) {
                const sides = parseInt(die.substring(1));
                const dieRolls = [];
                
                // CRIT EFFECT: Double number of dice if d20 was a Natural 20
                const effectiveCount = critDoubling ? count * 2 : count;
                
                for (let i = 0; i < effectiveCount; i++) {
                  const roll = Math.floor(Math.random() * sides) + 1;
                  dieRolls.push({ value: roll });
                  damageSum += roll;
                }
                breakdown[die as DiceType] = dieRolls;
      
                const rollValues = dieRolls.map(r => r.value).join(', ');
                rollDetails.push(`${effectiveCount}${die}: [${rollValues}]`);
              }
            });

            if (d20Count > 0) {
              const d20Result = d20Rolls[0];
              const modeTag = rollMode !== 'normal' ? ` (${rollMode.substring(0,3).toUpperCase()})` : '';
              const valStr = d20Result.dropped !== undefined ? `[${d20Result.value}, drop ${d20Result.dropped}]` : `[${d20Result.value}]`;
              rollDetails.unshift(`d20${modeTag}: ${valStr}`);
            }
          }
    
          const finalTotalDamage = hasNat1 && !isMultiAttack ? 0 : (isMultiAttack ? damageSum : (damageSum + damageMod));
          const finalTotalHit = d20Sum + (modifier * (isMultiAttack ? d20Count : 1));

          const resultObj: RollResult = {
            total: finalTotalHit + finalTotalDamage,
            totalHit: finalTotalHit,
            totalDamage: finalTotalDamage,
            hasD20: d20Count > 0,
            hasDamage: damageSum > 0 || damageMod !== 0,
            damageRaw: isMultiAttack ? damageSum : damageSum,
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
                        className="flex-1 uppercase font-bold"
                        style={rollMode !== 'advantage' ? { color: THEME.colors.advantage } : {}}
                    >Advantage</Button>
                    <Button 
                        onClick={() => setRollMode('disadvantage')} 
                        variant={rollMode === 'disadvantage' ? 'destructive' : 'ghost'} 
                        className="flex-1 uppercase font-bold"
                        style={rollMode !== 'disadvantage' ? { color: THEME.colors.disadvantage } : {}}
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
                className="w-full py-8 text-2xl uppercase tracking-widest shadow-xl transition-all transform active:scale-95 border-0"
                size="lg"
                style={{ 
                  backgroundColor: isRolling || !hasSelections ? 'rgba(163, 163, 163, 0.2)' : THEME.colors.rollButton,
                  color: THEME.colors.rollButtonText
                }}
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
