"use client";

import { Dices, RotateCcw, Sword, Plus } from "lucide-react";
import DiceGrid from "@/components/dice/DiceGrid";
import RollControls from "@/components/dice/RollControls";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCharacter } from "@/contexts/CharacterContext";
import type { DiceCounts, DiceType, RollMode, RollResult, RollBreakdown, AttackResult, DieRoll } from "@/lib/types";
import { cn } from "@/lib/utils";

// CENTRALIZED STYLE THEME FOR EASY EDITING
const THEME = {
  colors: {
    primary: 'var(--primary)',
    advantage: 'var(--color-advantage)',
    disadvantage: 'var(--color-disadvantage)',
    rollButton: 'var(--primary)',
    rollButtonText: 'var(--primary-foreground)',
    weaponBg: 'var(--dice-weapon-bg)',
    weaponBorder: 'var(--dice-weapon-border)',
    weaponBtn: 'var(--dice-weapon-btn)',
    supportHeader: 'var(--dice-support-header)',
    supportBorder: 'var(--dice-support-border)',
  }
};

const parseDiceString = (diceStr: string): Partial<DiceCounts> => {
  const counts: Partial<DiceCounts> = {};
  const diceMatch = diceStr.toLowerCase().match(/(\d+)d(\d+)/g);
  if (diceMatch) {
    diceMatch.forEach(match => {
      const [count, sides] = match.split('d');
      const dieKey = `d${sides}` as keyof DiceCounts;
      counts[dieKey] = (counts[dieKey] || 0) + parseInt(count);
    });
  }
  return counts;
};

