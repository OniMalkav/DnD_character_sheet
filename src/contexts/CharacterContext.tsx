"use client";

import React, { createContext, useState, useContext, useRef, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
import type { Stats, CharInfo, Currency, Consumable, EquipmentItem, InventoryItem, UntrackedItem, Spell, SpellSlots, Stat, DiceCounts, RollMode, SkillBonus, Feat } from '@/lib/types';
import { saveCharacterToCloud, loadCharacterFromCloud, listCharactersFromCloud } from '../lib/cloudSync';
import { auth } from '../lib/firebase';

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
  featsList: Feat[];
  addFeat: () => void;
  updateFeat: (id: number, field: keyof Feat, value: any) => void;
  removeFeat: (id: number) => void;
  moveFeat: (id: number, direction: 'up' | 'down') => void;
  currency: Currency;
  updateCurrency: (type: keyof Currency, value: number) => void;
  spellAbility: Stat;
  setSpellAbility: React.Dispatch<React.SetStateAction<Stat>>;
  spellSlots: SpellSlots;
  updateSpellSlotMax: (level: string, max: number) => void;
  toggleSpellSlot: (level: string, slotIndex: number) => void;
  shortRest: () => void;
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
  
  // GLOBAL DICE STATE (Cross-tab sync)
  counts: DiceCounts;
  setCounts: React.Dispatch<React.SetStateAction<DiceCounts>>;
  modifier: number;
  setModifier: React.Dispatch<React.SetStateAction<number>>;
  damageMod: number;
  setDamageMod: React.Dispatch<React.SetStateAction<number>>;
  rollMode: RollMode;
  setRollMode: React.Dispatch<React.SetStateAction<RollMode>>;
  
  hitBonuses: SkillBonus;
  setHitBonuses: React.Dispatch<React.SetStateAction<SkillBonus>>;
  damageBonuses: SkillBonus;
  setDamageBonuses: React.Dispatch<React.SetStateAction<SkillBonus>>;

  // ROLL STATE
  isRolling: boolean;
  setIsRolling: React.Dispatch<React.SetStateAction<boolean>>;
  result: RollResult | null;
  setResult: React.Dispatch<React.SetStateAction<RollResult | null>>;
  history: RollResult[];
  setHistory: React.Dispatch<React.SetStateAction<RollResult[]>>;
  specialEffect: 'crit' | 'fail' | null;
  setSpecialEffect: React.Dispatch<React.SetStateAction<'crit' | 'fail' | null>>;
  activeTab: ActiveTab;
  setActiveTab: React.Dispatch<React.SetStateAction<ActiveTab>>;

  triggerRoll: (customCounts?: Partial<DiceCounts>, customMod?: number, customDmgMod?: number, label?: string, rollType?: 'check' | 'save' | 'attack') => void;

  cloudCharacters: { id: string, name: string }[];
  refreshCloudList: () => Promise<void>;
  loadCharacterById: (id: string) => Promise<void>;
  resetCharacter: () => void;
  summonData: SummonStatblock;
  updateSummonData: (field: keyof SummonStatblock, value: any) => void;
  setSummonData: React.Dispatch<React.SetStateAction<SummonStatblock>>;
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
  
  // GLOBAL DICE STATE
  const [counts, setCounts] = useState<DiceCounts>({ d4: 0, d6: 0, d8: 0, d10: 0, d12: 0, d20: 0, d100: 0 });
  const [modifier, setModifier] = useState(0);
  const [damageMod, setDamageMod] = useState(0);
  const [rollMode, setRollMode] = useState<RollMode>('normal');

  const [hitBonuses, setHitBonuses] = useState<SkillBonus>({ d4: false, d6: false, d8: false, d10: false, d12: false });
  const [damageBonuses, setDamageBonuses] = useState<SkillBonus>({ d4: false, d6: false, d8: false, d10: false, d12: false });

  // ROLL STATE
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<RollResult | null>(null);
  const [history, setHistory] = useState<RollResult[]>([]);
  const [specialEffect, setSpecialEffect] = useState<'crit' | 'fail' | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');

  const rollD20 = (mode: RollMode) => {
    const r1 = Math.floor(Math.random() * 20) + 1;
    if (mode === 'normal') {
      return { value: r1, isCrit: r1 === 20, isFumble: r1 === 1, details: `[${r1}]` };
    }
    const r2 = Math.floor(Math.random() * 20) + 1;
    const kept = mode === 'advantage' ? Math.max(r1, r2) : Math.min(r1, r2);
    const dropped = mode === 'advantage' ? Math.min(r1, r2) : Math.max(r1, r2);
    const modeTag = mode === 'advantage' ? 'ADV' : 'DIS';
    return { 
      value: kept, 
      dropped, 
      isCrit: kept === 20, 
      isFumble: kept === 1, 
      details: `${modeTag}:[${kept}] drop:[${dropped}]`
    };
  };

  const triggerRoll = (customCounts?: Partial<DiceCounts>, customMod?: number, customDmgMod?: number, label?: string, rollType?: 'check' | 'save' | 'attack') => {
    // 1. Prepare the effective parameters
    const effectiveCounts = { ...counts, ...(customCounts || {}) };
    const effectiveMod = customMod !== undefined ? customMod : modifier;
    const effectiveDmgMod = customDmgMod !== undefined ? customDmgMod : damageMod;

    const totalDice = Object.values(effectiveCounts).reduce((a, b) => a + b, 0);
    if (totalDice === 0) return;

    setIsRolling(true);
    setResult(null);
    setSpecialEffect(null);

    // Update context state if custom values were provided (to sync UI)
    if (customCounts) setCounts(prev => ({ ...prev, ...customCounts }));
    if (customMod !== undefined) setModifier(customMod);
    if (customDmgMod !== undefined) setDamageMod(customDmgMod);

    setTimeout(() => {
      let breakdown: any = {};
      let rollDetails: string[] = [];
      let hasNat20 = false, hasNat1 = false;
      let d20Sum = 0, damageSum = 0, d20Count = effectiveCounts.d20;
      const attacks: any[] = [];

      const isCheckOrSave = rollType === 'check' || rollType === 'save' || label?.toLowerCase().includes('check') || label?.toLowerCase().includes('save') || label?.toLowerCase().includes('throw');
      const isAttack = !isCheckOrSave && (rollType === 'attack' || (effectiveCounts.d20 > 1) || label?.toLowerCase().includes('attack'));

      const isMultiAttack = d20Count > 1;
      let hitBonusTotal = 0;
      let dmgBonusTotal = 0;

      if (isMultiAttack) {
        let totalMultiDamage = 0;
        let hitsCount = 0;
        for (let i = 0; i < d20Count; i++) {
          const d20Result = rollD20(rollMode);
          const isCrit = d20Result.isCrit && !isCheckOrSave;
          const isFumble = d20Result.isFumble;
          let attackDiceTotal = 0;
          let attackDamageDetails: string[] = [];
          let attackHitDetails: string[] = [];

          let currentHitBonus = 0;
          let currentDmgBonus = 0;

          Object.entries(effectiveCounts).forEach(([die, count]) => {
            if (die !== 'd20' && count > 0) {
              const sides = parseInt(die.substring(1));
              const rolls = [];
              const effectiveCount = isCrit ? count * 2 : count;
              for (let j = 0; j < effectiveCount; j++) {
                const r = Math.floor(Math.random() * sides) + 1;
                rolls.push(r);
                attackDiceTotal += r;
              }
              attackDamageDetails.push(`${die}:[${rolls.join(',')}]`);
            }
          });
          
          Object.entries(hitBonuses).forEach(([die, active]) => {
            if (active) {
              const sides = parseInt(die.substring(1));
              const r = Math.floor(Math.random() * sides) + 1;
              currentHitBonus += r;
              hitBonusTotal += r;
              attackHitDetails.push(`${r}(${die})`);
            }
          });

          Object.entries(damageBonuses).forEach(([die, active]) => {
            if (active) {
              const sides = parseInt(die.substring(1));
              const r = Math.floor(Math.random() * sides) + 1;
              currentDmgBonus += r;
              dmgBonusTotal += r;
              attackDamageDetails.push(`${r}(${die} dmg)`);
            }
          });

          const attackTotalDamage = attackDiceTotal + effectiveDmgMod + currentDmgBonus;
          attacks.push({
            hit: d20Result.value + effectiveMod + currentHitBonus,
            damage: isFumble ? 0 : attackTotalDamage,
            d20Value: d20Result.value,
            isCrit: isCrit,
            isFumble: isFumble,
            hitDetails: `${d20Result.details}${effectiveMod !== 0 ? ` + ${effectiveMod}(mod)` : ''}${attackHitDetails.length > 0 ? ` + ${attackHitDetails.join(' + ')}` : ''}`,
            dmgDetails: `${attackDamageDetails.join(' + ')}${effectiveDmgMod !== 0 ? ` + ${effectiveDmgMod}(mod)` : ''}`,
            detailsStr: `${d20Result.details}${effectiveMod !== 0 ? ` + ${effectiveMod}(mod)` : ''}${attackHitDetails.length > 0 ? ` + ${attackHitDetails.join(' + ')}` : ''} | Damage: ${attackDamageDetails.join(' + ')}${effectiveDmgMod !== 0 ? ` + ${effectiveDmgMod}(mod)` : ''}`
          });

          if (isCrit) hasNat20 = true;
          if (isFumble) hasNat1 = true;
          d20Sum += d20Result.value;
          if (!isFumble) {
            totalMultiDamage += attackTotalDamage;
            hitsCount++;
          }
        }
        damageSum = totalMultiDamage;
        breakdown.d20 = attacks.map(a => ({ value: a.d20Value }));
        rollDetails.push(`${d20Count} Attacks (${hitsCount} Hits)`);
      } else {
        let critDoubling = false;
        let d20Rolls: any[] = [];
        if (d20Count > 0) {
          const d20Result = rollD20(rollMode);
          d20Rolls.push({ value: d20Result.value, dropped: d20Result.dropped, mode: rollMode });
          d20Sum += d20Result.value;
          if (d20Result.isCrit && !isCheckOrSave) critDoubling = true;
          if (d20Result.isFumble) hasNat1 = true;
          hasNat20 = critDoubling;
          breakdown.d20 = d20Rolls;
        }

        Object.entries(effectiveCounts).forEach(([die, count]) => {
          if (die !== 'd20' && count > 0) {
            const sides = parseInt(die.substring(1));
            const dieRolls: any[] = [];
            const effectiveCount = critDoubling ? count * 2 : count;
            for (let i = 0; i < effectiveCount; i++) {
              const roll = Math.floor(Math.random() * sides) + 1;
              dieRolls.push({ value: roll });
              damageSum += roll;
            }
            breakdown[die] = dieRolls;
            const rollValues = dieRolls.map(r => r.value).join(', ');
            rollDetails.push(`${effectiveCount}${die}: [${rollValues}]`);
          }
        });

        Object.entries(hitBonuses).forEach(([die, active]) => {
          if (active) {
            const sides = parseInt(die.substring(1));
            const r = Math.floor(Math.random() * sides) + 1;
            hitBonusTotal += r;
            d20Sum += r;
            rollDetails.push(`${r}(${die} hit)`);
          }
        });

        Object.entries(damageBonuses).forEach(([die, active]) => {
          if (active) {
            const sides = parseInt(die.substring(1));
            const r = Math.floor(Math.random() * sides) + 1;
            dmgBonusTotal += r;
            damageSum += r;
            rollDetails.push(`${r}(${die} dmg)`);
          }
        });

        if (d20Count > 0) {
          const d20Result = d20Rolls[0];
          const modeTag = rollMode !== 'normal' ? ` (${rollMode.substring(0,3).toUpperCase()})` : '';
          const valStr = d20Result.dropped !== undefined ? `[${d20Result.value}, drop ${d20Result.dropped}]` : `[${d20Result.value}]`;
          rollDetails.unshift(`d20${modeTag}: ${valStr}`);
        }
      }

      // D&D Logic:
      // - Attacks (explicitly or via multi-d20) auto-fail damage on a Natural 1.
      // - Checks and Saving Throws ALWAYS include the die value and bonuses.
      const finalTotalDamage = isMultiAttack ? damageSum : ((hasNat1 && isAttack) ? 0 : (damageSum + effectiveDmgMod));
      const finalTotalHit = d20Sum + (effectiveMod * (isMultiAttack ? d20Count : 1));

      const resultObj: RollResult = {
        total: finalTotalHit + finalTotalDamage,
        totalHit: finalTotalHit,
        totalDamage: finalTotalDamage,
        hasD20: d20Count > 0,
        hasDamage: damageSum > 0 || effectiveDmgMod !== 0,
        damageRaw: damageSum,
        breakdown,
        hitMod: effectiveMod,
        dmgMod: effectiveDmgMod,
        hitBonusSum: hitBonusTotal,
        damageBonusSum: dmgBonusTotal,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        detailsStr: rollDetails.join(' + '),
        rollMode,
        label: label || null,
        attacks: attacks.length > 0 ? attacks : undefined
      };

      setResult(resultObj);
      setHistory(prev => [resultObj, ...prev].slice(0, 20));
      setIsRolling(false);
      if (d20Count > 0) {
        if (hasNat20) {
          setSpecialEffect('crit');
          setTimeout(() => setSpecialEffect(null), 3000);
        } else if (hasNat1) {
          setSpecialEffect('fail');
          setTimeout(() => setSpecialEffect(null), 3000);
        }
      }
    }, 600);
  };

  const [stats, setStats] = useState<Stats>({ str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 });
  const [pb, setPb] = useState(0);
  const [profs, setProfs] = useState(new Set<string>());

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [bagItems, setBagItems] = useState<InventoryItem[]>([]); // DEFAULT: Empty Bag of Holding
  const [notes, setNotes] = useState('');
  const [consumables, setConsumables] = useState<Consumable[]>([]);
  const [equipmentItems, setEquipmentItems] = useState<EquipmentItem[]>([]);
  const [untrackedItems, setUntrackedItems] = useState<UntrackedItem[]>([]);
  const [featsList, setFeatsList] = useState<Feat[]>([]);
  const [currency, setCurrency] = useState<Currency>({ cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 });
  const [charInfo, setCharInfo] = useState<CharInfo>({ 
    race: '', class: '', level: 1, class2: '', level2: '', 
    hp: 10, maxHp: 10, tempHp: 0, ac: 10, 
    cond1: '', cond2: '', cond3: '', 
    isPoisoned: false, exhaustion: 0, 
    hitDie: 'd8', hitDieCount: 1, 
    background: '', alignment: '', xp: 0, feats: '',
    portraitUrl: '',
    speed: '',
    passivePerception: '',
    initiative: '',
    miscVitalLabel: 'Custom',
    miscVitalValue: ''
  });
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
  const [summonData, setSummonData] = useState<SummonStatblock>({
    name: 'Summoned Creature',
    type: 'Construct',
    ac: 13,
    hp: 20,
    maxHp: 20,
    initiative: 0,
    speed: '30 ft.',
    stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    saves: '',
    skills: '',
    senses: '',
    languages: '',
    resistances: '',
    immunities: '',
    traits: [],
    actions: [],
    bonusActions: [],
    reactions: [],
    miscVitalLabel: 'Custom',
    miscVitalValue: ''
  });

  const updateSummonData = (field: keyof SummonStatblock, value: any) => {
    setSummonData(prev => ({ ...prev, [field]: value }));
  };

  const [isLoaded, setIsLoaded] = useState(false);
  const [cloudCharacters, setCloudCharacters] = useState<{ id: string, name: string }[]>([]);

  const refreshCloudList = async () => {
    if (!user) return;
    try {
      const list = await listCharactersFromCloud(user.uid);
      setCloudCharacters(list);
    } catch (e) {
      console.error("Failed to refresh character list", e);
    }
  };

  useEffect(() => {
    if (user) {
      refreshCloudList();
    } else {
      setCloudCharacters([]);
    }
  }, [user]);

  const loadCharacterById = async (id: string) => {
    if (!user) return;
    try {
      const data = await loadCharacterFromCloud(user.uid, id);
      if (data) {
        if (data.characterName !== undefined) setCharacterName(data.characterName);
        if (data.charInfo) setCharInfo(data.charInfo);
        if (data.stats) setStats(data.stats);
        if (data.pb) setPb(data.pb);
        if (data.notes !== undefined) setNotes(data.notes);
        if (data.inventoryItems !== undefined) setInventoryItems(data.inventoryItems);
        if (data.bagItems !== undefined) setBagItems(data.bagItems);
        if (data.currency) setCurrency(data.currency);
        if (data.consumables && Array.isArray(data.consumables)) setConsumables(data.consumables);
        if (data.equipmentItems && Array.isArray(data.equipmentItems)) setEquipmentItems(data.equipmentItems);
        if (data.untrackedItems && Array.isArray(data.untrackedItems)) setUntrackedItems(data.untrackedItems);
        if (data.featsList && Array.isArray(data.featsList)) setFeatsList(data.featsList);
        if (data.spellAbility) setSpellAbility(data.spellAbility);
        if (data.doubleCarry !== undefined) setDoubleCarry(data.doubleCarry);
        if (data.spellSlots) setSpellSlots(data.spellSlots);
        if (data.spells && Array.isArray(data.spells)) setSpells(data.spells);
        if (data.profs && Array.isArray(data.profs)) setProfs(new Set(data.profs));
        if (data.summonData) setSummonData(data.summonData);
        toast({ title: "Character Loaded", description: `${data.characterName} has been summoned.` });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Load Failed", description: "Could not retrieve character data." });
    }
  };

  const resetCharacter = () => {
    setCharacterName('');
    setCharInfo({
      speed: '',
      passivePerception: '',
      initiative: '',
      alignment: '', race: '', class: '', level: 1, xp: 0,
      hp: 10, maxHp: 10, tempHp: 0, ac: 10,
      hitDie: 'd8', hitDieCount: 1, exhaustion: 0, isPoisoned: false, 
      cond1: '', cond2: '', cond3: '', portraitUrl: '', feats: '', background: '', class2: '', level2: 0,
      miscVitalLabel: 'Custom', miscVitalValue: ''
    });
    setStats({ str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 });
    setPb(0);
    setNotes('');
    setInventoryItems([]);
    setBagItems([]);
    setConsumables([]);
    setEquipmentItems([]);
    setUntrackedItems([]);
    setFeatsList([]);
    setCurrency({ cp: 0, sp: 0, gp: 0, ep: 0, pp: 0 });
    setSpellAbility('int');
    setSpellSlots({
      '1': { max: 0, slots: [] }, '2': { max: 0, slots: [] }, '3': { max: 0, slots: [] },
      '4': { max: 0, slots: [] }, '5': { max: 0, slots: [] }, '6': { max: 0, slots: [] },
      '7': { max: 0, slots: [] }, '8': { max: 0, slots: [] }, '9': { max: 0, slots: [] },
    });
    setSpells([]);
    setProfs(new Set());
    setSummonData({
      name: 'Summoned Creature',
      type: 'Construct',
      ac: 13, hp: 20, maxHp: 20, initiative: 0, speed: '30 ft.',
      stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
      saves: '', skills: '', senses: '', languages: '', resistances: '', immunities: '',
      traits: [], actions: [], bonusActions: [], reactions: [],
      miscVitalLabel: 'Custom', miscVitalValue: ''
    });
    toast({ title: "Sheet Cleared", description: "You are now working with a fresh character." });
  };

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
        if (data.featsList && Array.isArray(data.featsList)) setFeatsList(data.featsList);
        if (data.spellAbility) setSpellAbility(data.spellAbility);
        if (data.doubleCarry !== undefined) setDoubleCarry(data.doubleCarry);
        if (data.spellSlots) setSpellSlots(data.spellSlots);
        if (data.spells && Array.isArray(data.spells)) setSpells(data.spells);
        if (data.profs && Array.isArray(data.profs)) setProfs(new Set(data.profs));
        if (data.summonData) {
          const s = data.summonData;
          setSummonData({
            ...s,
            traits: Array.isArray(s.traits) ? s.traits : [],
            actions: Array.isArray(s.actions) ? s.actions : [],
            bonusActions: Array.isArray(s.bonusActions) ? s.bonusActions : [],
            reactions: Array.isArray(s.reactions) ? s.reactions : []
          });
        }
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
      characterName, charInfo, stats, pb, notes, inventoryItems, bagItems, consumables, equipmentItems, untrackedItems, featsList, currency,
      spellAbility, spellSlots, spells, doubleCarry, profs: Array.from(profs), summonData
    };
    
    try {
        localStorage.setItem('dnd_character_data', JSON.stringify(data));
    } catch (e) {
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
            console.error("Local storage quota exceeded. Consider uploading a smaller image or clearing other local storage data.");
            toast({ variant: "destructive", title: "Storage Full", description: "Your character data is too large to save locally. Try a smaller portrait image." });
        }
    }
  }, [
    isLoaded, characterName, charInfo, stats, pb, notes, inventoryItems, bagItems, consumables, 
    equipmentItems, untrackedItems, featsList, currency, spellAbility, spellSlots, spells, doubleCarry, profs, summonData
  ]);

  const updateStat = (stat: Stat, val: number) => setStats(prev => ({ ...prev, [stat]: val || 0 }));

  // AUTOMATED AC CALCULATION
  useEffect(() => {
    if (!isLoaded) return;

    const dexMod = Math.floor(((stats.dex || 10) - 10) / 2);
    const equipped = equipmentItems.filter(i => i.isWearing);
    
    // Find the primary armor (one with a restrictive armor type)
    const armor = equipped.find(i => ['Light', 'Medium', 'Heavy'].includes(i.armorType || ''));
    
    // Find non-armor bonuses (like shields) - anything equipped with an AC value that isn't the main armor
    const bonuses = equipped
      .filter(i => (i.armorType === 'Shield' || i.armorType === 'None') && i.ac && i !== armor)
      .reduce((acc, i) => acc + (parseInt(i.ac?.toString() || '0') || 0), 0);

    let baseAc = 10 + dexMod;

    if (armor) {
      const armorBase = parseInt(armor.ac?.toString() || '0') || 0;
      if (armor.armorType === 'Heavy') {
        baseAc = armorBase;
      } else if (armor.armorType === 'Medium') {
        baseAc = armorBase + Math.min(dexMod, 2);
      } else if (armor.armorType === 'Light') {
        baseAc = armorBase + dexMod;
      }
    }

    const calculatedAc = baseAc + bonuses;
    
    // Avoid updating if already correct to prevent loops
    if (charInfo.ac !== calculatedAc) {
      setCharInfo(prev => ({ ...prev, ac: calculatedAc }));
    }
  }, [equipmentItems, stats.dex, isLoaded, charInfo.ac]);

  const updateCharInfo = (field: keyof CharInfo, val: any) => {
    setCharInfo(prev => {
      const newState = { ...prev, [field]: val };
      
      // UPDATE HIT DIE COUNT AUTOMATICALLY WHEN LEVELS CHANGE
      if (field === 'level' || field === 'level2') {
        const lvl1 = parseInt(newState.level?.toString() || '0') || 0;
        const lvl2 = parseInt(newState.level2?.toString() || '0') || 0;
        newState.hitDieCount = lvl1 + lvl2;
      }
      
      return newState;
    });
  };
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

  const addEquipmentItem = () => setEquipmentItems(prev => [...prev, { id: Date.now(), name: '', weight: 0, isWearing: false, armorType: 'None', ac: '' }]);
  const updateEquipmentItem = (id: number, field: keyof EquipmentItem, value: any) => {
    setEquipmentItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };
  const removeEquipmentItem = (id: number) => setEquipmentItems(prev => prev.filter(item => item.id !== id));

  const addUntrackedItem = () => setUntrackedItems(prev => [...prev, { id: Date.now(), name: '' }]);
  const updateUntrackedItem = (id: number, name: string) => {
    setUntrackedItems(prev => prev.map(item => item.id === id ? { ...item, name } : item));
  };
  const removeUntrackedItem = (id: number) => setUntrackedItems(prev => prev.filter(item => item.id !== id));

  const addFeat = () => setFeatsList(prev => [...prev, { id: Date.now(), name: '', description: '' }]);
  const updateFeat = (id: number, field: keyof Feat, value: any) => {
    setFeatsList(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));
  };
  const removeFeat = (id: number) => setFeatsList(prev => prev.filter(f => f.id !== id));
  const moveFeat = (id: number, direction: 'up' | 'down') => {
    setFeatsList(prev => {
      const index = prev.findIndex(f => f.id === id);
      if (index < 0) return prev;
      if (direction === 'up' && index === 0) return prev;
      if (direction === 'down' && index === prev.length - 1) return prev;
      
      const newArray = [...prev];
      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      const temp = newArray[index];
      newArray[index] = newArray[swapIndex];
      newArray[swapIndex] = temp;
      
      return newArray;
    });
  };

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

  const shortRest = () => {
    toast({ title: "Short Rest", description: "You can now spend hit dice to recover HP." });
  };

  const longRest = () => {
    setCharInfo(prev => {
      const lvl1 = parseInt(prev.level?.toString() || '0') || 0;
      const lvl2 = parseInt(prev.level2?.toString() || '0') || 0;
      const totalLevel = lvl1 + lvl2;
      
      // Restore HP to Max
      const newHp = prev.maxHp;
      
      // Restore half hit dice (min 1)
      const hdToRestore = Math.max(1, Math.floor(totalLevel / 2));
      const newHdCount = Math.min(totalLevel, prev.hitDieCount + hdToRestore);
      
      return {
        ...prev,
        hp: newHp,
        hitDieCount: newHdCount,
        exhaustion: Math.max(0, prev.exhaustion - 1) // Reduce exhaustion by 1
      };
    });

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
    
    toast({ 
      title: "Long Rest Complete", 
      description: "HP restored, spell slots replenished, and hit dice recovered." 
    });
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
      characterName, charInfo, stats, pb, notes, inventoryItems, bagItems, consumables, equipmentItems, untrackedItems, featsList, currency,
      spellAbility, spellSlots, spells, doubleCarry, profs: Array.from(profs), summonData
    };
    try {
      const safeName = characterName.trim().replace(/[^a-z0-9]/gi, '-').toLowerCase();
      console.log("Saving character as:", `char-${safeName}`, "Data:", data);
      await saveCharacterToCloud(user.uid, `char-${safeName}`, data);
      await refreshCloudList();
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
      if (data.featsList && Array.isArray(data.featsList)) setFeatsList(data.featsList);
      if (data.spellAbility) setSpellAbility(data.spellAbility);
      if (data.doubleCarry !== undefined) setDoubleCarry(data.doubleCarry);
      
      if (data.spellSlots) setSpellSlots(data.spellSlots);
      if (data.spells && Array.isArray(data.spells)) setSpells(data.spells);
      if (data.profs && Array.isArray(data.profs)) setProfs(new Set(data.profs));
      if (data.summonData) setSummonData(data.summonData);

      toast({ title: "Cloud Load Successful", description: "Character data restored from Firestore." });
    } catch (error) {
      toast({ variant: "destructive", title: "Cloud Load Failed", description: "Could not pull from Firebase." });
    }
  };

  const handleExport = () => {
    const data = {
      characterName, charInfo, stats, pb, notes, inventoryItems, bagItems, consumables, equipmentItems, untrackedItems, featsList, currency,
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
        if (data.featsList && Array.isArray(data.featsList)) setFeatsList(data.featsList);
        if (data.spellAbility) setSpellAbility(data.spellAbility);
        if (data.doubleCarry !== undefined) setDoubleCarry(data.doubleCarry);

        if (data.spellSlots) {
          setSpellSlots(data.spellSlots);
        }

        if (data.spells && Array.isArray(data.spells)) setSpells(data.spells);
        if (data.profs && Array.isArray(data.profs)) setProfs(new Set(data.profs));
        if (data.summonData) setSummonData(data.summonData);

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
    updateUntrackedItem, removeUntrackedItem, featsList, addFeat, updateFeat, removeFeat, moveFeat, currency, updateCurrency, spellAbility, setSpellAbility,
    spellSlots, updateSpellSlotMax, toggleSpellSlot, longRest, shortRest, spells, addSpell, removeSpell,
    doubleCarry, setDoubleCarry, handleExport, handleImportClick, fileInputRef,
    handleCloudSave, handleCloudLoad, user, handleSignIn, handleSignOut,
    counts, setCounts, modifier, setModifier, damageMod, setDamageMod, rollMode, setRollMode,
    hitBonuses, setHitBonuses, damageBonuses, setDamageBonuses,
    isRolling, setIsRolling, result, setResult, history, setHistory, specialEffect, setSpecialEffect, 
    activeTab, setActiveTab, triggerRoll,
    cloudCharacters, refreshCloudList, loadCharacterById, resetCharacter,
    summonData, updateSummonData, setSummonData
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
