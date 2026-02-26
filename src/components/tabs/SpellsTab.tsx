"use client";

import { useState, useMemo } from 'react';
import { Book, Plus, RotateCcw, Sparkles, Trash2 } from 'lucide-react';
import { useCharacter } from '@/contexts/CharacterContext';
import { calculateModifier } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Stat } from '@/lib/types';

// Update this to wherever you saved your new, clean JSON file!
import spellData from '@/lib/spells/spells_2024.json';

export default function SpellsTab() {
  const {
    stats, pb, spellAbility, setSpellAbility, spellSlots, updateSpellSlotMax, toggleSpellSlot, longRest,
    spells, addSpell, removeSpell
  } = useCharacter();

  const [newSpellName, setNewSpellName] = useState('');
  const [newSpellLevel, setNewSpellLevel] = useState('0');
  
  const [expandedId, setExpandedId] = useState<string | number | null>(null);

  // Filter JSON spells based on the selected dropdown level for the autofill
  const availableSpells = useMemo(() => {
    return spellData.filter((spell: any) => {
      // The new JSON uses actual integers for levels (0 for cantrip, 1, 2, etc.)
      const levelStr = String(spell.level);
      return levelStr === newSpellLevel; 
    });
  }, [newSpellLevel]);

  const handleAddSpell = () => {
    addSpell(newSpellName, parseInt(newSpellLevel));
    setNewSpellName('');
  };
  
  const spellSaveDC = 8 + pb + calculateModifier(stats[spellAbility]);
  const spellAttackMod = pb + calculateModifier(stats[spellAbility]);

  return (
    <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      {/* TOP STAT BAR */}
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
          <Button onClick={longRest} className="w-full sm:w-auto">
            <RotateCcw className="w-4 h-4 mr-2" /> Long Rest
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN: SPELL SLOTS */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5" /> Spell Slots</CardTitle>
          </CardHeader>
          <CardContent>
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
                        className={cn(
                          "spell-slot-button",
                          slots.slots?.[i]
                            ? 'spell-slot-button--used'
                            : 'spell-slot-button--available'
                        )}
                        aria-label={`Spell slot ${level}-${i+1}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* RIGHT COLUMN: SPELLBOOK */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Book className="w-5 h-5" /> Spellbook</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="flex gap-2 mb-4">
              
              <div className="flex-1 relative">
                <Input 
                  type="text" 
                  list="spell-options"
                  value={newSpellName} 
                  onChange={(e) => setNewSpellName(e.target.value)} 
                  placeholder="Spell Name" 
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSpell()} 
                />
                <datalist id="spell-options">
                  {availableSpells.map((spell: any, index: number) => (
                    <option key={index} value={spell.name} />
                  ))}
                </datalist>
              </div>

              <Select value={newSpellLevel} onValueChange={setNewSpellLevel}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Cantrip</SelectItem>
                  {[1,2,3,4,5,6,7,8,9].map(n => <SelectItem key={n} value={String(n)}>Lvl {n}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button onClick={handleAddSpell} disabled={!newSpellName.trim()} size="icon">
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
                      <div className="space-y-2">
                        {levelSpells.map(spell => {
                          
                          // Look up the full spell details using the new JSON
                          const fullSpellDetails = spellData.find(
                            (s: any) => s.name.toLowerCase() === spell.name.toLowerCase()
                          );
                          const isExpanded = expandedId === spell.id;

                          return (
                            <div key={spell.id} className="group bg-background/30 rounded border border-transparent hover:border-border transition-all overflow-hidden">
                              
                              {/* Clickable Header */}
                              <div 
                                className="flex justify-between items-center px-3 py-2 cursor-pointer hover:bg-background/50"
                                onClick={() => setExpandedId(isExpanded ? null : spell.id)}
                              >
                                <span className="text-foreground font-medium">{spell.name}</span>
                                
                                <div className="flex items-center gap-1">
                                  <Button 
                                    onClick={(e) => { e.stopPropagation(); removeSpell(spell.id); }} 
                                    size="icon" 
                                    variant="ghost" 
                                    className="w-7 h-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                  <span className="text-muted-foreground text-xs w-4 text-center">
                                    {isExpanded ? '▼' : '▶'}
                                  </span>
                                </div>
                              </div>

                              {/* NEW Mechanics-First Expanded Content Area mapped to the clean JSON */}
                              {isExpanded && fullSpellDetails && (
                                <div className="p-3 border-t border-border/50 bg-background/50 flex flex-col gap-3">
                                  
                                  {/* TOP METADATA: School & Classes */}
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold">
                                      {fullSpellDetails.school}
                                    </span>
                                    {fullSpellDetails.classes && fullSpellDetails.classes.length > 0 && (
                                      <span className="text-[10px] text-muted-foreground capitalize">
                                        {fullSpellDetails.classes.join(', ')}
                                      </span>
                                    )}
                                  </div>

                                  {/* TAGS ROW: Time, Range, Duration, Concentration, Ritual */}
                                  <div className="flex flex-wrap gap-2 text-xs font-mono">
                                    <span className="bg-neutral-900 text-neutral-300 px-2 py-1 rounded border border-neutral-800 capitalize">
                                      ⏱️ {fullSpellDetails.actionType}
                                    </span>
                                    <span className="bg-neutral-900 text-neutral-300 px-2 py-1 rounded border border-neutral-800">
                                      🎯 {fullSpellDetails.range}
                                    </span>
                                    
                                    {fullSpellDetails.concentration ? (
                                      <span className="bg-orange-950/50 text-orange-400 px-2 py-1 rounded border border-orange-900/50 font-bold tracking-wide">
                                        🧠 CONCENTRATION
                                      </span>
                                    ) : (
                                      <span className="bg-neutral-900 text-neutral-300 px-2 py-1 rounded border border-neutral-800">
                                        ⏳ {fullSpellDetails.duration}
                                      </span>
                                    )}

                                    {fullSpellDetails.ritual && (
                                      <span className="bg-blue-950/50 text-blue-400 px-2 py-1 rounded border border-blue-900/50 font-bold">
                                        RITUAL
                                      </span>
                                    )}
                                  </div>

                                  {/* COMPONENTS ROW */}
                                  <div className="text-xs text-neutral-400 bg-neutral-900/50 p-2 rounded border border-neutral-800/50">
                                    <span className="font-bold text-neutral-200">Components: </span>
                                    {fullSpellDetails.components && fullSpellDetails.components.map((c: string) => c.toUpperCase()).join(', ')}
                                    
                                    {fullSpellDetails.material && (
                                      <span className="italic text-neutral-500 ml-1">
                                        ({fullSpellDetails.material})
                                      </span>
                                    )}
                                  </div>

                                  {/* UPCAST / HIGHER LEVELS */}
                                  {fullSpellDetails.higherLevelSlot && (
                                    <div className="p-2 bg-indigo-950/30 border border-indigo-900/50 rounded-md text-indigo-200 text-sm">
                                      <span className="font-bold text-indigo-400 uppercase text-[10px] tracking-widest block mb-1">
                                        ⬆️ At Higher Levels
                                      </span>
                                      {fullSpellDetails.higherLevelSlot}
                                    </div>
                                  )}

                                  {/* COMPACT DESCRIPTION */}
                                  <p className="text-neutral-500 text-sm whitespace-pre-wrap leading-relaxed mt-2 line-clamp-4 hover:line-clamp-none transition-all cursor-ns-resize">
                                    {fullSpellDetails.description}
                                  </p>

                                </div>
                              )}
                              
                              {/* Fallback for custom spells not found in JSON */}
                              {isExpanded && !fullSpellDetails && (
                                <div className="p-3 border-t border-border/50 bg-background/50 text-sm text-muted-foreground italic">
                                  Custom spell. No details found in the database.
                                </div>
                              )}

                            </div>
                          );
                        })}
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