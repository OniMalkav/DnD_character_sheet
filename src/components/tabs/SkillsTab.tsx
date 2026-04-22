"use client";

import { useEffect } from 'react';
import { User, Plus, ShieldCheck } from 'lucide-react';
import { useCharacter } from '@/contexts/CharacterContext';
import { Checkbox } from '@/components/ui/checkbox';
import StatBlock from '@/components/character/StatBlock';
import SkillList from '@/components/character/SkillList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { SKILLS_DATA } from '@/lib/constants';
import { calculateModifier } from '@/lib/utils';
import type { RollMode, RollResult, DiceCounts, SkillBonus } from '@/lib/types';


// CENTRALIZED STYLE THEME FOR EASY EDITING
const THEME = {
  colors: {
    advantage: 'var(--color-advantage)',
    disadvantage: 'var(--color-disadvantage)',
    icons: 'var(--color-icons)',
    textMuted: 'var(--muted-foreground)',
    vitalsNumber: 'var(--vitals-number-color)',
    vitalsLabel: 'var(--vitals-label-color)',
  }
};

type SkillsTabProps = {
    isRolling: boolean;
    setIsRolling: React.Dispatch<React.SetStateAction<boolean>>;
    setResult: React.Dispatch<React.SetStateAction<RollResult | null>>;
    setHistory: React.Dispatch<React.SetStateAction<RollResult[]>>;
    setSpecialEffect: React.Dispatch<React.SetStateAction<'crit' | 'fail' | null>>;
    skillBonuses: SkillBonus;
    setSkillBonuses: React.Dispatch<React.SetStateAction<SkillBonus>>;
};

