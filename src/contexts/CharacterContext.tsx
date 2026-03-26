"use client";

import React, { createContext, useState, useContext, useRef, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import type { Stats, CharInfo, Currency, Consumable, EquipmentItem, InventoryItem, UntrackedItem, Spell, SpellSlots, Stat } from '@/lib/types';
import { saveCharacterToCloud, loadCharacterFromCloud } from '../lib/cloudSync';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
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
  inventoryItems: InventoryItem[];
  addInventoryItem: () => void;
  updateInventoryItem: (id: number, field: keyof InventoryItem, value: any) => void;
  removeInventoryItem: (id: number) => void;
  bagItems: InventoryItem[]; // EFFECT: Items stored specifically in the Bag of Holding
  addBagItem: () => void;
  updateBagItem: (id: number, field: keyof InventoryItem, value: any) => void;
  removeBagItem: (id: number) => void;
  notes: string;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
  consumables: Consumable[];
  addConsumable: () => void;
  updateConsumable: (id: number, field: keyof Consumable, value: any) => void;
  removeConsumable: (id: number) => void;
  equipmentItems: EquipmentItem[];
  addEquipmentItem: () => void;
  updateEquipmentItem: (id: number, field: keyof EquipmentItem, value: any) => void;
  removeEquipmentItem: (id: number) => void;
  untrackedItems: UntrackedItem[];
  addUntrackedItem: () => void;
  updateUntrackedItem: (id: number, name: string) => void;
  removeUntrackedItem: (id: number) => void;
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
  doubleCarry: boolean; // EFFECT: State for doubling carry capacity (Powerful Build, Enhancements)
  setDoubleCarry: React.Dispatch<React.SetStateAction<boolean>>;
  handleExport: () => void;
  handleImportClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleCloudSave: () => Promise<void>;
  handleCloudLoad: () => Promise<void>;
  user: User | null;
  handleSignIn: () => Promise<void>;
  handleSignOut: () => Promise<void>;
};

const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

