export type Stat = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
export type Stats = Record<Stat, number>;

export type CharInfo = {
  race: string;
  class: string;
  level: number | string;
  class2: string;
  level2: number | string;
  hp: number | string;
  maxHp: number | string;
  tempHp: number | string;
  ac: number | string;
  cond1: string;
  cond2: string;
  cond3: string;
  isPoisoned: boolean;
  exhaustion: number;
  hitDie: string;
  hitDieCount: number;
  background: string;
  alignment: string;
  xp: number | string;
  feats: string;
  portraitUrl?: string; 
  speed: number | string;
  passivePerception: number | string;
  initiative: number | string;
  miscVitalLabel: string;
  miscVitalValue: string;
};


export type Currency = {
  cp: number;
  sp: number;
  ep: number;
  gp: number;
  pp: number;
};

export type Consumable = {
  id: number;
  name: string;
  count: number;
  weight: number;
};

export type EquipmentType = 'None' | 'Light' | 'Medium' | 'Heavy' | 'Shield' | 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';

export type EquipmentItem = {
  id: number;
  name: string;
  weight: number;
  isWearing: boolean;
  armorType?: EquipmentType;
  ac?: number | string;
};

// NEW: Structured type for general inventory gear
export type InventoryItem = {
  id: number;
  name: string;
  weight: number;
};

export type UntrackedItem = {
  id: number;
  name: string;
};

export type Feat = {
  id: number;
  name: string;
  description: string;
};

export type Spell = {
  id: number;
  name: string;
  level: number;
};

export type SpellSlotState = {
  max: number;
  slots: boolean[]; // true = used
};
export type SpellSlots = Record<string, SpellSlotState>;

export type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';

export type DiceCounts = Record<DiceType, number>;

export type DieRoll = {
  value: number;
  dropped?: number;
  mode?: RollMode;
};

export type RollBreakdown = Partial<Record<DiceType, DieRoll[]>>;

export type RollMode = 'normal' | 'advantage' | 'disadvantage';

export type SkillBonus = {
    d4: boolean;
    d6: boolean;
    d8: boolean;
    d10: boolean;
    d12: boolean;
};

export type AttackResult = {
  hit: number;
  damage: number;
  d20Value: number;
  isCrit: boolean;
  isFumble: boolean;
  detailsStr: string;
  hitDetails?: string;
  dmgDetails?: string;
};

export type RollResult = {
  total: number;
  totalHit: number;
  totalDamage: number;
  hasD20: boolean;
  hasDamage: boolean;
  damageRaw: number;
  breakdown: RollBreakdown;
  hitMod: number;
  dmgMod: number;
  hitBonusSum?: number;
  damageBonusSum?: number;
  timestamp: string;
  detailsStr: string;
  rollMode: RollMode;
  label: string | null;
  attacks?: AttackResult[]; // EFFECT: Individual attack breakdowns for multi-attack scenarios
};
export type SummonAction = {
  id: string;
  name: string;
  description: string;
  toHit?: string;
  damage?: string;
};

export type SummonTrait = {
  id: string;
  name: string;
  description: string;
};

export type SummonStatblock = {
  name: string;
  type: string;
  ac: number | string;
  hp: number | string;
  maxHp: number | string;
  initiative: number | string;
  speed: string;
  stats: Stats;
  saves: string;
  skills: string;
  senses: string;
  languages: string;
  resistances: string;
  immunities: string;
  traits: SummonTrait[];
  actions: SummonAction[];
  bonusActions: SummonAction[];
  reactions: SummonAction[];
  miscVitalLabel?: string;
  miscVitalValue?: string;
};

export type ActiveTab = 'home' | 'dice' | 'skills' | 'inventory' | 'character' | 'spells' | 'summon';
