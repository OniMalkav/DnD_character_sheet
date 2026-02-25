"use client";

import { User, Download, Upload, PenLine, ScrollText } from 'lucide-react';
import { useCharacter } from '@/contexts/CharacterContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function CharacterTab() {
  const {
    characterName, setCharacterName,
    charInfo, updateCharInfo,
    handleExport, handleImportClick
  } = useCharacter();

  return (
    <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                  <User className="w-6 h-6 text-primary" /> Character Profile
                </CardTitle>
                <CardDescription>Edit your character's core information.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleExport} variant="secondary">
                  <Download className="w-4 h-4 mr-2" /> Export
                </Button>
                <Button onClick={handleImportClick} variant="secondary">
                  <Upload className="w-4 h-4 mr-2" /> Import
                </Button>
              </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="char-name-main" className="text-xs font-bold uppercase tracking-widest">Character Name</Label>
            <div className="relative mt-1">
              <PenLine className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="class1" className="text-xs font-bold uppercase tracking-widest">Class & Level</Label>
              <div className="flex gap-2 mt-1">
                <Input id="class1" type="text" value={charInfo.class} onChange={(e) => updateCharInfo('class', e.target.value)} placeholder="e.g. Barbarian" />
                <Input type="number" value={charInfo.level} onChange={(e) => updateCharInfo('level', e.target.value)} placeholder="Lvl" className="w-20 text-center font-code" />
              </div>
            </div>
            <div>
              <Label htmlFor="class2" className="text-xs font-bold uppercase tracking-widest">Multiclass (Optional)</Label>
              <div className="flex gap-2 mt-1">
                <Input id="class2" type="text" value={charInfo.class2} onChange={(e) => updateCharInfo('class2', e.target.value)} placeholder="e.g. Fighter" />
                <Input type="number" value={charInfo.level2} onChange={(e) => updateCharInfo('level2', e.target.value)} placeholder="Lvl" className="w-20 text-center font-code" />
              </div>
            </div>
            <div>
              <Label htmlFor="race" className="text-xs font-bold uppercase tracking-widest">Race</Label>
              <Input id="race" type="text" value={charInfo.race} onChange={(e) => updateCharInfo('race', e.target.value)} placeholder="e.g. Goliath" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="background" className="text-xs font-bold uppercase tracking-widest">Background</Label>
              <Input id="background" type="text" value={charInfo.background} onChange={(e) => updateCharInfo('background', e.target.value)} placeholder="e.g. Outlander" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="alignment" className="text-xs font-bold uppercase tracking-widest">Alignment</Label>
              <Input id="alignment" type="text" value={charInfo.alignment} onChange={(e) => updateCharInfo('alignment', e.target.value)} placeholder="e.g. Chaotic Good" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="xp" className="text-xs font-bold uppercase tracking-widest">Experience Points</Label>
              <Input id="xp" type="number" value={charInfo.xp} onChange={(e) => updateCharInfo('xp', e.target.value)} placeholder="0" className="mt-1 font-code" />
            </div>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <Label htmlFor="feats" className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <ScrollText className="w-3 h-3" /> Feats & Traits
            </Label>
            <Textarea
              id="feats"
              value={charInfo.feats}
              onChange={(e) => updateCharInfo('feats', e.target.value)}
              placeholder="List feats, racial traits, and class features here..."
              className="mt-1 font-code text-sm h-32 resize-y"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
