"use client";

import React, { useState, useEffect } from 'react';
import { useCharacter } from '@/contexts/CharacterContext';
import PortraitUpload from '@/components/character/PortraitUpload';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BicepsFlexed, Shield, Sword, Download, Upload, CloudUpload, CloudDownload, LogIn, LogOut, Zap, Plus, Minus, Skull, CheckCircle2, XCircle } from 'lucide-react';
import { cn, calculateModifier } from '@/lib/utils';

const THEME = {
  colors: {
    primary: 'var(--primary)',
    cloud: 'var(--cloud-sync)',
    textMuted: 'var(--muted-foreground)',
    deathSuccess: 'var(--death-save-success, #19fc24)',
    deathFailure: 'var(--death-save-failure, #ef4444)',
  }
};

export default function HomeTab() {
  const { 
    characterName, setCharacterName, charInfo, updateCharInfo, stats, profs, 
    consumables, equipmentItems, inventoryItems, doubleCarry,
    shortRest, longRest,
    handleExport, handleImportClick, handleCloudSave, handleCloudLoad,
    user, handleSignIn, handleSignOut,
    cloudCharacters, loadCharacterById, resetCharacter
  } = useCharacter();

  const currentHp = parseInt(charInfo.hp?.toString() || '0') || 0;
  const maxHp = parseInt(charInfo.maxHp?.toString() || '10') || 10;

  // Death Saves state (3 successes, 3 failures)
  const [deathSaves, setDeathSaves] = useState<{ successes: boolean[]; failures: boolean[] }>({
    successes: [false, false, false],
    failures: [false, false, false],
  });

  // Automatically reset Death Saves if HP increases above 0
  useEffect(() => {
    if (currentHp > 0) {
      setDeathSaves({
        successes: [false, false, false],
        failures: [false, false, false],
      });
    }
  }, [currentHp]);

  const toggleDeathSave = (type: 'successes' | 'failures', index: number) => {
    setDeathSaves(prev => {
      const nextList = [...prev[type]];
      nextList[index] = !nextList[index];
      return { ...prev, [type]: nextList };
    });
  };

  const adjustHp = (amount: number) => {
    const nextHp = Math.max(0, Math.min(maxHp, currentHp + amount));
    updateCharInfo('hp', nextHp);
  };

  // WEIGHT LOGIC (Synced with InventoryTab)
  const totalWeight = consumables.reduce((acc, item) => acc + ((item.weight || 0) * item.count), 0) + 
                      equipmentItems.reduce((acc, item) => acc + (item.weight || 0), 0) +
                      inventoryItems.reduce((acc, item) => acc + (item.weight || 0), 0);
  const carryCapacity = (stats.str || 10) * 15 * (doubleCarry ? 2 : 1);
  const isEncumbered = totalWeight > carryCapacity;

  // PROFICIENCY LOGIC
  const saveProfs = (['str', 'dex', 'con', 'int', 'wis', 'cha'] as const)
    .filter(s => profs.has(`SAVE_${s.toUpperCase()}`))
    .map(s => s.toUpperCase());

  // We'll show names from the set that don't start with SAVE_ or EXP_
  const skillProfs = Array.from(profs)
    .filter(p => !p.startsWith('SAVE_') && !p.startsWith('EXP_'))
    .map(name => ({
      name,
      isExpertise: profs.has(`EXP_${name}`)
    }));

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-8 space-y-12 animate-in fade-in zoom-in duration-700">
      
      {/* DATA MANAGEMENT TOOLBAR */}
      <div className="flex flex-wrap items-center justify-center gap-3 bg-background/30 backdrop-blur-md p-3 rounded-2xl border border-white/5 shadow-2xl">
        {user ? (
          <Button onClick={handleSignOut} variant="ghost" className="h-9 text-xs font-bold uppercase tracking-wider" style={{ color: THEME.colors.textMuted }} title={`Signed in as ${user.email}`}>
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        ) : (
          <Button
            onClick={handleSignIn}
            variant="outline"
            className="h-9 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500/10 border-indigo-500/20"
            style={{ color: THEME.colors.cloud }}
          >
            <LogIn className="w-4 h-4 mr-2" /> Cloud Sign In
          </Button>
        )}
        
        {user && (
          <>
            <div className="w-px h-6 bg-white/10 hidden sm:block mx-1" />
            <Select onValueChange={(val) => val === 'NEW' ? resetCharacter() : loadCharacterById(val)}>
              <SelectTrigger className="w-[140px] h-9 text-[10px] font-black uppercase tracking-widest bg-white/5 border-white/10 text-white/80">
                <SelectValue placeholder="Select Hero" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NEW" className="text-[10px] font-black uppercase tracking-widest text-primary border-b border-white/5 mb-1">
                  + Create New Hero
                </SelectItem>
                {cloudCharacters.map((char) => (
                  <SelectItem key={char.id} value={char.id} className="text-[10px] font-black uppercase tracking-widest">
                    {char.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}

        <Button
          onClick={handleCloudSave}
          variant="outline"
          className="h-9 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500/10 border-indigo-500/20"
          style={{ color: THEME.colors.cloud }}
        >
          <CloudUpload className="w-4 h-4 mr-2" /> Cloud Save
        </Button>

        <div className="w-px h-6 bg-white/10 hidden sm:block mx-1" />

        <Button onClick={handleImportClick} variant="ghost" className="h-9 text-[10px] font-black uppercase tracking-widest text-white/80 hover:text-white">
          <Upload className="w-4 h-4 mr-2" /> Import
        </Button>
        <Button onClick={handleExport} variant="ghost" className="h-9 text-[10px] font-black uppercase tracking-widest text-white/80 hover:text-white">
          <Download className="w-4 h-4 mr-2" /> Export
        </Button>
      </div>

      {/* HEADER SECTION */}
      <div className="text-center space-y-4 w-full max-w-2xl">
        <Input
          value={characterName}
          onChange={(e) => setCharacterName(e.target.value)}
          placeholder="Unnamed Hero"
          className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white drop-shadow-xl bg-transparent border-0 text-center focus-visible:ring-0 focus-visible:ring-offset-0 h-auto p-0 placeholder:text-white/20"
        />
        
        <div className="flex flex-col items-center gap-3">
          <div className="flex flex-wrap items-center justify-center gap-2 text-primary-foreground/90 font-black uppercase tracking-[0.2em] text-xs md:text-sm bg-primary/20 backdrop-blur-sm px-4 py-1.5 rounded-full border border-primary/20">
            <span className="text-white">{charInfo.race || "Race"}</span>
            <span className="text-primary">•</span>
            <span className="text-white">
              {charInfo.class || "Class"}{charInfo.subclass ? ` (${charInfo.subclass})` : ""}
              {charInfo.class2 ? ` ${charInfo.level}` : ""}
            </span>
            {charInfo.class2 && (
              <>
                <span className="text-primary">•</span>
                <span className="text-white">
                  {charInfo.class2}{charInfo.subclass2 ? ` (${charInfo.subclass2})` : ""}
                  {` ${charInfo.level2}`}
                </span>
              </>
            )}
            {!charInfo.class2 && (
              <>
                <span className="text-primary">•</span>
                <span className="text-white">Level {charInfo.level || 1}</span>
              </>
            )}
          </div>

          {charInfo.heroicInspiration && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-[10px] font-black text-yellow-500 uppercase tracking-[0.15em] shadow-[0_0_15px_-3px_rgba(234,179,8,0.2)] animate-pulse">
              <Zap className="w-3 h-3 fill-current" />
              Heroic Inspiration
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-12 md:gap-24 items-start w-full max-w-7xl px-8">
        
        {/* LEFT PANEL: CONSOLIDATED VITALS & PROFICIENCIES */}
        <div className="flex flex-col gap-6 min-w-[350px] order-2 lg:order-1">
          
          {/* TOP VITALS ROW (HP & Hit Dice) */}
          <div className="grid grid-cols-[1fr_auto] gap-8 items-start">
            {/* HP SECTION */}
            <div className="space-y-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Vitality</span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={shortRest}
                    className="text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-white/80"
                  >
                    Short Rest
                  </button>
                  <button 
                    onClick={longRest}
                    className="text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded border border-primary/30 bg-primary/10 hover:bg-primary/20 hover:border-primary/50 transition-all text-primary"
                  >
                    Long Rest
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-baseline gap-1 text-white">
                  <span className="text-6xl font-black tabular-nums tracking-tighter">{charInfo.hp}</span>
                  <span className="text-2xl font-bold opacity-80">/ {charInfo.maxHp}</span>
                </div>
                
                {/* QUICK HP ADJUSTMENT BUTTONS */}
                <div className="flex items-center gap-1 self-center ml-2">
                  <button
                    onClick={() => adjustHp(-1)}
                    disabled={currentHp <= 0}
                    title="Decrease HP (-1)"
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 active:scale-95 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-white/90 hover:text-white transition-all shadow-sm"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => adjustHp(1)}
                    disabled={currentHp >= maxHp}
                    title="Increase HP (+1)"
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 active:scale-95 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-white/90 hover:text-white transition-all shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {parseInt(charInfo.tempHp?.toString() || '0') > 0 && (
                <div className="inline-block px-2 py-0.5 rounded bg-[color:var(--home-temp-hp-bg)] border border-[color:var(--home-temp-hp-border)] text-[10px] font-black text-white uppercase tracking-tighter">
                  +{charInfo.tempHp} Temp HP
                </div>
              )}
            </div>

            {/* HIT DIE SECTION */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Hit Dice</span>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <div className="bg-white/10 text-white h-10 w-10 flex items-center justify-center rounded-lg border border-white/20 text-sm font-black uppercase shadow-inner">
                  {charInfo.hitDie || 'd8'}
                </div>
                <div className="flex items-baseline gap-1 text-white">
                  <span className="text-3xl font-black tabular-nums tracking-tighter">{charInfo.hitDieCount}</span>
                  <span className="text-sm font-bold opacity-80">/ {(parseInt(charInfo.level?.toString() || '0') || 0) + (parseInt(charInfo.level2?.toString() || '0') || 0)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* DEATH SAVES CONTAINER (Only visible when currentHp === 0) */}
          {currentHp === 0 && (
            <div className="bg-[color:var(--home-death-panel-bg)] border border-[color:var(--home-death-panel-border)] rounded-2xl p-4 space-y-3 backdrop-blur-md shadow-2xl animate-in fade-in zoom-in duration-300">
              <div className="flex items-center justify-between border-b border-[color:var(--home-death-panel-border)] pb-2">
                <div className="flex items-center gap-2">
                  <Skull className="w-4 h-4 text-red-400 animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-red-300">Death Saves</span>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/50">Unconscious</span>
              </div>

              <div className="space-y-2.5">
                {/* SUCCESSES ROW */}
                <div className="flex items-center justify-between bg-black/30 px-3 py-2 rounded-xl border border-white/5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Successes</span>
                  <div className="flex items-center gap-2.5">
                    {deathSaves.successes.map((checked, idx) => (
                      <button
                        key={`success-${idx}`}
                        type="button"
                        onClick={() => toggleDeathSave('successes', idx)}
                        className={cn(
                          "w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer active:scale-90",
                          checked
                            ? "bg-emerald-500 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)] text-black"
                            : "border-white/20 bg-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/10"
                        )}
                        title={`Success ${idx + 1}`}
                      >
                        {checked && <div className="w-2 h-2 rounded-full bg-black" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* FAILURES ROW */}
                <div className="flex items-center justify-between bg-black/30 px-3 py-2 rounded-xl border border-white/5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-400">Failures</span>
                  <div className="flex items-center gap-2.5">
                    {deathSaves.failures.map((checked, idx) => (
                      <button
                        key={`failure-${idx}`}
                        type="button"
                        onClick={() => toggleDeathSave('failures', idx)}
                        className={cn(
                          "w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer active:scale-90",
                          checked
                            ? "bg-rose-500 border-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.5)] text-white"
                            : "border-white/20 bg-white/5 hover:border-rose-500/50 hover:bg-rose-500/10"
                        )}
                        title={`Failure ${idx + 1}`}
                      >
                        {checked && <div className="w-2 h-2 rounded-full bg-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ABILITY MODS ROW (NEW) */}
          <div className="grid grid-cols-6 gap-2 bg-white/5 p-3 rounded-xl border border-white/10">
            {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as const).map(stat => {
              const mod = calculateModifier(stats[stat]);
              const sign = mod >= 0 ? '+' : '';
              return (
                <div key={stat} className="flex flex-col items-center">
                  <span className="text-[9px] font-black uppercase text-white/80 mb-1">{stat}</span>
                  <span className="text-lg font-black text-white tabular-nums tracking-tighter">{sign}{mod}</span>
                </div>
              );
            })}
          </div>

          <div className="w-full h-px bg-white/10" />

          {/* SAVING PROFICIENCIES */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80 flex items-center gap-1">
                <Shield className="w-3 h-3" /> Saving Proficiencies
              </span>
              <div className="h-px flex-grow bg-white/10" />
            </div>
            <div className="flex flex-wrap gap-2 text-white">
              {saveProfs.length > 0 ? saveProfs.map(save => (
                <div key={save} className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-black text-white uppercase tracking-widest">
                  {save}
                </div>
              )) : (
                <span className="text-xs italic text-white/80">No proficiencies marked</span>
              )}
            </div>
          </div>

          {/* SKILL PROFICIENCIES */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80 flex items-center gap-1">
                <Sword className="w-3 h-3" /> Skill Proficiencies
              </span>
              <div className="h-px flex-grow bg-white/10" />
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {skillProfs.length > 0 ? skillProfs.map(({ name, isExpertise }) => (
                <div key={name} className="text-[11px] font-bold text-white/90 uppercase tracking-tight flex items-center gap-2">
                  <div className={cn("w-1.5 h-1.5 rounded-full", isExpertise ? "bg-amber-400" : "bg-primary")} />
                  <span>{name}</span>
                  {isExpertise && <span className="text-[9px] text-amber-400 font-extrabold lowercase italic">(expertise)</span>}
                </div>
              )) : (
                <span className="text-xs italic text-white/80">No skills proficient</span>
              )}
            </div>
          </div>

          <div className="w-full h-px bg-white/10" />

          {/* CARRY WEIGHT */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80 flex items-center gap-1">
                <BicepsFlexed className="w-3 h-3" /> Encumbrance
              </span>
              <div className="h-px flex-grow bg-white/10" />
            </div>
            <div className="flex items-baseline gap-2 text-white">
              <span className={cn(
                "text-3xl font-black tabular-nums tracking-tighter",
                isEncumbered ? "text-red-400" : "text-white"
              )}>
                {totalWeight.toFixed(1)}
              </span>
              <span className="text-sm font-bold opacity-80">/ {carryCapacity} lbs</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: PORTRAIT (Fills space) */}
        <div className="flex justify-center lg:justify-end order-1 lg:order-2">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-orange-500 rounded-[3rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <Card className="relative bg-background/50 backdrop-blur-3xl border-border/50 rounded-[2.5rem] overflow-hidden shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)]">
              <CardContent className="p-4 md:p-6 text-white">
                <PortraitUpload />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
