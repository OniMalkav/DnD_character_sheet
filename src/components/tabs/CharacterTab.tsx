"use client";

import { User, Download, Upload, PenLine, ScrollText, CloudUpload, CloudDownload, LogIn, LogOut, Skull, Zap, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useCharacter } from '@/contexts/CharacterContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// CENTRALIZED STYLE THEME FOR EASY EDITING
const THEME = {
  colors: {
    primary: 'var(--primary)',
    cloud: 'var(--cloud-sync)',
    labels: 'var(--muted-foreground)',
    textMuted: 'var(--muted-foreground)',
  }
};

import { useState } from 'react';

export default function CharacterTab() {
  const [expandedFeatId, setExpandedFeatId] = useState<number | null>(null);
  const {
    characterName, setCharacterName,
    charInfo, updateCharInfo,
    notes, setNotes,
    handleExport, handleImportClick,
    handleCloudSave, handleCloudLoad,
    user, handleSignIn, handleSignOut,
    featsList, addFeat, updateFeat, removeFeat, moveFeat
  } = useCharacter();

  return (
    <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 space-y-6">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <User className="w-6 h-6" style={{ color: THEME.colors.primary }} /> Character Profile
              </CardTitle>
              <CardDescription>Edit your character's core information.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="char-name-main" className="text-xs font-bold uppercase tracking-widest" style={{ color: THEME.colors.labels }}>Character Name</Label>
              <div className="relative mt-1">
                <PenLine className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: THEME.colors.textMuted }} />
                <Input
                  id="char-name-main"
                  type="text"
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  placeholder="e.g. Grog Strongjaw"
                  className="pl-10 pr-3 py-6 text-lg font-bold tracking-wide"
                />
              </div>
            </div>
            <div className="w-full md:w-40">
              <Label htmlFor="alignment" className="text-xs font-bold uppercase tracking-widest" style={{ color: THEME.colors.labels }}>Alignment</Label>
              <Input id="alignment" type="text" value={charInfo.alignment} onChange={(e) => updateCharInfo('alignment', e.target.value)} placeholder="e.g. CG" className="mt-1" />
            </div>
            <div className="w-full md:w-32">
              <Label htmlFor="xp" className="text-xs font-bold uppercase tracking-widest" style={{ color: THEME.colors.labels }}>XP</Label>
              <Input id="xp" type="number" value={charInfo.xp} onChange={(e) => updateCharInfo('xp', e.target.value)} placeholder="0" className="mt-1 font-bold tracking-tight text-foreground/90" />
            </div>
          </div>
          {/* VITALS & CONDITIONS SINGLE ROW */}
          <div className="bg-muted/30 p-4 rounded-lg border border-border/50 flex flex-wrap items-end gap-6 overflow-x-auto min-h-[90px]">
            <div className="flex-1 min-w-[60px]">
              <div className="h-5 flex items-center justify-center">
                <Label htmlFor="ac" className="text-xs font-bold uppercase tracking-widest text-center" style={{ color: THEME.colors.labels }}>AC</Label>
              </div>
              <Input id="ac" type="number" value={charInfo.ac} onChange={(e) => updateCharInfo('ac', e.target.value)} placeholder="10" className="mt-2 font-bold tracking-tight text-foreground/90 text-center text-2xl font-bold h-12 px-1" />
            </div>

            <div className="flex-[2] min-w-[180px]">
              <div className="h-5 flex items-center justify-center">
                <Label htmlFor="hp" className="text-xs font-bold uppercase tracking-widest text-center" style={{ color: THEME.colors.labels }}>HP</Label>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Input id="hp" type="number" value={charInfo.hp} onChange={(e) => updateCharInfo('hp', e.target.value)} placeholder="Cur" className="flex-1 font-bold tracking-tight text-foreground/90 text-center text-2xl font-bold h-12 px-1" />
                <div className="text-xl text-muted-foreground font-bold">/</div>
                <Input type="number" value={charInfo.maxHp} onChange={(e) => updateCharInfo('maxHp', e.target.value)} placeholder="Max" className="flex-1 font-bold tracking-tight text-foreground/90 text-center text-2xl font-bold h-12 px-1" />
              </div>
            </div>

            <div className="flex-1 min-w-[70px]">
              <div className="h-5 flex items-center justify-center">
                <Label htmlFor="tempHp" className="text-xs font-bold uppercase tracking-widest text-center" style={{ color: THEME.colors.labels }}>Temp</Label>
              </div>
              <Input id="tempHp" type="number" value={charInfo.tempHp} onChange={(e) => updateCharInfo('tempHp', e.target.value)} placeholder="0" className="mt-2 font-bold tracking-tight text-foreground/90 text-center text-xl h-12 px-1 border-orange-500/20" />
            </div>

            <div className="flex-[1.5] min-w-[120px]">
              <div className="h-5 flex items-center justify-center">
                <Label className="text-xs font-bold uppercase tracking-widest text-center" style={{ color: THEME.colors.labels }}>HitDie</Label>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <Select value={charInfo.hitDie || 'd8'} onValueChange={(value) => updateCharInfo('hitDie', value)}>
                  <SelectTrigger className="flex-1 h-12 font-bold tracking-tight text-foreground/90 text-center px-1">
                    <SelectValue placeholder="d8" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="d4">d4</SelectItem>
                    <SelectItem value="d6">d6</SelectItem>
                    <SelectItem value="d8">d8</SelectItem>
                    <SelectItem value="d10">d10</SelectItem>
                    <SelectItem value="d12">d12</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-1">
                  <Input 
                    type="number"
                    value={charInfo.hitDieCount}
                    onChange={(e) => updateCharInfo('hitDieCount', parseInt(e.target.value) || 0)}
                    className="w-14 h-12 text-center font-bold tracking-tight text-foreground/90 text-xl"
                    placeholder="0"
                  />
                  <div className="text-muted-foreground/50 font-bold px-1">
                    / {(parseInt(charInfo.level?.toString() || '0') || 0) + (parseInt(charInfo.level2?.toString() || '0') || 0)}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 min-w-[60px]">
              <div className="h-5 flex items-center justify-center">
                <Label className="text-xs font-bold uppercase tracking-widest text-center" style={{ color: THEME.colors.labels }}>Exhaust</Label>
              </div>
              <Input 
                type="number" 
                min={0} 
                max={6} 
                value={charInfo.exhaustion} 
                onChange={(e) => updateCharInfo('exhaustion', Math.min(6, Math.max(0, parseInt(e.target.value) || 0)))} 
                className="mt-2 h-12 text-center font-bold tracking-tight text-foreground/90 text-xl"
              />
            </div>

            <div className="flex-1 min-w-[60px]">
              <div className="h-5 flex items-center justify-center">
                <Label className="text-xs font-bold uppercase tracking-widest text-center" style={{ color: THEME.colors.labels }}>Poison</Label>
              </div>
              <div className="flex justify-center mt-2 h-12 items-center">
                <Checkbox 
                  checked={charInfo.isPoisoned} 
                  onCheckedChange={(checked) => updateCharInfo('isPoisoned', !!checked)}
                  className="h-6 w-6 border-2"
                />
              </div>
            </div>

            <div className="flex-[1.5] min-w-[120px]">
              <div className="h-5 flex items-center justify-center">
                <Label className="text-xs font-bold uppercase tracking-widest text-center" style={{ color: THEME.colors.labels }}>Other</Label>
              </div>
              <Input 
                value={charInfo.cond3} 
                onChange={(e) => updateCharInfo('cond3', e.target.value)} 
                placeholder="Effect Notes" 
                className="mt-2 h-12 text-sm font-bold tracking-tight text-foreground/90 px-3" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="class1" className="text-xs font-bold uppercase tracking-widest" style={{ color: THEME.colors.labels }}>Class & Level</Label>
              <div className="flex gap-2 mt-1">
                <Input id="class1" type="text" value={charInfo.class} onChange={(e) => updateCharInfo('class', e.target.value)} placeholder="e.g. Barbarian" />
                <Input type="number" value={charInfo.level} onChange={(e) => updateCharInfo('level', e.target.value)} placeholder="Lvl" className="w-20 text-center font-bold tracking-tight text-foreground/90" />
              </div>
            </div>
            <div>
              <Label htmlFor="class2" className="text-xs font-bold uppercase tracking-widest" style={{ color: THEME.colors.labels }}>Multiclass (Optional)</Label>
              <div className="flex gap-2 mt-1">
                <Input id="class2" type="text" value={charInfo.class2} onChange={(e) => updateCharInfo('class2', e.target.value)} placeholder="e.g. Fighter" />
                <Input type="number" value={charInfo.level2} onChange={(e) => updateCharInfo('level2', e.target.value)} placeholder="Lvl" className="w-20 text-center font-bold tracking-tight text-foreground/90" />
              </div>
            </div>
            <div>
              <Label htmlFor="race" className="text-xs font-bold uppercase tracking-widest" style={{ color: THEME.colors.labels }}>Race</Label>
              <Input id="race" type="text" value={charInfo.race} onChange={(e) => updateCharInfo('race', e.target.value)} placeholder="e.g. Goliath" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="background" className="text-xs font-bold uppercase tracking-widest" style={{ color: THEME.colors.labels }}>Background</Label>
              <Input id="background" type="text" value={charInfo.background} onChange={(e) => updateCharInfo('background', e.target.value)} placeholder="e.g. Outlander" className="mt-1" />
            </div>
          </div>
          <div className="sm:col-span-2 lg:col-span-3 mt-4">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: THEME.colors.labels }}>
                <ScrollText className="w-3 h-3" /> Feats & Traits
              </Label>
              <Button onClick={addFeat} size="sm" variant="outline" className="h-7 text-[10px] uppercase font-bold tracking-widest">
                <Plus className="w-3 h-3 mr-1" /> Add
              </Button>
            </div>
            
            <div className="space-y-3">
              {featsList && featsList.length > 0 ? featsList.map((feat) => {
                const isExpanded = expandedFeatId === feat.id;
                return (
                  <div key={feat.id} className="bg-background/40 border border-border/50 rounded-lg overflow-hidden transition-all hover:border-border group">
                    <div 
                      className="flex items-center gap-1 p-2 cursor-pointer hover:bg-background/60"
                      onClick={() => setExpandedFeatId(isExpanded ? null : feat.id)}
                    >
                      <div className="flex flex-col shrink-0">
                        <Button
                          onClick={(e) => { e.stopPropagation(); moveFeat(feat.id, 'up'); }}
                          variant="ghost"
                          size="icon"
                          className="w-5 h-4 rounded-b-none hover:bg-background text-muted-foreground/40 hover:text-foreground"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </Button>
                        <Button
                          onClick={(e) => { e.stopPropagation(); moveFeat(feat.id, 'down'); }}
                          variant="ghost"
                          size="icon"
                          className="w-5 h-4 rounded-t-none hover:bg-background text-muted-foreground/40 hover:text-foreground"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </Button>
                      </div>
                      <Button
                        onClick={(e) => { e.stopPropagation(); removeFeat(feat.id); }}
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6 text-muted-foreground/50 hover:text-destructive shrink-0 ml-1 mr-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                      <Input
                        value={feat.name}
                        onChange={(e) => updateFeat(feat.id, 'name', e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="Feat / Trait Name"
                        className="h-8 flex-1 font-bold tracking-tight bg-transparent border-0 focus-visible:ring-1 px-1"
                      />
                      <div className="shrink-0 text-muted-foreground/60 px-2">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="p-3 border-t border-border/50 bg-background/20">
                        <Textarea
                          value={feat.description}
                          onChange={(e) => updateFeat(feat.id, 'description', e.target.value)}
                          placeholder="Describe the feat or trait here..."
                          className="min-h-[100px] text-sm resize-y font-medium tracking-tight bg-background/50 border-border/50 focus-visible:ring-1"
                        />
                      </div>
                    )}
                  </div>
                );
              }) : (
                <div className="text-center p-6 bg-muted/20 rounded-lg border border-dashed border-border/50">
                  <p className="text-sm text-muted-foreground font-medium mb-3">No feats or traits added yet.</p>
                  <Button onClick={addFeat} size="sm" variant="secondary" className="h-8">
                    <Plus className="w-4 h-4 mr-2" /> Add Your First Feat
                  </Button>
                </div>
              )}
            </div>
            
            {/* Keeping old legacy feats string display conditionally just in case they have data there they haven't migrated yet */}
            {charInfo.feats && charInfo.feats.trim() !== '' && (
              <div className="mt-4 pt-4 border-t border-dashed border-border/50">
                <Label htmlFor="legacy-feats" className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mb-2 text-orange-400">
                  ⚠️ Legacy Feats Data (Please migrate to the new list above)
                </Label>
                <Textarea
                  id="legacy-feats"
                  value={charInfo.feats}
                  onChange={(e) => updateCharInfo('feats', e.target.value)}
                  className="font-bold tracking-tight text-foreground/90 text-sm h-32 resize-y opacity-70"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ADVENTURE NOTES moved from Inventory to Character Tab */}
      <Card className="flex flex-col shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ScrollText className="w-5 h-5" style={{ color: THEME.colors.primary }} /> Adventure Notes
          </CardTitle>
          <CardDescription>Keep track of session details, plot hooks, and backstory.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex min-h-[300px]">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Start writing your adventure journal here..."
            className="flex-1 w-full font-bold tracking-tight text-foreground/90 text-sm resize-y leading-relaxed bg-background"
            spellCheck={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}
