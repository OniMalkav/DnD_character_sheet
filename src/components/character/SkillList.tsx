"use client";

import { Dices, Check } from "lucide-react";
import { useCharacter } from "@/contexts/CharacterContext";
import { calculateModifier } from "@/lib/utils";
import { SKILLS_DATA } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type SkillListProps = {
  isRolling: boolean;
  onRoll: (skillName: string) => void;
};

export default function SkillList({ isRolling, onRoll }: SkillListProps) {
  const { stats, profs, pb, toggleProficiency } = useCharacter();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills</CardTitle>
        <CardDescription>Roll for skill checks based on your stats and proficiencies.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 bg-background rounded-lg border">
          <div className="hidden lg:grid p-3 grid-cols-[auto_1fr_auto_auto] gap-4 items-center text-xs font-bold text-muted-foreground uppercase tracking-wider border-b lg:border-b-0">
            <div className="pl-2">Prof</div>
            <div>Skill</div>
            <div className="text-center">Mod</div>
            <div className="w-20"></div>
          </div>
          <div className="hidden lg:grid p-3 lg:border-l grid-cols-[auto_1fr_auto_auto] gap-4 items-center text-xs font-bold text-muted-foreground uppercase tracking-wider border-b lg:border-b-0">
            <div className="pl-2">Prof</div>
            <div>Skill</div>
            <div className="text-center">Mod</div>
            <div className="w-20"></div>
          </div>

          {SKILLS_DATA.map((skill, index) => {
            const isProficient = profs.has(skill.name);
            const statMod = calculateModifier(stats[skill.stat]);
            const totalMod = statMod + (isProficient ? pb : 0);
            const sign = totalMod >= 0 ? '+' : '';
            
            return (
              <div key={skill.name} className={`p-3 grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center hover:bg-muted/30 transition-colors border-t lg:border-t-0 ${index > 1 && 'lg:border-t'} ${index % 2 === 0 ? '' : 'lg:border-l'}`}>
                <Button 
                    variant={isProficient ? "default" : "outline"}
                    size="icon"
                    onClick={() => toggleProficiency(skill.name)} 
                    className={`w-6 h-6 rounded-md transition-all`}
                    aria-label={`Toggle proficiency for ${skill.name}`}
                >
                    {isProficient && <Check className="w-4 h-4" />}
                </Button>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="font-bold">{skill.name}</span>
                  <span className="text-[10px] uppercase text-muted-foreground font-code bg-background px-1.5 py-0.5 rounded border">{skill.stat}</span>
                </div>
                <div className={`font-mono font-bold text-center w-8 ${totalMod > 0 ? 'text-green-400' : totalMod < 0 ? 'text-red-400' : 'text-muted-foreground'}`}>{sign}{totalMod}</div>
                <Button onClick={() => onRoll(skill.name)} disabled={isRolling} variant="secondary" size="sm" className="whitespace-nowrap">
                    <Dices className="w-3 h-3 mr-1.5" /> Roll
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
