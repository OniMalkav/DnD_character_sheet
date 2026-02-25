export type Stat = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
export type Stats = Record<Stat, number>;

export type CharInfo = {
  race: string;
  class: string;
  level: number | string;
  class2: string;
  level2: number | string;
  background: string;
  alignment: string;
  xp: number | string;
  feats: string;
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
  timestamp: string;
  detailsStr: string;
  rollMode: RollMode;
  label: string | null;
};
