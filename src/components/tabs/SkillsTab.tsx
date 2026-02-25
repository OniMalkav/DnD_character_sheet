"use client";

import { User, Plus } from 'lucide-react';
import { useCharacter } from '@/contexts/CharacterContext';
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


type SkillsTabProps = {
    rollMode: RollMode;
    setRollMode: React.Dispatch<React.SetStateAction<RollMode>>;
    isRolling: boolean;
    setIsRolling: React.Dispatch<React.SetStateAction<boolean>>;
    setResult: React.Dispatch<React.SetStateAction<RollResult | null>>;
    setHistory: React.Dispatch<React.SetStateAction<RollResult[]>>;
    setSpecialEffect: React.Dispatch<React.SetStateAction<'crit' | 'fail' | null>>;
    skillBonuses: SkillBonus;
    setSkillBonuses: React.Dispatch<React.SetStateAction<SkillBonus>>;
    setCounts: React.Dispatch<React.SetStateAction<DiceCounts>>;
    setModifier: React.Dispatch<React.SetStateAction<number>>;
};

export default function SkillsTab({
    rollMode, setRollMode, isRolling, setIsRolling, setResult, setHistory, 
    setSpecialEffect, skillBonuses, setSkillBonuses, setCounts, setModifier
}: SkillsTabProps) {
    const { stats, profs, pb, setPb, characterName, setCharacterName } = useCharacter();

    const rollSkill = (skillName: string) => {
        const skill = SKILLS_DATA.find(s => s.name === skillName);
        if (!skill) return;

        const statMod = calculateModifier(stats[skill.stat]);
        const isProficient = profs.has(skill.name);
        const totalMod = statMod + (isProficient ? pb : 0);
        
        const checkCounts: DiceCounts = {
          d4: skillBonuses.d4 ? 1 : 0,
          d6: skillBonuses.d6 ? 1 : 0,
          d8: skillBonuses.d8 ? 1 : 0,
          d10: skillBonuses.d10 ? 1 : 0,
          d12: skillBonuses.d12 ? 1 : 0,
          d20: 1,
          d100: 0
        };

        // This is a bit of a hack to show the dice on the main roller
        setCounts(checkCounts);
        setModifier(totalMod);

        setIsRolling(true);
        setResult(null);
        setSpecialEffect(null);

        setTimeout(() => {
            const sides = 20;
            const r1 = Math.floor(Math.random() * sides) + 1;
            let d20roll;
            let dropped;

            if (rollMode !== 'normal') {
                const r2 = Math.floor(Math.random() * sides) + 1;
                d20roll = rollMode === 'advantage' ? Math.max(r1, r2) : Math.min(r1, r2);
                dropped = rollMode === 'advantage' ? Math.min(r1, r2) : Math.max(r1, r2);
            } else {
                d20roll = r1;
            }
            
            let bonusDiceSum = 0;
            const bonusDiceRolls: { [key: string]: number[] } = {};

            Object.entries(skillBonuses).forEach(([die, active]) => {
                if (active) {
                    const dieSides = parseInt(die.substring(1));
                    const roll = Math.floor(Math.random() * dieSides) + 1;
                    bonusDiceSum += roll;
                    if (!bonusDiceRolls[die]) bonusDiceRolls[die] = [];
                    bonusDiceRolls[die].push(roll);
                }
            });

            const hasNat20 = d20roll === 20;
            const hasNat1 = d20roll === 1;

            const breakdown = {
                d20: [{ value: d20roll, dropped: dropped, mode: rollMode }],
                ...Object.entries(bonusDiceRolls).reduce((acc, [die, rolls]) => {
                    acc[die] = rolls.map(value => ({ value }));
                    return acc;
                }, {} as any)
            };

            const resultObj: RollResult = {
                total: d20roll + totalMod + bonusDiceSum,
                totalHit: d20roll + totalMod + bonusDiceSum,
                totalDamage: 0,
                hasD20: true,
                hasDamage: false,
                damageRaw: 0,
                breakdown,
                hitMod: totalMod + bonusDiceSum,
                dmgMod: 0,
                timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
                detailsStr: `1d20 + ${totalMod} (Skill) ${bonusDiceSum > 0 ? `+ ${bonusDiceSum} (Bonus)` : ''}`,
                rollMode,
                label: `${skill.name} Check`
            };
    
            setResult(resultObj);
            setHistory(prev => [resultObj, ...prev].slice(0, 20));
            setIsRolling(false);
    
            if (hasNat20) setSpecialEffect('crit');
            else if (hasNat1) setSpecialEffect('fail');
        }, 600);
    };
    
    const toggleSkillBonus = (die: keyof SkillBonus) => {
        setSkillBonuses(prev => ({ ...prev, [die]: !prev[die] }));
    };

    return (
        <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
            <Card>
                <CardContent className="p-2 flex gap-1">
                    <Button onClick={() => setRollMode('normal')} variant={rollMode === 'normal' ? 'secondary' : 'ghost'} className="flex-1 uppercase">Normal</Button>
                    <Button onClick={() => setRollMode('advantage')} variant={rollMode === 'advantage' ? 'secondary' : 'ghost'} className="flex-1 uppercase hover:bg-green-800/50 hover:text-green-300 data-[state=open]:bg-green-800">Advantage</Button>
                    <Button onClick={() => setRollMode('disadvantage')} variant={rollMode === 'disadvantage' ? 'secondary' : 'ghost'} className="flex-1 uppercase hover:bg-red-800/50 hover:text-red-300">Disadvantage</Button>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" /> Ability Scores
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="char-name">Character Name</Label>
                            <Input id="char-name" type="text" value={characterName} onChange={(e) => setCharacterName(e.target.value)} placeholder="e.g. Grog" className="font-bold tracking-wide" />
                        </div>
                        <div>
                            <Label htmlFor="prof-bonus">Proficiency Bonus</Label>
                            <Input id="prof-bonus" type="number" value={pb} onChange={(e) => setPb(parseInt(e.target.value) || 0)} className="font-code text-center w-24" />
                        </div>
                    </div>
                    <StatBlock stats={stats} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Plus className="w-5 h-5 text-primary" /> Bonus Dice
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {(['d4', 'd6', 'd8', 'd10', 'd12'] as const).map((die) => (
                            <Button
                                key={die}
                                onClick={() => toggleSkillBonus(die)}
                                variant={skillBonuses[die] ? 'default' : 'secondary'}
                                className={cn("flex-1 min-w-[50px] font-code", skillBonuses[die] && 'shadow-lg')}
                            >
                                +{die}
                            </Button>
                        ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 italic">For Guidance, Bardic Inspiration, etc.</p>
                </CardContent>
            </Card>

            <SkillList isRolling={isRolling} onRoll={rollSkill} />
        </div>
    );
}
