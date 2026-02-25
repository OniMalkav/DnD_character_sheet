"use client";

import { useState } from 'react';
import { Book, Plus, RotateCcw, Sparkles, Trash2 } from 'lucide-react';
import { useCharacter } from '@/contexts/CharacterContext';
import { calculateModifier } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Stat } from '@/lib/types';

export default function SpellsTab() {
  const {
    stats, pb, spellAbility, setSpellAbility, spellSlots, updateSpellSlotMax, toggleSpellSlot, longRest,
    spells, addSpell, removeSpell
  } = useCharacter();

  const [newSpellName, setNewSpellName] = useState('');
  const [newSpellLevel, setNewSpellLevel] = useState('0');

  const handleAddSpell = () => {
    addSpell(newSpellName, parseInt(newSpellLevel));
    setNewSpellName('');
  };
  
  const spellSaveDC = 8 + pb + calculateModifier(stats[spellAbility]);
  const spellAttackMod = pb + calculateModifier(stats[spellAbility]);

  return (
    <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Ability</label>
              <Select value={spellAbility} onValueChange={(val) => setSpellAbility(val as Stat)}>
                <SelectTrigger className="w-[180px] bg-background">
                  <SelectValue placeholder="Select ability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="int">Intelligence</SelectItem>
                  <SelectItem value="wis">Wisdom</SelectItem>
                  <SelectItem value="cha">Charisma</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col items-center px-4 border-l">
              <span className="text-xs font-bold text-muted-foreground uppercase">Save DC</span>
              <span className="text-3xl font-black text-primary font-headline">{spellSaveDC}</span>
            </div>

            <div className="flex flex-col items-center px-4 border-l">
              <span className="text-xs font-bold text-muted-foreground uppercase">Attack</span>
              <span className="text-3xl font-black text-green-400 font-headline">+{spellAttackMod}</span>
            </div>
          </div>
          <Button onClick={longRest} className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90">
            <RotateCcw className="w-4 h-4 mr-2" /> Long Rest
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-accent" /> Spell Slots</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[450px] pr-3">
              <div className="space-y-3">
                {Object.entries(spellSlots).map(([level, slots]) => (
                  <div key={level} className="flex items-center gap-4 bg-background/50 p-2 rounded-lg border">
                    <span className="text-sm font-bold text-muted-foreground w-12">Lvl {level}</span>
                    <Input 
                      type="number" min="0" max="9" value={slots.max}
                      onChange={(e) => updateSpellSlotMax(level, parseInt(e.target.value))}
                      className="w-14 h-8 text-center"
                    />
                    <div className="flex gap-1.5 flex-1 flex-wrap">
                      {Array.from({ length: slots.max }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => toggleSpellSlot(level, i)}
                          className={cn("w-6 h-6 rounded-full border-2 transition-all",
                            i < slots.used 
                              ? 'bg-accent border-accent/80 shadow-[0_0_8px_hsl(var(--accent))]' 
                              : 'bg-muted/50 border-border hover:border-foreground/50'
                          )}
                          aria-label={`Spell slot ${level}-${i+1}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Book className="w-5 h-5 text-accent" /> Spellbook</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="flex gap-2 mb-4">
              <Input type="text" value={newSpellName} onChange={(e) => setNewSpellName(e.target.value)} placeholder="Spell Name" onKeyDown={(e) => e.key === 'Enter' && handleAddSpell()} />
              <Select value={newSpellLevel} onValueChange={setNewSpellLevel}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Cantrip</SelectItem>
                  {[1,2,3,4,5,6,7,8,9].map(n => <SelectItem key={n} value={String(n)}>Lvl {n}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button onClick={handleAddSpell} disabled={!newSpellName.trim()} size="icon" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Plus className="w-5 h-5" />
              </Button>
            </div>
            <ScrollArea className="flex-1 h-[350px] pr-1">
              {spells.length === 0 ? (
                <div className="text-center text-muted-foreground py-10 italic">No spells added yet.</div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(spells.reduce((acc, spell) => {
                    (acc[spell.level] = acc[spell.level] || []).push(spell);
                    return acc;
                  }, {} as Record<number, typeof spells>)).map(([level, levelSpells]) => (
                    <div key={level}>
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest border-b mb-2 pb-1">
                        {level === '0' ? 'Cantrips' : `Level ${level}`}
                      </div>
                      <div className="space-y-1">
                        {levelSpells.map(spell => (
                          <div key={spell.id} className="group flex justify-between items-center bg-background/30 hover:bg-background/70 px-3 py-2 rounded border border-transparent hover:border-border transition-all">
                            <span className="text-foreground font-medium">{spell.name}</span>
                            <Button onClick={() => removeSpell(spell.id)} size="icon" variant="ghost" className="w-7 h-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
