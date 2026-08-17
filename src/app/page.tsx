"use client";

import React, { useState, useRef, useEffect } from 'react';
import Header from '@/components/layout/Header';
import DiceRollerTab from '@/components/tabs/DiceRollerTab';
import SkillsTab from '@/components/tabs/SkillsTab';
import InventoryTab from '@/components/tabs/InventoryTab';
import CharacterTab from '@/components/tabs/CharacterTab';
import SpellsTab from '@/components/tabs/SpellsTab';
import HomeTab from '@/components/tabs/HomeTab';
import SummonTab from '@/components/tabs/SummonTab';
import RollResult from '@/components/dice/RollResult';
import HistoryPanel from '@/components/layout/HistoryPanel';
import CritFailFX from '@/components/shared/CritFailFX';
import { useCharacter } from '@/contexts/CharacterContext';
import type { RollResult as RollResultType, DiceCounts, RollMode, SkillBonus, ActiveTab } from '@/lib/types';

export default function Home() {
  const { 
    charInfo, 
    rollMode, setRollMode,
    activeTab, setActiveTab,
    result, isRolling, history, specialEffect, setResult, setSpecialEffect
  } = useCharacter();
  
  // Skill Bonus Dice State (Keep local or move to context? Context already has hitBonuses/damageBonuses but SkillsTab used its own)
  // Let's keep it for now as it seems specific to SkillsTab in the original code, 
  // though CharacterContext also has hitBonuses/damageBonuses.
  const [skillBonuses, setSkillBonuses] = useState<SkillBonus>({ d4: false, d6: false, d8: false, d10: false, d12: false });
  
  const [showHistory, setShowHistory] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  // AUTOMATIC POISON -> DISADVANTAGE LINK
  useEffect(() => {
    if (charInfo.isPoisoned) {
      setRollMode('disadvantage');
    }
  }, [charInfo.isPoisoned, setRollMode]);

  useEffect(() => {
    if (result && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [result]);
  
  const TABS: Record<ActiveTab, React.ReactNode> = {
    home: <HomeTab />,
    dice: <DiceRollerTab />,
    skills: <SkillsTab 
      skillBonuses={skillBonuses}
      setSkillBonuses={setSkillBonuses}
    />,
    inventory: <InventoryTab />,
    character: <CharacterTab />,
    spells: <SpellsTab />,
    summon: <SummonTab />,
  };
  
  return (
    <div className={`min-h-screen font-sans pb-20 transition-colors duration-500`}
      style={{
        backgroundColor: (specialEffect === 'crit' && activeTab === 'dice') ? 'color-mix(in srgb, var(--color-crit), transparent 90%)' : 
                         (specialEffect === 'fail' && activeTab === 'dice') ? 'color-mix(in srgb, var(--color-fail), transparent 90%)' : 
                         'rgb(var(--background))'
      }}>
      
      {activeTab === 'dice' && <CritFailFX specialEffect={specialEffect} />}

      <Header activeTab={activeTab} setActiveTab={setActiveTab} setShowHistory={setShowHistory} />
      
      <main className={`max-w-5xl mx-auto p-4 sm:p-6 space-y-6 ${specialEffect === 'fail' ? 'animate-shake' : ''}`}>
        {TABS[activeTab]}
        {result && ['dice', 'skills', 'summon'].includes(activeTab) && (
          <div ref={resultsRef}>
            <RollResult 
              result={result} 
              specialEffect={specialEffect} 
              activeTab={activeTab} 
              onClose={() => { setResult(null); setSpecialEffect(null); }}
            />
          </div>
        )}
      </main>
      
      <HistoryPanel history={history} showHistory={showHistory} setShowHistory={setShowHistory} />
    </div>
  );
}
