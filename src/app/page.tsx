"use client";

import React, { useState, useRef, useEffect } from 'react';
import { CharacterProvider } from '@/contexts/CharacterContext';
import Header from '@/components/layout/Header';
import DiceRollerTab from '@/components/tabs/DiceRollerTab';
import SkillsTab from '@/components/tabs/SkillsTab';
import InventoryTab from '@/components/tabs/InventoryTab';
import CharacterTab from '@/components/tabs/CharacterTab';
import SpellsTab from '@/components/tabs/SpellsTab';
import RollResult from '@/components/dice/RollResult';
import HistoryPanel from '@/components/layout/HistoryPanel';
import CritFailFX from '@/components/shared/CritFailFX';
import type { RollResult as RollResultType, DiceCounts, RollMode, SkillBonus } from '@/lib/types';

export type ActiveTab = 'dice' | 'skills' | 'inventory' | 'character' | 'spells';

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dice');
  
  // Dice State
  const [counts, setCounts] = useState<DiceCounts>({ d4: 0, d6: 0, d8: 0, d10: 0, d12: 0, d20: 0, d100: 0 });
  const [modifier, setModifier] = useState(0);
  const [damageMod, setDamageMod] = useState(0);
  
  // Skill Bonus Dice State
  const [skillBonuses, setSkillBonuses] = useState<SkillBonus>({ d4: false, d6: false, d8: false, d10: false, d12: false });
  
  // Result State
  const [result, setResult] = useState<RollResultType | null>(null);
  const [history, setHistory] = useState<RollResultType[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [rollMode, setRollMode] = useState<RollMode>('normal');
  const [specialEffect, setSpecialEffect] = useState<'crit' | 'fail' | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (specialEffect) {
      const timer = setTimeout(() => setSpecialEffect(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [specialEffect]);

  useEffect(() => {
    if (result && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [result]);
  
  const TABS: Record<ActiveTab, React.ReactNode> = {
    dice: <DiceRollerTab
      counts={counts}
      setCounts={setCounts}
      modifier={modifier}
      setModifier={setModifier}
      damageMod={damageMod}
      setDamageMod={setDamageMod}
      rollMode={rollMode}
      setRollMode={setRollMode}
      isRolling={isRolling}
      setIsRolling={setIsRolling}
      setResult={setResult}
      setHistory={setHistory}
      setSpecialEffect={setSpecialEffect}
      result={result}
    />,
    skills: <SkillsTab 
      rollMode={rollMode}
      setRollMode={setRollMode}
      isRolling={isRolling}
      setIsRolling={setIsRolling}
      setResult={setResult}
      setHistory={setHistory}
      setSpecialEffect={setSpecialEffect}
      skillBonuses={skillBonuses}
      setSkillBonuses={setSkillBonuses}
      setCounts={setCounts}
      setModifier={setModifier}
    />,
    inventory: <InventoryTab />,
    character: <CharacterTab />,
    spells: <SpellsTab />,
  };
  
  return (
    <CharacterProvider>
      <div className={`min-h-screen font-sans pb-20 transition-colors duration-500
        ${specialEffect === 'crit' ? 'bg-slate-950' : specialEffect === 'fail' ? 'bg-red-950/30' : 'bg-background'}`}>
        
        <CritFailFX specialEffect={specialEffect} />

        <Header activeTab={activeTab} setActiveTab={setActiveTab} setShowHistory={setShowHistory} />
        
        <main className={`max-w-5xl mx-auto p-4 sm:p-6 space-y-6 ${specialEffect === 'fail' ? 'animate-shake' : ''}`}>
          {TABS[activeTab]}
          {result && ['dice', 'skills'].includes(activeTab) && (
            <div ref={resultsRef}>
              <RollResult result={result} specialEffect={specialEffect} />
            </div>
          )}
        </main>
        
        <HistoryPanel history={history} showHistory={showHistory} setShowHistory={setShowHistory} />
      </div>
    </CharacterProvider>
  );
}
