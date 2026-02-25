"use client";

import { Dices, History } from 'lucide-react';
import type { ActiveTab } from '@/app/page';
import TabButton from '@/components/shared/TabButton';
import { Button } from '@/components/ui/button';

type HeaderProps = {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  setShowHistory: (show: boolean) => void;
};

const TABS: { id: ActiveTab; label: string }[] = [
    { id: 'dice', label: 'Dice' },
    { id: 'skills', label: 'Skills' },
    { id: 'inventory', label: 'Inv' },
    { id: 'character', label: 'Char' },
    { id: 'spells', label: 'Spells' },
];

export default function Header({ activeTab, setActiveTab, setShowHistory }: HeaderProps) {
  return (
    <header className="bg-card/50 backdrop-blur-sm border-b border-border p-3 shadow-lg sticky top-0 z-40">
      <div className="max-w-5xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-lg">
            <Dices className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent hidden sm:block font-headline">
            Adventurer's Tome
          </h1>
        </div>
        
        <div className="flex bg-background p-1 rounded-lg border border-border">
            {TABS.map(tab => (
                <TabButton 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    isActive={activeTab === tab.id}
                >
                    {tab.label}
                </TabButton>
            ))}
        </div>

        <Button 
            onClick={() => setShowHistory(true)} 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-foreground"
            aria-label="Show roll history"
        >
            <History className="w-6 h-6" />
        </Button>
      </div>
    </header>
  );
}