export default function SkillsTab({ 
    skillBonuses, setSkillBonuses 
}: { 
    skillBonuses: SkillBonus, 
    setSkillBonuses: React.Dispatch<React.SetStateAction<SkillBonus>> 
}) {
    const { 
      stats, profs, pb, setPb, charInfo, updateCharInfo, toggleProficiency,
      rollMode, setRollMode, setCounts, setModifier, triggerRoll, setActiveTab,
      hitBonuses, setHitBonuses
    } = useCharacter();

    const totalLevel = (parseInt(charInfo.level?.toString() || '1') || 0) + (parseInt(charInfo.level2?.toString() || '0') || 0);
    const mathPb = 1 + Math.ceil(totalLevel / 4);
    const activePb = pb || mathPb;

    const rollSkill = (skillName: string) => {
        const skill = SKILLS_DATA.find(s => s.name === skillName);
        if (!skill) return;

        const statMod = calculateModifier(stats[skill.stat]);
        const isProficient = profs.has(skill.name);
        const totalMod = statMod + (isProficient ? activePb : 0);
        
        const checkCounts: Partial<DiceCounts> = {
          d4: skillBonuses.d4 ? 1 : 0,
          d6: skillBonuses.d6 ? 1 : 0,
          d8: skillBonuses.d8 ? 1 : 0,
          d10: skillBonuses.d10 ? 1 : 0,
          d12: skillBonuses.d12 ? 1 : 0,
          d20: 1,
        };

        triggerRoll(checkCounts, totalMod, 0, `${skill.name} Check`, 'check');
    };
    
    const toggleSkillBonus = (die: keyof SkillBonus) => {
        setSkillBonuses(prev => ({ ...prev, [die]: !prev[die] }));
    };

    const rollSave = (statName: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha') => {
        const statValue = stats[statName];
        const statMod = calculateModifier(statValue);
        const isProficient = profs.has(`SAVE_${statName.toUpperCase()}`);
        const totalMod = statMod + (isProficient ? activePb : 0);
        
        const checkCounts: Partial<DiceCounts> = {
          d4: skillBonuses.d4 ? 1 : 0,
          d6: skillBonuses.d6 ? 1 : 0,
          d8: skillBonuses.d8 ? 1 : 0,
          d10: skillBonuses.d10 ? 1 : 0,
          d12: skillBonuses.d12 ? 1 : 0,
          d20: 1,
        };

        triggerRoll(checkCounts, totalMod, 0, `${statName.toUpperCase()} Saving Throw`, 'save');
    };

    const mathPassivePerception = 10 + calculateModifier(stats.wis) + (profs.has('Perception') ? activePb : 0);
    const mathInitiative = calculateModifier(stats.dex);
    const mathSpeed = 30;

    // Use active values
    const displayInitiative = mathInitiative >= 0 ? `+${mathInitiative}` : `${mathInitiative}`;

    return (
        <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
            <Card>
                <CardContent className="p-2 flex gap-1">
                    <Button onClick={() => setRollMode('normal')} variant={rollMode === 'normal' ? 'secondary' : 'ghost'} className="flex-1 uppercase font-bold">Normal</Button>
                    <Button 
                        onClick={() => setRollMode('advantage')} 
                        variant="ghost" 
                        className={cn(
                            "flex-1 uppercase font-bold border transition-all",
                            rollMode === 'advantage' ? "border-[var(--color-advantage)] bg-[var(--color-advantage)]/10" : "border-transparent"
                        )}
                        style={{ color: THEME.colors.advantage }}
                    >Advantage</Button>
                    <Button 
                        onClick={() => setRollMode('disadvantage')} 
                        variant="ghost" 
                        className={cn(
                            "flex-1 uppercase font-bold border transition-all",
                            rollMode === 'disadvantage' ? "border-[var(--color-disadvantage)] bg-[var(--color-disadvantage)]/10" : "border-transparent"
                        )}
                        style={{ color: THEME.colors.disadvantage }}
                    >Disadvantage</Button>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" style={{ color: THEME.colors.icons }} /> Ability Scores
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                        <div className="flex flex-col gap-1 items-center">
                            <div className="flex items-center justify-center h-[14px]">
                                <Label htmlFor="passive-perception" className="uppercase text-center leading-none" style={{ fontSize: 'var(--font-size-label)', color: THEME.colors.vitalsLabel }}>Passive Perc.</Label>
                            </div>
                            <Input
                                id="passive-perception"
                                value={charInfo.passivePerception || ''}
                                onChange={(e) => updateCharInfo('passivePerception', e.target.value)}
                                placeholder={mathPassivePerception.toString()}
                                className="h-8 w-full px-1 text-center bg-transparent border border-primary/30 rounded shadow-inner vitals-input focus-visible:ring-1 focus-visible:ring-primary/50"
                            />
                        </div>
                        <div className="flex flex-col gap-1 items-center">
                            <div className="flex items-center justify-center h-[14px]">
                                <Label htmlFor="prof-bonus" className="uppercase text-center leading-none" style={{ fontSize: 'var(--font-size-label)', color: THEME.colors.vitalsLabel }}>Prof. Bonus</Label>
                            </div>
                            <Input
                                id="prof-bonus"
                                type="text"
                                value={pb || ''}
                                onChange={(e) => setPb(parseInt(e.target.value) || 0)}
                                placeholder={`+${mathPb}`}
                                className="h-8 w-full px-1 text-center bg-transparent border border-primary/30 rounded shadow-inner vitals-input focus-visible:ring-1 focus-visible:ring-primary/50"
                            />
                        </div>
                        <div className="flex flex-col gap-1 items-center">
                            <div className="flex items-center justify-center h-[14px]">
                                <Label htmlFor="initiative" className="uppercase text-center leading-none" style={{ fontSize: 'var(--font-size-label)', color: THEME.colors.vitalsLabel }}>Initiative</Label>
                            </div>
                            <Input
                                id="initiative"
                                value={charInfo.initiative || ''}
                                onChange={(e) => updateCharInfo('initiative', e.target.value)}
                                placeholder={displayInitiative}
                                className="h-8 w-full px-1 text-center bg-transparent border border-primary/30 rounded shadow-inner vitals-input focus-visible:ring-1 focus-visible:ring-primary/50"
                            />
                        </div>
                        <div className="flex flex-col gap-1 items-center">
                            <div className="flex items-center justify-center h-[14px]">
                                <Label htmlFor="speed" className="uppercase text-center leading-none" style={{ fontSize: 'var(--font-size-label)', color: THEME.colors.vitalsLabel }}>Speed</Label>
                            </div>
                            <Input
                                id="speed"
                                value={charInfo.speed || ''}
                                onChange={(e) => updateCharInfo('speed', e.target.value)}
                                placeholder={mathSpeed.toString()}
                                className="h-8 w-full px-1 text-center bg-transparent border border-primary/30 rounded shadow-inner vitals-input focus-visible:ring-1 focus-visible:ring-primary/50"
                            />
                        </div>

                        <div className="flex flex-col gap-1 items-center">
                            <div className="flex items-center justify-center h-[14px]">
                                <Input 
                                    value={charInfo.miscVitalLabel || 'Custom'} 
                                    onChange={(e) => updateCharInfo('miscVitalLabel', e.target.value)}
                                    className="w-full bg-transparent border-0 p-0 uppercase text-center focus-visible:ring-0 font-semibold tracking-wide h-full leading-none"
                                    style={{ fontSize: 'var(--font-size-label)', color: THEME.colors.vitalsLabel }}
                                />
                            </div>
                            <Input
                                id="misc-vital"
                                value={charInfo.miscVitalValue || ''}
                                onChange={(e) => updateCharInfo('miscVitalValue', e.target.value)}
                                className="h-8 w-full px-1 text-center bg-transparent border border-primary/30 rounded shadow-inner vitals-input focus-visible:ring-1 focus-visible:ring-primary/50"
                            />
                        </div>
                    </div>
                    <StatBlock stats={stats} onRollSave={rollSave} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Plus className="w-5 h-5" style={{ color: THEME.colors.icons }} /> Bonus Dice
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {(['d4', 'd6', 'd8', 'd10', 'd12'] as const).map((die) => (
                            <Button
                                key={die}
                                onClick={() => toggleSkillBonus(die)}
                                variant="ghost"
                                className={cn(
                                    "flex-1 min-w-[50px] font-code border transition-all",
                                    skillBonuses[die] ? "border-primary text-primary shadow-[0_0_10px_rgba(255,255,255,0.1)]" : "border-white/10 text-muted-foreground"
                                )}
                            >
                                +{die}
                            </Button>
                        ))}
                    </div>
                    <p className="text-[10px] mt-2 italic" style={{ color: THEME.colors.textMuted }}>For Guidance, Bardic Inspiration, etc.</p>
                </CardContent>
            </Card>

            <SkillList onRoll={rollSkill} />
        </div>
    );
}