export const CharacterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast({ title: "Signed In", description: "You are now securely connected to the cloud." });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Sign In Failed", description: "Failed to authenticate with Google." });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({ title: "Signed Out", description: "You have been logged out." });
    } catch (error) {
      toast({ variant: "destructive", title: "Sign Out Failed", description: "Could not log out." });
    }
  };

  const [characterName, setCharacterName] = useState('');
  const [stats, setStats] = useState<Stats>({ str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 });
  const [pb, setPb] = useState(2);
  const [profs, setProfs] = useState(new Set<string>());

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [bagItems, setBagItems] = useState<InventoryItem[]>([]); // DEFAULT: Empty Bag of Holding
  const [notes, setNotes] = useState('');
  const [consumables, setConsumables] = useState<Consumable[]>([]);
  const [equipmentItems, setEquipmentItems] = useState<EquipmentItem[]>([]);
  const [untrackedItems, setUntrackedItems] = useState<UntrackedItem[]>([]);
  const [currency, setCurrency] = useState<Currency>({ cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 });
  const [charInfo, setCharInfo] = useState<CharInfo>({ race: '', class: '', level: 1, class2: '', level2: '', background: '', alignment: '', xp: 0, feats: '' });
  const [spellAbility, setSpellAbility] = useState<Stat>('int');
  const [doubleCarry, setDoubleCarry] = useState(false); // DEFAULT: Standard 15x carry rules

  const [spellSlots, setSpellSlots] = useState<SpellSlots>({
    '1': { max: 0, slots: [] },
    '2': { max: 0, slots: [] },
    '3': { max: 0, slots: [] },
    '4': { max: 0, slots: [] },
    '5': { max: 0, slots: [] },
    '6': { max: 0, slots: [] },
    '7': { max: 0, slots: [] },
    '8': { max: 0, slots: [] },
    '9': { max: 0, slots: [] },
  });
  const [spells, setSpells] = useState<Spell[]>([]);

  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('dnd_character_data');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        if (data.characterName !== undefined) setCharacterName(data.characterName);
        if (data.charInfo) setCharInfo(prev => ({ ...prev, ...data.charInfo }));
        if (data.stats) setStats(data.stats);
        if (data.pb) setPb(data.pb);
        if (data.notes !== undefined) setNotes(data.notes);
        if (data.inventoryItems !== undefined) setInventoryItems(data.inventoryItems);
        if (data.bagItems !== undefined) setBagItems(data.bagItems);
        if (data.currency) setCurrency(data.currency);
        if (data.consumables && Array.isArray(data.consumables)) setConsumables(data.consumables);
        if (data.equipmentItems && Array.isArray(data.equipmentItems)) setEquipmentItems(data.equipmentItems);
        if (data.untrackedItems && Array.isArray(data.untrackedItems)) setUntrackedItems(data.untrackedItems);
        if (data.spellAbility) setSpellAbility(data.spellAbility);
        if (data.doubleCarry !== undefined) setDoubleCarry(data.doubleCarry);
        if (data.spellSlots) setSpellSlots(data.spellSlots);
        if (data.spells && Array.isArray(data.spells)) setSpells(data.spells);
        if (data.profs && Array.isArray(data.profs)) setProfs(new Set(data.profs));
      } catch (error) {
        console.error("Error loading from localStorage:", error);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to LocalStorage on state change
  useEffect(() => {
    if (!isLoaded) return;

    const data = {
      characterName, charInfo, stats, pb, notes, inventoryItems, bagItems, consumables, equipmentItems, untrackedItems, currency,
      spellAbility, spellSlots, spells, doubleCarry, profs: Array.from(profs)
    };
    
    localStorage.setItem('dnd_character_data', JSON.stringify(data));
  }, [
    isLoaded, characterName, charInfo, stats, pb, notes, inventoryItems, bagItems, consumables, 
    equipmentItems, untrackedItems, currency, spellAbility, spellSlots, spells, doubleCarry, profs
  ]);

  const updateStat = (stat: Stat, val: number) => setStats(prev => ({ ...prev, [stat]: val || 0 }));
  const updateCharInfo = (field: keyof CharInfo, val: any) => setCharInfo(prev => ({ ...prev, [field]: val }));
  const toggleProficiency = (skillName: string) => {
    setProfs(prev => {
      const newProfs = new Set(prev);
      newProfs.has(skillName) ? newProfs.delete(skillName) : newProfs.add(skillName);
      return newProfs;
    });
  };

  const addInventoryItem = () => setInventoryItems(prev => [...prev, { id: Date.now(), name: '', weight: 0 }]);
  const updateInventoryItem = (id: number, field: keyof InventoryItem, value: any) => {
    setInventoryItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };
  const removeInventoryItem = (id: number) => setInventoryItems(prev => prev.filter(item => item.id !== id));

  const addBagItem = () => setBagItems(prev => [...prev, { id: Date.now(), name: '', weight: 0 }]);
  const updateBagItem = (id: number, field: keyof InventoryItem, value: any) => {
    setBagItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };
  const removeBagItem = (id: number) => setBagItems(prev => prev.filter(item => item.id !== id));

  const addConsumable = () => setConsumables(prev => [...prev, { id: Date.now(), name: '', count: 1, weight: 0 }]);
  const updateConsumable = (id: number, field: keyof Consumable, value: any) => {
    setConsumables(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };
  const removeConsumable = (id: number) => setConsumables(prev => prev.filter(item => item.id !== id));

  const addEquipmentItem = () => setEquipmentItems(prev => [...prev, { id: Date.now(), name: '', weight: 0, isWearing: false }]);
  const updateEquipmentItem = (id: number, field: keyof EquipmentItem, value: any) => {
    setEquipmentItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };
  const removeEquipmentItem = (id: number) => setEquipmentItems(prev => prev.filter(item => item.id !== id));

  const addUntrackedItem = () => setUntrackedItems(prev => [...prev, { id: Date.now(), name: '' }]);
  const updateUntrackedItem = (id: number, name: string) => {
    setUntrackedItems(prev => prev.map(item => item.id === id ? { ...item, name } : item));
  };
  const removeUntrackedItem = (id: number) => setUntrackedItems(prev => prev.filter(item => item.id !== id));

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

  const handleCloudSave = async () => {
    console.log("Starting cloud save process...");
    if (!user) {
      toast({ variant: "destructive", title: "Wait", description: "You must be signed in to save characters." });
      return;
    }
    if (!characterName.trim()) {
      console.log("No character name provided.");
      toast({ variant: "destructive", title: "Error", description: "Character must have a name to save to the cloud." });
      return;
    }
    const data = {
      characterName, charInfo, stats, pb, notes, inventoryItems, bagItems, consumables, equipmentItems, untrackedItems, currency,
      spellAbility, spellSlots, spells, doubleCarry, profs: Array.from(profs)
    };
    try {
      const safeName = characterName.trim().replace(/[^a-z0-9]/gi, '-').toLowerCase();
      console.log("Saving character as:", `char-${safeName}`, "Data:", data);
      await saveCharacterToCloud(user.uid, `char-${safeName}`, data);
      console.log("Cloud save promise resolved!");
      toast({ title: "Cloud Save Successful", description: "Character backed up securely to your account." });
    } catch (error) {
      console.error("Caught error in handleCloudSave:", error);
      toast({ variant: "destructive", title: "Cloud Save Failed", description: "Could not write to Firebase database." });
    }
  };

  const handleCloudLoad = async () => {
    if (!user) {
      toast({ variant: "destructive", title: "Wait", description: "You must be signed in to load characters." });
      return;
    }
    if (!characterName.trim()) {
      toast({ variant: "destructive", title: "Wait", description: "Please enter the exact Character Name you used to save." });
      return;
    }
    const safeName = characterName.trim().replace(/[^a-z0-9]/gi, '-').toLowerCase();
    try {
      const data = await loadCharacterFromCloud(user.uid, `char-${safeName}`);
      if (!data) {
        toast({ variant: "destructive", title: "Not Found", description: "No character found in the cloud with this name." });
        return;
      }
      
      if (data.characterName !== undefined) setCharacterName(data.characterName);
      if (data.charInfo) setCharInfo(prev => ({ ...prev, ...data.charInfo }));
      if (data.stats) setStats(data.stats);
      if (data.pb) setPb(data.pb);
      if (data.notes !== undefined) setNotes(data.notes);
      if (data.inventoryItems !== undefined) setInventoryItems(data.inventoryItems);
      if (data.bagItems !== undefined) setBagItems(data.bagItems);
      if (data.currency) setCurrency(data.currency);
      if (data.consumables && Array.isArray(data.consumables)) setConsumables(data.consumables);
      if (data.equipmentItems && Array.isArray(data.equipmentItems)) setEquipmentItems(data.equipmentItems);
      if (data.untrackedItems && Array.isArray(data.untrackedItems)) setUntrackedItems(data.untrackedItems);
      if (data.spellAbility) setSpellAbility(data.spellAbility);
      if (data.doubleCarry !== undefined) setDoubleCarry(data.doubleCarry);
      
      if (data.spellSlots) setSpellSlots(data.spellSlots);
      if (data.spells && Array.isArray(data.spells)) setSpells(data.spells);
      if (data.profs && Array.isArray(data.profs)) setProfs(new Set(data.profs));

      toast({ title: "Cloud Load Successful", description: "Character data restored from Firestore." });
    } catch (error) {
      toast({ variant: "destructive", title: "Cloud Load Failed", description: "Could not pull from Firebase." });
    }
  };

  const handleExport = () => {
    const data = {
      characterName, charInfo, stats, pb, notes, inventoryItems, bagItems, consumables, equipmentItems, untrackedItems, currency,
      spellAbility, spellSlots, spells, doubleCarry, profs: Array.from(profs)
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
        if (data.notes !== undefined) setNotes(data.notes);
        if (data.inventoryItems !== undefined) setInventoryItems(data.inventoryItems);
        if (data.bagItems !== undefined) setBagItems(data.bagItems);
        if (data.currency) setCurrency(data.currency);
        if (data.consumables && Array.isArray(data.consumables)) setConsumables(data.consumables);
        if (data.equipmentItems && Array.isArray(data.equipmentItems)) setEquipmentItems(data.equipmentItems);
        if (data.untrackedItems && Array.isArray(data.untrackedItems)) setUntrackedItems(data.untrackedItems);
        if (data.spellAbility) setSpellAbility(data.spellAbility);
        if (data.doubleCarry !== undefined) setDoubleCarry(data.doubleCarry);

        if (data.spellSlots) {
          setSpellSlots(data.spellSlots);
        }

        if (data.spells && Array.isArray(data.spells)) setSpells(data.spells);
        if (data.profs && Array.isArray(data.profs)) setProfs(new Set(data.profs));

        if (e.target) e.target.value = '';
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
    charInfo, updateCharInfo, inventoryItems, addInventoryItem, updateInventoryItem, removeInventoryItem,
    bagItems, addBagItem, updateBagItem, removeBagItem,
    notes, setNotes, consumables, addConsumable,
    updateConsumable, removeConsumable, equipmentItems, addEquipmentItem,
    updateEquipmentItem, removeEquipmentItem, untrackedItems, addUntrackedItem,
    updateUntrackedItem, removeUntrackedItem, currency, updateCurrency, spellAbility, setSpellAbility,
    spellSlots, updateSpellSlotMax, toggleSpellSlot, longRest, spells, addSpell, removeSpell,
    doubleCarry, setDoubleCarry, handleExport, handleImportClick, fileInputRef,
    handleCloudSave, handleCloudLoad, user, handleSignIn, handleSignOut
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
