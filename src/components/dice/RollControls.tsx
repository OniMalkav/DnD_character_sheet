"use client";

import { Sword, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

// CENTRALIZED STYLE THEME FOR EASY EDITING
const THEME = {
  colors: {
    labels: '#A3A3A3',     // Neutral 400
    damageIcon: '#F87171', // Red 400
  }
};

type RollControlsProps = {
  modifier: number;
  setModifier: (m: number) => void;
  damageMod: number;
  setDamageMod: (m: number) => void;
  resetSelections: () => void;
  hasSelections: boolean;
};

export default function RollControls({ modifier, setModifier, damageMod, setDamageMod, resetSelections, hasSelections }: RollControlsProps) {
  return (
    <Card>
      <CardContent className="flex flex-col sm:flex-row gap-4 items-stretch justify-between p-4">
        <div className="flex items-center gap-3">
          <label htmlFor="hit-mod" className="text-sm font-semibold uppercase tracking-wide w-16 sm:w-auto" style={{ color: THEME.colors.labels }}>To Hit:</label>
          <div className="flex items-center bg-background rounded-lg border border-border overflow-hidden">
            <Button variant="ghost" className="px-3 rounded-none" onClick={() => setModifier(modifier - 1)}>-</Button>
            <Input id="hit-mod" type="number" value={modifier} onChange={(e) => setModifier(parseInt(e.target.value) || 0)} className="w-14 bg-transparent text-center font-bold outline-none border-0 focus-visible:ring-0 [appearance:textfield]" />
            <Button variant="ghost" className="px-3 rounded-none" onClick={() => setModifier(modifier + 1)}>+</Button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label htmlFor="dmg-mod" className="text-sm font-semibold uppercase tracking-wide w-16 sm:w-auto flex items-center gap-1" style={{ color: THEME.colors.labels }}>
            <Sword className="w-3 h-3" style={{ color: THEME.colors.damageIcon }} /> Dmg:
          </label>
          <div className="flex items-center bg-background rounded-lg border border-border overflow-hidden">
            <Button variant="ghost" className="px-3 rounded-none" onClick={() => setDamageMod(damageMod - 1)}>-</Button>
            <Input id="dmg-mod" type="number" value={damageMod} onChange={(e) => setDamageMod(parseInt(e.target.value) || 0)} className="w-14 bg-transparent text-center font-bold outline-none border-0 focus-visible:ring-0 [appearance:textfield]" />
            <Button variant="ghost" className="px-3 rounded-none" onClick={() => setDamageMod(damageMod + 1)}>+</Button>
          </div>
        </div>
        <Button onClick={resetSelections} disabled={!hasSelections} variant="ghost" className="hover:text-destructive" style={{ color: THEME.colors.labels }}>
          <Trash2 className="w-4 h-4 mr-2" /> Reset
        </Button>
      </CardContent>
    </Card>
  );
}
