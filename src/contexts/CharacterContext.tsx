"use client";

import React, { createContext, useState, useContext, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import type { Stats, CharInfo, Currency, Consumable, Spell, SpellSlots, Stat, SpellSlotState } from '@/lib/types';

type CharacterContextType = {
  characterName: string;
  setCharacterName: React.Dispatch<React.SetStateAction<string>>;
  stats: Stats;
  updateStat: (stat: Stat, value: number) => void;
  pb: number;
  setPb: React.Dispatch<React.SetStateAction<number>>;
  profs: Set<string>;
  toggleProficiency: (skillName: string) => void;
  charInfo: CharInfo;
  updateCharInfo: (field: keyof CharInfo, value: any) => void;
  inventory: string;
  setInventory: React.Dispatch<React.SetStateAction<string>>;
  consumables: Consumable[];
  addConsumable: () => void;
  updateConsumable: (id: number, field: keyof Consumable, value: any) => void;
  removeConsumable: (id: number) => void;
  currency: Currency;
  updateCurrency: (type: keyof Currency, value: number) => void;
  spellAbility: Stat;
  setSpellAbility: React.Dispatch<React.SetStateAction<Stat>>;
  spellSlots: SpellSlots;
  updateSpellSlotMax: (level: string, max: number) => void;
  toggleSpellSlot: (level: string, slotIndex: number) => void;
  longRest: () => void;
  spells: Spell[];
  addSpell: (name: string, level: number) => void;
  removeSpell: (id: number) => void;
  handleExport: () => void;
  handleImportClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
};

const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

export const CharacterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [characterName, setCharacterName] = useState('');
  const [stats, setStats] = useState<Stats>({ str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 });
  const [pb, setPb] = useState(2);
  const [profs, setProfs] = useState(new Set<string>());
  const [inventory, setInventory] = useState('');
  const [consumables, setConsumables] = useState<Consumable[]>([]);
  const [currency, setCurrency] = useState<Currency>({ cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 });
  const [charInfo, setCharInfo] = useState<CharInfo>({ race: '', class: '', level: 1, class2: '', level2: '', background: '', alignment: '', xp: 0, feats: '' });
  const [spellAbility, setSpellAbility] = useState<Stat>('int');
  const [spellSlots, setSpellSlots] = useState<SpellSlots>({
    '1': { max: 4, slots: Array(4).fill(false) },
    '2': { max: 3, slots: Array(3).fill(false) },
    '3': { max: 0, slots: [] },
    '4': { max: 0, slots: [] },
    '5': { max: 0, slots: [] },
    '6': { max: 0, slots: [] },
    '7': { max: 0, slots: [] },
    '8': { max: 0, slots: [] },
    '9': { max: 0, slots: [] },
  });
  const [spells, setSpells] = useState<Spell[]>([]);

  const updateStat = (stat: Stat, val: number) => setStats(prev => ({ ...prev, [stat]: val || 0 }));
  const updateCharInfo = (field: keyof CharInfo, val: any) => setCharInfo(prev => ({ ...prev, [field]: val }));
  const toggleProficiency = (skillName: string) => {
    setProfs(prev => {
      const newProfs = new Set(prev);
      newProfs.has(skillName) ? newProfs.delete(skillName) : newProfs.add(skillName);
      return newProfs;
    });
  };

  const addConsumable = () => setConsumables(prev => [...prev, { id: Date.now(), name: '', count: 1 }]);
  const updateConsumable = (id: number, field: keyof Consumable, value: any) => {
    setConsumables(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };
  const removeConsumable = (id: number) => setConsumables(prev => prev.filter(item => item.id !== id));
  const updateCurrency = (type: keyof Currency, value: number) => {
    setCurrency(prev => ({ ...prev, [type]: Math.max(0, value || 0) }));
  };
  
  const addSpell = (name: string, level: number) => {
    if (!name.trim()) return;
    setSpells(prev => [...prev, { id: Date.now(), name, level }].sort((a, b) => a.level - b.level || a.name.localeCompare(b.name)));
  };
  const removeSpell = (id: number) => setSpells(prev => prev.filter(s => s.id !== id));
  
  const updateSpellSlotMax = (level: string, max: number) => {
    const newMax = Math.max(0, max || 0);
    setSpellSlots(prev => {
      const currentSlots = prev[level]?.slots || [];
      const newSlots = Array(newMax);
      for (let i = 0; i < newMax; i++) {
        newSlots[i] = !!currentSlots[i];
      }
      return {
        ...prev,
        [level]: {
          max: newMax,
          slots: newSlots,
        }
      };
    });
  };

  const toggleSpellSlot = (level: string, slotIndex: number) => {
    setSpellSlots(prev => {
      const newSlots = [...prev[level].slots];
      if (newSlots[slotIndex] !== undefined) {
        newSlots[slotIndex] = !newSlots[slotIndex];
      }
      return {
        ...prev,
        [level]: {
          ...prev[level],
          slots: newSlots
        }
      };
    });
  };
  
  const longRest = () => {
    setSpellSlots(prev => {
      const reset = { ...prev };
      Object.keys(reset).forEach(lvl => {
        reset[lvl] = {
          ...reset[lvl],
          slots: Array(reset[lvl].max).fill(false)
        };
      });
      return reset;
    });
    toast({ title: "Long Rest", description: "Spell slots have been restored." });
  };

  const handleExport = () => {
    const data = {
      characterName, charInfo, stats, pb, inventory, consumables, currency,
      spellAbility, spellSlots, spells, profs: Array.from(profs)
    };
    const safeName = characterName.trim().replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'character';
    const filename = `adventurers-tome-${safeName}.json`;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Character Exported", description: `${filename} has been saved.` });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.characterName !== undefined) setCharacterName(data.characterName);
        if (data.charInfo) setCharInfo(prev => ({ ...prev, ...data.charInfo }));
        if (data.stats) setStats(data.stats);
        if (data.pb) setPb(data.pb);
        if (data.inventory !== undefined) setInventory(data.inventory);
        if (data.currency) setCurrency(data.currency);
        if (data.consumables && Array.isArray(data.consumables)) setConsumables(data.consumables);
        if (data.spellAbility) setSpellAbility(data.spellAbility);
        
        if (data.spellSlots) {
          const importedSlots = data.spellSlots;
          const firstLevelKey = Object.keys(importedSlots)[0];
          // Convert old format if necessary
          if (firstLevelKey && importedSlots[firstLevelKey].hasOwnProperty('used')) {
            const convertedSlots: SpellSlots = {};
            for (const level in importedSlots) {
              if (importedSlots.hasOwnProperty(level)) {
                const { max, used } = importedSlots[level];
                const newSlots = Array(max).fill(false);
                for (let i = 0; i < used; i++) {
                  newSlots[i] = true; // Mark as used
                }
                convertedSlots[level] = { max, slots: newSlots };
              }
            }
            setSpellSlots(convertedSlots);
          } else {
            setSpellSlots(importedSlots);
          }
        }

        if (data.spells && Array.isArray(data.spells)) setSpells(data.spells);
        if (data.profs && Array.isArray(data.profs)) setProfs(new Set(data.profs));
        
        if(e.target) e.target.value = '';
        toast({ title: "Import Successful", description: "Character data has been loaded." });
      } catch (error) {
        console.error("Error importing character:", error);
        toast({ variant: "destructive", title: "Import Failed", description: "The selected file is invalid." });
      }
    };
    reader.readAsText(file);
  };
  
  const handleImportClick = () => fileInputRef.current?.click();

  const value = {
    characterName, setCharacterName, stats, updateStat, pb, setPb, profs, toggleProficiency,
    charInfo, updateCharInfo, inventory, setInventory, consumables, addConsumable,
    updateConsumable, removeConsumable, currency, updateCurrency, spellAbility, setSpellAbility,
    spellSlots, updateSpellSlotMax, toggleSpellSlot, longRest, spells, addSpell, removeSpell,
    handleExport, handleImportClick, fileInputRef
  };

  return (
    <CharacterContext.Provider value={value}>
      {children}
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
    </CharacterContext.Provider>
  );
};

export const useCharacter = () => {
  const context = useContext(CharacterContext);
  if (context === undefined) {
    throw new Error('useCharacter must be used within a CharacterProvider');
  }
  return context;
};
