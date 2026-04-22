"use client";

import React from 'react';
import { Shield, Heart, Zap, Sword, BookOpen, Activity, Trash2, Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { useCharacter } from '@/contexts/CharacterContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { calculateModifier } from '@/lib/utils';
import type { Stat, SummonAction, SummonTrait } from '@/lib/types';

const THEME = {
  colors: {
    bg: 'var(--summon-bg)',
    accent: 'var(--summon-accent)',
    headerBg: 'var(--summon-header-bg)',
    statLabel: 'var(--summon-stat-label)',
    statValue: 'var(--summon-stat-value)',
    statMod: 'var(--summon-stat-mod)',
    sectionTitle: 'var(--summon-section-title)',
    btnBg: 'var(--summon-btn-bg)',
  }
};

export default function SummonTab() {
  const { summonData, updateSummonData } = useCharacter();
  
  // Track which individual items are collapsed by ID
  const [collapsedIds, setCollapsedIds] = React.useState<Set<string>>(new Set());

  const toggleItemCollapse = (id: string) => {
    const newCollapsed = new Set(collapsedIds);
    if (newCollapsed.has(id)) {
      newCollapsed.delete(id);
    } else {
      newCollapsed.add(id);
    }
    setCollapsedIds(newCollapsed);
  };

  const handleStatChange = (stat: Stat, value: string) => {
    const numValue = parseInt(value) || 0;
    updateSummonData('stats', { ...summonData.stats, [stat]: numValue });
  };

  const addTrait = () => {
    const newTrait: SummonTrait = { id: Date.now().toString(), name: 'New Trait', description: '' };
    updateSummonData('traits', [...summonData.traits, newTrait]);
  };

  const updateTrait = (id: string, field: keyof SummonTrait, value: string) => {
    updateSummonData('traits', summonData.traits.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const removeTrait = (id: string) => {
    updateSummonData('traits', summonData.traits.filter(t => t.id !== id));
  };

  const addAction = (type: 'actions' | 'bonusActions' | 'reactions') => {
    const newAction: SummonAction = { id: Date.now().toString(), name: 'New Action', description: '' };
    updateSummonData(type, [...summonData[type], newAction]);
  };

  const updateAction = (type: 'actions' | 'bonusActions' | 'reactions', id: string, field: keyof SummonAction, value: string) => {
    updateSummonData(type, summonData[type].map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const removeAction = (type: 'actions' | 'bonusActions' | 'reactions', id: string) => {
    updateSummonData(type, summonData[type].filter(a => a.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 pb-10">
      <div className="max-w-3xl mx-auto border-t-8 border-b-8 shadow-2xl rounded-sm overflow-hidden" 
           style={{ backgroundColor: THEME.colors.bg, borderColor: THEME.colors.accent }}>
        
        {/* HEADER SECTION */}
        <div className="p-6 space-y-2" style={{ backgroundColor: THEME.colors.headerBg }}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex-1 space-y-1">
              <Input 
                value={summonData.name} 
                onChange={(e) => updateSummonData('name', e.target.value)}
                className="text-3xl font-black uppercase tracking-tighter bg-transparent border-0 p-0 h-auto focus-visible:ring-0 text-white"
                placeholder="CREATURE NAME"
              />
              <Input 
                value={summonData.type} 
                onChange={(e) => updateSummonData('type', e.target.value)}
                className="text-sm italic font-medium bg-transparent border-0 p-0 h-auto focus-visible:ring-0 text-white/70"
                placeholder="Creature Type (e.g. Medium Construct, Neutral)"
              />
            </div>
            
            <div className="flex gap-4 items-center flex-wrap">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-[14px] text-xs font-bold uppercase opacity-70 mb-1">
                    <Shield className="w-3 h-3 mr-1" /> AC
                </div>
                <Input 
                  value={summonData.ac} 
                  onChange={(e) => updateSummonData('ac', e.target.value)}
                  className="w-16 h-10 text-center font-black text-xl bg-black/20 border-accent/20 rounded vitals-input"
                />
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-[14px] text-xs font-bold uppercase opacity-70 mb-1">
                    <Heart className="w-3 h-3 mr-1" /> HP
                </div>
                <div className="flex items-center gap-1 bg-black/20 border border-accent/20 rounded p-1">
                    <Input 
                        value={summonData.hp} 
                        onChange={(e) => updateSummonData('hp', e.target.value)}
                        className="w-12 h-8 text-center font-black text-lg bg-transparent border-0 p-0 focus-visible:ring-0 vitals-input"
                    />
                    <span className="opacity-30">/</span>
                    <Input 
                        value={summonData.maxHp} 
                        onChange={(e) => updateSummonData('maxHp', e.target.value)}
                        className="w-12 h-8 text-center font-bold text-sm bg-transparent border-0 p-0 focus-visible:ring-0 opacity-70"
                    />
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-[14px] text-xs font-bold uppercase opacity-70 mb-1">
                    <Activity className="w-3 h-3 mr-1" /> Init
                </div>
                <Input 
                  value={summonData.initiative} 
                  onChange={(e) => updateSummonData('initiative', e.target.value)}
                  className="w-16 h-10 text-center font-black text-xl bg-black/20 border-accent/20 rounded vitals-input"
                />
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-[14px] text-xs font-bold uppercase opacity-70 mb-1">
                    <Zap className="w-3 h-3 mr-1" /> Speed
                </div>
                <Input 
                  value={summonData.speed} 
                  onChange={(e) => updateSummonData('speed', e.target.value)}
                  className="w-20 h-10 text-center font-bold text-sm bg-black/20 border-accent/20 rounded"
                />
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-[14px] mb-1">
                   <Input 
                        value={summonData.miscVitalLabel || 'Custom'} 
                        onChange={(e) => updateSummonData('miscVitalLabel', e.target.value)}
                        className="w-full bg-transparent border-0 p-0 text-[10px] uppercase text-center focus-visible:ring-0 font-bold opacity-70 h-full leading-none"
                    />
                </div>
                <Input 
                  value={summonData.miscVitalValue || ''} 
                  onChange={(e) => updateSummonData('miscVitalValue', e.target.value)}
                  className="w-20 h-10 text-center font-black text-xl bg-black/20 border-accent/20 rounded vitals-input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* STATS SECTION */}
        <div className="p-4 grid grid-cols-3 md:grid-cols-6 gap-2 border-t border-b border-accent/20 bg-black/5">
          {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as const).map(stat => {
            const mod = calculateModifier(summonData.stats[stat]);
            return (
              <div key={stat} className="flex flex-col items-center p-2 rounded hover:bg-black/10 transition-colors">
                <span className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: THEME.colors.statLabel }}>{stat}</span>
                <Input 
                  type="number"
                  value={summonData.stats[stat]}
                  onChange={(e) => handleStatChange(stat, e.target.value)}
                  className="w-12 h-8 text-center font-black text-lg bg-transparent border-0 p-0 focus-visible:ring-0"
                  style={{ color: THEME.colors.statValue }}
                />
                <span className="text-xs font-bold" style={{ color: THEME.colors.statMod }}>({mod >= 0 ? '+' : ''}{mod})</span>
              </div>
            );
          })}
        </div>

        {/* DETAILS SECTION (SAVES, SKILLS, SENSES, etc.) */}
        <div className="p-6 space-y-3 text-sm">
          {[
            { label: 'Saving Throws', field: 'saves' },
            { label: 'Skills', field: 'skills' },
            { label: 'Resistances', field: 'resistances' },
            { label: 'Immunities', field: 'immunities' },
            { label: 'Senses', field: 'senses' },
            { label: 'Languages', field: 'languages' },
          ].map(item => (
            <div key={item.field} className="flex gap-2 items-start border-b border-accent/10 pb-1">
              <span className="font-black uppercase text-[10px] tracking-wider pt-1 min-w-[100px]" style={{ color: THEME.colors.accent }}>{item.label}</span>
              <Input 
                value={(summonData as any)[item.field]} 
                onChange={(e) => updateSummonData(item.field as any, e.target.value)}
                className="flex-1 h-auto bg-transparent border-0 p-0 focus-visible:ring-0 text-white/90"
                placeholder={`None`}
              />
            </div>
          ))}
        </div>

        {/* TRAITS SECTION */}
        <div className="px-6 pb-6 space-y-4">
          <div className="flex items-center justify-between border-b-2 border-accent/40 pb-1">
            <h3 className="font-black uppercase text-xs tracking-[0.2em]" style={{ color: THEME.colors.sectionTitle }}>Traits</h3>
            <Button onClick={addTrait} variant="ghost" size="icon" className="h-6 w-6" style={{ backgroundColor: THEME.colors.btnBg }}>
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          <div className="space-y-4">
            {(Array.isArray(summonData.traits) ? summonData.traits : []).map(trait => {
              const isCollapsed = collapsedIds.has(trait.id);
              return (
                <div key={trait.id} className="group relative bg-black/10 p-3 rounded-lg border border-accent/5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1 cursor-pointer" onClick={() => toggleItemCollapse(trait.id)}>
                      {isCollapsed ? <ChevronRight className="w-3 h-3 opacity-50" /> : <ChevronDown className="w-3 h-3 opacity-50" />}
                      <Input 
                        value={trait.name} 
                        onChange={(e) => updateTrait(trait.id, 'name', e.target.value)}
                        className={`flex-1 font-black italic bg-transparent border-0 p-0 h-auto focus-visible:ring-0 text-white transition-opacity ${isCollapsed ? 'opacity-50' : 'opacity-100'}`}
                      />
                    </div>
                    <Button onClick={() => removeTrait(trait.id)} variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  </div>
                  {!isCollapsed && (
                    <Textarea 
                      value={trait.description} 
                      onChange={(e) => updateTrait(trait.id, 'description', e.target.value)}
                      className="min-h-[60px] text-sm bg-transparent border-0 p-0 focus-visible:ring-0 text-white/80 resize-none leading-relaxed"
                      placeholder="Trait description..."
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = target.scrollHeight + 'px';
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ACTIONS SECTIONS */}
        {[
          { id: 'actions', label: 'Actions', icon: Sword },
          { id: 'bonusActions', label: 'Bonus Actions', icon: Activity },
          { id: 'reactions', label: 'Reactions', icon: BookOpen }
        ].map(section => (
          <div key={section.id} className="px-6 pb-6 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-accent/40 pb-1">
              <div className="flex items-center gap-2">
                <section.icon className="w-4 h-4 opacity-50" />
                <h3 className="font-black uppercase text-xs tracking-[0.2em]" style={{ color: THEME.colors.sectionTitle }}>{section.label}</h3>
              </div>
              <Button onClick={() => addAction(section.id as any)} variant="ghost" size="icon" className="h-6 w-6" style={{ backgroundColor: THEME.colors.btnBg }}>
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            <div className="space-y-4">
              {(Array.isArray(summonData[section.id as 'actions' | 'bonusActions' | 'reactions']) ? summonData[section.id as 'actions' | 'bonusActions' | 'reactions'] : []).map(action => {
                const isCollapsed = collapsedIds.has(action.id);
                return (
                  <div key={action.id} className="group relative bg-black/15 p-3 rounded-lg border border-accent/10 hover:border-accent/20 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1 cursor-pointer" onClick={() => toggleItemCollapse(action.id)}>
                        {isCollapsed ? <ChevronRight className="w-3 h-3 opacity-50" /> : <ChevronDown className="w-3 h-3 opacity-50" />}
                        <Input 
                          value={action.name} 
                          onChange={(e) => updateAction(section.id as any, action.id, 'name', e.target.value)}
                          className={`flex-1 font-black italic bg-transparent border-0 p-0 h-auto focus-visible:ring-0 text-white text-lg transition-opacity ${isCollapsed ? 'opacity-50' : 'opacity-100'}`}
                          placeholder="Action Name..."
                        />
                      </div>
                      <Button onClick={() => removeAction(section.id as any, action.id)} variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    </div>
                    {!isCollapsed && (
                      <Textarea 
                        value={action.description} 
                        onChange={(e) => updateAction(section.id as any, action.id, 'description', e.target.value)}
                        className="min-h-[80px] text-base bg-transparent border-0 p-0 focus-visible:ring-0 text-white/90 resize-none leading-relaxed"
                        placeholder="Action description..."
                        onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = target.scrollHeight + 'px';
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