export default function DiceRollerTab() {
    const { 
      equipmentItems,
      counts, setCounts,
      modifier, setModifier,
      damageMod, setDamageMod,
      rollMode, setRollMode,
      hitBonuses, setHitBonuses,
      damageBonuses, setDamageBonuses,
      triggerRoll, isRolling, setResult, setSpecialEffect, result
    } = useCharacter();

    // EFFECT: Filter for equipped weapons (those using ability modifiers)
    const weapons = (equipmentItems || []).filter(i => 
      i.isWearing && ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].includes(i.armorType || '')
    );
    const updateCount = (dieType: DiceType, delta: number) => {
        setCounts(prev => ({
          ...prev,
          [dieType]: Math.max(0, prev[dieType] + delta)
        }));
    };

    const resetSelections = () => {
        const hasBonuses = Object.values(hitBonuses).some(v => v) || Object.values(damageBonuses).some(v => v);
        const hasInputs = Object.values(counts).some(v => v > 0) || modifier !== 0 || damageMod !== 0 || rollMode !== 'normal' || hasBonuses;
        
        if (hasInputs) {
          setCounts({ d4: 0, d6: 0, d8: 0, d10: 0, d12: 0, d20: 0, d100: 0 });
          setModifier(0);
          setDamageMod(0);
          setRollMode('normal');
          setHitBonuses({ d4: false, d6: false, d8: false, d10: false, d12: false });
          setDamageBonuses({ d4: false, d6: false, d8: false, d10: false, d12: false });
        } else {
          setResult(null);
          setSpecialEffect(null);
        }
    };


    const hasSelections = Object.values(counts).some(v => v > 0) || modifier !== 0 || damageMod !== 0 || rollMode !== 'normal';

    return (
        <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
            {/* WEAPONS QUICK-ATTACK SECTION */}
            {weapons.length > 0 && (
              <Card className="bg-[var(--dice-weapon-bg)] border-[var(--dice-weapon-border)]">
                <CardHeader className="py-3 px-4">
                    <CardTitle className="text-[length:var(--dice-font-weapon-title)] font-black uppercase tracking-widest flex items-center gap-2 text-primary/80">
                        <Sword className="w-3 h-3" /> Equipped Weapons
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 flex flex-wrap gap-2">
                    {weapons.map(weapon => (
                      <Button
                        key={weapon.id}
                        variant="outline"
                        size="sm"
                        className="h-auto py-1.5 px-3 font-bold gap-2.5 bg-[var(--dice-weapon-btn)] border-white/10 hover:border-primary/40 hover:bg-primary/5 group flex items-center"
                        onClick={() => {
                          const newCounts: DiceCounts = { d4: 0, d6: 0, d8: 0, d10: 0, d12: 0, d20: 1, d100: 0 };
                          if (weapon.damageDice) {
                            const parsed = parseDiceString(weapon.damageDice);
                            Object.entries(parsed).forEach(([die, val]) => {
                              if (die in newCounts) {
                                newCounts[die as keyof DiceCounts] = val as number;
                              }
                            });
                          }
                          setCounts(newCounts);
                          setModifier(parseInt(weapon.ac?.toString() || '0') || 0);
                          setDamageMod(parseInt(weapon.damageBonus?.toString() || '0') || 0);
                        }}
                      >
                        <div className="flex flex-col items-start text-left">
                          <span className="text-white/90 group-hover:text-primary transition-colors text-xs font-bold leading-tight">{weapon.name}</span>
                          {weapon.mastery && weapon.mastery !== 'None' && (
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {weapon.mastery.split(',').map(s => s.trim()).filter(Boolean).map(m => (
                                <span 
                                  key={m} 
                                  style={{
                                    backgroundColor: 'var(--inv-mastery-active-bg, #ffffff)',
                                    color: 'var(--inv-mastery-active-text, #000000)',
                                  }}
                                  className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded leading-none shadow-sm"
                                >
                                  {m}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-[length:var(--dice-font-weapon-mod)] font-black ml-auto">
                          +{weapon.ac || '0'}
                        </span>
                      </Button>
                    ))}
                </CardContent>
              </Card>
            )}

            {/* BONUS DICE SECTION */}
            <Card className="border-[var(--dice-support-border)]">
                <CardHeader className="py-2 px-4 flex-row items-center justify-between space-y-0 bg-[var(--dice-support-header)]">
                    <CardTitle className="text-[length:var(--dice-font-support-title)] font-black uppercase tracking-widest text-primary/60 flex items-center gap-2">
                        <Plus className="w-3 h-3" /> Bonus Dice (Support)
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-3">
                    <div className="space-y-1">
                      <span className="text-[length:var(--dice-font-support-subtitle)] font-bold uppercase text-muted-foreground ml-1">To Hit Bonus</span>
                      <div className="flex gap-1">
                        {(['d4', 'd6', 'd8', 'd10', 'd12'] as const).map(die => (
                          <Button
                            key={`hit-${die}`}
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "flex-1 h-7 text-[length:var(--dice-font-support-btn)] font-black font-code border transition-all",
                                hitBonuses[die] ? "border-primary text-primary" : "border-white/10 text-muted-foreground"
                            )}
                            onClick={() => setHitBonuses(prev => ({ ...prev, [die]: !prev[die] }))}
                          >
                            +{die}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[length:var(--dice-font-support-subtitle)] font-bold uppercase text-muted-foreground ml-1">Damage Bonus</span>
                      <div className="flex gap-1">
                        {(['d4', 'd6', 'd8', 'd10', 'd12'] as const).map(die => (
                          <Button
                            key={`dmg-${die}`}
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "flex-1 h-7 text-[length:var(--dice-font-support-btn)] font-black font-code border transition-all",
                                damageBonuses[die] ? "border-primary text-primary" : "border-white/10 text-muted-foreground"
                            )}
                            onClick={() => setDamageBonuses(prev => ({ ...prev, [die]: !prev[die] }))}
                          >
                            +{die}
                          </Button>
                        ))}
                      </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-2 flex gap-1">
                    <Button onClick={() => setRollMode('normal')} variant={rollMode === 'normal' ? 'secondary' : 'ghost'} className="flex-1 uppercase font-bold">Normal</Button>
                    <Button 
                        onClick={() => setRollMode('advantage')} 
                        variant="ghost" 
                        className={cn(
                            "flex-1 uppercase font-bold border transition-all",
                            rollMode === 'advantage' ? "border-[var(--color-advantage)]" : "border-transparent"
                        )}
                        style={{ color: THEME.colors.advantage }}
                    >Advantage</Button>
                    <Button 
                        onClick={() => setRollMode('disadvantage')} 
                        variant="ghost" 
                        className={cn(
                            "flex-1 uppercase font-bold border transition-all",
                            rollMode === 'disadvantage' ? "border-[var(--color-disadvantage)]" : "border-transparent"
                        )}
                        style={{ color: THEME.colors.disadvantage }}
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
                onClick={() => triggerRoll()}
                disabled={!hasSelections || isRolling} 
                variant="outline"
                className={cn(
                    "w-full py-8 text-[length:var(--dice-font-roll-btn)] uppercase tracking-widest shadow-xl transition-all transform active:scale-95 border-2",
                    hasSelections && !isRolling ? "border-primary text-primary hover:bg-primary/5" : "opacity-50 border-white/10"
                )}
                size="lg"
                style={{ 
                  boxShadow: hasSelections && !isRolling ? '0 0 20px rgba(255, 255, 255, 0.1)' : 'none'
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
