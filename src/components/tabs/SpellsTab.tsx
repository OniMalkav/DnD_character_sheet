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




// Update this to wherever you saved your new spell list!
import spellData from '@/lib/spells/spells_2024_enriched.json';


// CENTRALIZED STYLE THEME FOR EASY EDITING
const THEME = {
  colors: {
    saveDc: '#c77c1aff',       // Amber Orange
    labels: '#fafafaff',       // Muted Gray
    attackBonus: '#72b7dfff',  // Green
    error: '#EF4444',         // Red
    school: '#818CF8',        // Indigo
    damage: '#F87171',        // Light Red
    damageType: 'rgba(252, 165, 165, 0.7)',
    save: '#FB923C',          // Orange
    textMain: '#FFFFFF',      // White
    textMuted: '#A3A3A3',     // Neutral 400
    concentration: '#FB923C', // Orange
    ritual: '#60A5FA',        // Blue
    components: '#FFFFFF',    // White

    // Backgrounds & Borders
    mechanicsBg: '#0A0A0A',   // Neutral 950
    mechanicsBorder: '#262626', // Neutral 800
    tagBg: '#171717',         // Neutral 900
    tagBorder: '#262626',
    componentBg: 'rgba(23, 23, 23, 0.5)',
    upcastBg: 'rgba(30, 27, 75, 0.3)', // Indigo-950
    upcastBorder: 'rgba(49, 46, 129, 0.5)',
    upcastText: '#C7D2FE',
  }
};

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
              <label
                className="text-xs font-bold uppercase tracking-widest mb-1"
                style={{ color: THEME.colors.labels }}
              >
                Ability
              </label>
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
              <span className="text-xs font-bold uppercase" style={{ color: THEME.colors.labels }}>Save DC</span>
              <span className="text-3xl font-black font-headline" style={{ color: THEME.colors.saveDc }}>{spellSaveDC}</span>
            </div>

            <div className="flex flex-col items-center px-4 border-l">
              <span className="text-xs font-bold uppercase" style={{ color: THEME.colors.labels }}>Attack</span>
              <span className="text-3xl font-black font-headline" style={{ color: THEME.colors.attackBonus }}>+{spellAttackMod}</span>
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
                        aria-label={`Spell slot ${level}-${i + 1}`}
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
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => <SelectItem key={n} value={String(n)}>Lvl {n}</SelectItem>)}
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
                      <div
                        className="text-xs font-bold uppercase tracking-widest border-b mb-2 pb-1"
                        style={{ color: THEME.colors.labels, borderColor: THEME.colors.tagBorder }}
                      >
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
                                    <span
                                      className="text-[10px] uppercase tracking-widest font-bold"
                                      style={{ color: THEME.colors.school }}
                                    >
                                      {fullSpellDetails.school}
                                    </span>
                                    {fullSpellDetails.classes && fullSpellDetails.classes.length > 0 && (
                                      <span className="text-[10px] capitalize" style={{ color: THEME.colors.labels }}>
                                        {fullSpellDetails.classes.join(', ')}
                                      </span>
                                    )}
                                  </div>

                                  {/* MECHANICS ROW: Highlighted Damage & Save DC */}
                                  {(fullSpellDetails.damageRoll || fullSpellDetails.saveRequired) && (
                                    <div
                                      className="flex gap-4 p-3 rounded-lg border shadow-inner mt-2"
                                      style={{ backgroundColor: THEME.colors.mechanicsBg, borderColor: THEME.colors.mechanicsBorder }}
                                    >
                                      {fullSpellDetails.damageRoll && (
                                        <div className="flex flex-col">
                                          <span className="text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: THEME.colors.labels }}>Damage</span>
                                          <span className="font-black text-xl flex items-baseline gap-1" style={{ color: THEME.colors.damage }}>
                                            {fullSpellDetails.damageRoll}
                                            {fullSpellDetails.damageType && (
                                              <span className="text-xs font-normal capitalize" style={{ color: THEME.colors.damageType }}>
                                                {fullSpellDetails.damageType}
                                              </span>
                                            )}
                                          </span>
                                        </div>
                                      )}

                                      {/* Divider if it has both */}
                                      {(fullSpellDetails.damageRoll && fullSpellDetails.saveRequired) && (
                                        <div className="w-px mx-2" style={{ backgroundColor: THEME.colors.mechanicsBorder }}></div>
                                      )}

                                      {fullSpellDetails.saveRequired && (
                                        <div className="flex flex-col">
                                          <span className="text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: THEME.colors.labels }}>Save Required</span>
                                          <span className="font-black text-xl uppercase" style={{ color: THEME.colors.save }}>
                                            {fullSpellDetails.saveRequired}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* TAGS ROW */}
                                  <div className="flex flex-wrap gap-2 text-xs font-mono">
                                    <span className="px-2 py-1 rounded border capitalize" style={{ backgroundColor: THEME.colors.tagBg, borderColor: THEME.colors.tagBorder, color: THEME.colors.textMuted }}>
                                      ⏱️ {fullSpellDetails.actionType}
                                    </span>
                                    <span className="px-2 py-1 rounded border" style={{ backgroundColor: THEME.colors.tagBg, borderColor: THEME.colors.tagBorder, color: THEME.colors.textMuted }}>
                                      🎯 {fullSpellDetails.range}
                                    </span>

                                    {fullSpellDetails.concentration ? (
                                      <span className="px-2 py-1 rounded border font-bold tracking-wide" style={{ backgroundColor: 'rgba(251, 146, 60, 0.15)', borderColor: 'rgba(251, 146, 60, 0.3)', color: THEME.colors.concentration }}>
                                        🧠 CONCENTRATION
                                      </span>
                                    ) : (
                                      <span className="px-2 py-1 rounded border" style={{ backgroundColor: THEME.colors.tagBg, borderColor: THEME.colors.tagBorder, color: THEME.colors.textMuted }}>
                                        ⏳ {fullSpellDetails.duration}
                                      </span>
                                    )}

                                    {fullSpellDetails.ritual && (
                                      <span className="px-2 py-1 rounded border font-bold" style={{ backgroundColor: 'rgba(96, 165, 250, 0.15)', borderColor: 'rgba(96, 165, 250, 0.3)', color: THEME.colors.ritual }}>
                                        RITUAL
                                      </span>
                                    )}
                                  </div>

                                  {/* COMPONENTS ROW */}
                                  <div
                                    className="text-xs p-2 rounded border"
                                    style={{ backgroundColor: THEME.colors.componentBg, borderColor: 'rgba(38, 38, 38, 0.5)', color: THEME.colors.components }}
                                  >
                                    <span className="font-bold">Components: </span>
                                    {fullSpellDetails.components && fullSpellDetails.components.map((c: string) => c.toUpperCase()).join(', ')}

                                    {fullSpellDetails.material && (
                                      <span className="italic ml-1" style={{ color: THEME.colors.components }}>
                                        ({fullSpellDetails.material})
                                      </span>
                                    )}
                                  </div>

                                  {/* UPCAST / HIGHER LEVELS */}
                                  {fullSpellDetails.higherLevelSlot && (
                                    <div
                                      className="p-2 border rounded-md text-sm"
                                      style={{ backgroundColor: THEME.colors.upcastBg, borderColor: THEME.colors.upcastBorder, color: THEME.colors.upcastText }}
                                    >
                                      <span
                                        className="font-bold uppercase text-[10px] tracking-widest block mb-1"
                                        style={{ color: THEME.colors.school }}
                                      >
                                        At Higher Levels
                                      </span>
                                      {fullSpellDetails.higherLevelSlot}
                                    </div>
                                  )}

                                  {/* COMPACT DESCRIPTION */}
                                  <p
                                    className="text-sm whitespace-pre-wrap leading-relaxed mt-2 line-clamp-4 hover:line-clamp-none transition-all cursor-ns-resize"
                                    style={{ color: THEME.colors.textMain }}
                                  >
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