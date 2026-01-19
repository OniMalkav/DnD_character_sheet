import React, { useState, useRef, useEffect } from 'react';
import { Dices, RotateCcw, Trash2, History, X, Sparkles, Skull, User, Check, Plus } from 'lucide-react';

const DICE_TYPES = [
  { type: 'd4', sides: 4, color: 'bg-red-600', hover: 'hover:bg-red-700' },
  { type: 'd6', sides: 6, color: 'bg-blue-600', hover: 'hover:bg-blue-700' },
  { type: 'd8', sides: 8, color: 'bg-green-600', hover: 'hover:bg-green-700' },
  { type: 'd10', sides: 10, color: 'bg-purple-600', hover: 'hover:bg-purple-700' },
  { type: 'd12', sides: 12, color: 'bg-orange-600', hover: 'hover:bg-orange-700' },
  { type: 'd20', sides: 20, color: 'bg-yellow-600', hover: 'hover:bg-yellow-700' },
  { type: 'd100', sides: 100, color: 'bg-slate-700', hover: 'hover:bg-slate-800' },
];

const SKILLS_DATA = [
  { name: 'Acrobatics', stat: 'dex' },
  { name: 'Animal Handling', stat: 'wis' },
  { name: 'Arcana', stat: 'int' },
  { name: 'Athletics', stat: 'str' },
  { name: 'Deception', stat: 'cha' },
  { name: 'History', stat: 'int' },
  { name: 'Insight', stat: 'wis' },
  { name: 'Intimidation', stat: 'cha' },
  { name: 'Investigation', stat: 'int' },
  { name: 'Medicine', stat: 'wis' },
  { name: 'Nature', stat: 'int' },
  { name: 'Perception', stat: 'wis' },
  { name: 'Performance', stat: 'cha' },
  { name: 'Persuasion', stat: 'cha' },
  { name: 'Religion', stat: 'int' },
  { name: 'Sleight of Hand', stat: 'dex' },
  { name: 'Stealth', stat: 'dex' },
  { name: 'Survival', stat: 'wis' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dice'); // 'dice' | 'skills'
  
  // Dice State
  const [counts, setCounts] = useState({
    d4: 0, d6: 0, d8: 0, d10: 0, d12: 0, d20: 0, d100: 0
  });
  const [modifier, setModifier] = useState(0);
  
  // Character State
  const [stats, setStats] = useState({
    str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10
  });
  const [pb, setPb] = useState(2); // Proficiency Bonus
  const [profs, setProfs] = useState(new Set()); // Set of skill names
  
  // Skill Bonus Dice (Guidance, Bardic Inspiration, etc.)
  const [skillBonuses, setSkillBonuses] = useState({
    d4: false, d6: false, d8: false, d10: false, d12: false
  });

  // Result State
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [isRolling, setIsRolling] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [rollMode, setRollMode] = useState('normal'); 
  const [specialEffect, setSpecialEffect] = useState(null); 

  const resultsRef = useRef(null);

  // Clear special effects
  useEffect(() => {
    if (specialEffect) {
      const timer = setTimeout(() => setSpecialEffect(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [specialEffect]);

  const updateCount = (dieType, delta) => {
    setCounts(prev => ({
      ...prev,
      [dieType]: Math.max(0, prev[dieType] + delta)
    }));
  };

  const toggleProficiency = (skillName) => {
    setProfs(prev => {
      const newProfs = new Set(prev);
      if (newProfs.has(skillName)) {
        newProfs.delete(skillName);
      } else {
        newProfs.add(skillName);
      }
      return newProfs;
    });
  };

  const updateStat = (stat, val) => {
    setStats(prev => ({ ...prev, [stat]: parseInt(val) || 0 }));
  };

  const toggleSkillBonus = (dieType) => {
    setSkillBonuses(prev => ({
      ...prev,
      [dieType]: !prev[dieType]
    }));
  };

  // Helper to calculate D&D 5e Modifier: floor((score - 10) / 2)
  const calculateModifier = (score) => Math.floor((score - 10) / 2);

  const resetSelections = () => {
    setCounts({ d4: 0, d6: 0, d8: 0, d10: 0, d12: 0, d20: 0, d100: 0 });
    setModifier(0);
    setResult(null);
    setRollMode('normal');
    setSpecialEffect(null);
  };

  const rollDice = (overrideCounts = null, overrideMod = null, label = null) => {
    const currentCounts = overrideCounts || counts;
    const currentMod = overrideMod !== null ? overrideMod : modifier;

    const totalDice = Object.values(currentCounts).reduce((a, b) => a + b, 0);
    if (totalDice === 0) return;

    setIsRolling(true);
    setResult(null);
    setSpecialEffect(null);
    
    if (overrideCounts) {
      setCounts(overrideCounts);
      setModifier(currentMod);
    }

    setTimeout(() => {
      let totalSum = 0;
      let breakdown = {};
      let rollDetails = [];
      let hasNat20 = false;
      let hasNat1 = false;

      Object.entries(currentCounts).forEach(([die, count]) => {
        if (count > 0) {
          const sides = parseInt(die.substring(1));
          const dieRolls = [];
          
          for (let i = 0; i < count; i++) {
            // Apply Advantage/Disadvantage ONLY to d20
            if (rollMode !== 'normal' && die === 'd20') {
              const r1 = Math.floor(Math.random() * sides) + 1;
              const r2 = Math.floor(Math.random() * sides) + 1;
              
              let kept, dropped;
              if (rollMode === 'advantage') {
                kept = Math.max(r1, r2);
                dropped = Math.min(r1, r2);
              } else {
                kept = Math.min(r1, r2);
                dropped = Math.max(r1, r2);
              }
              
              dieRolls.push({ value: kept, dropped: dropped, mode: rollMode });
              totalSum += kept;
            } else {
              // Normal Roll
              const roll = Math.floor(Math.random() * sides) + 1;
              dieRolls.push({ value: roll });
              totalSum += roll;
            }
          }
          breakdown[die] = dieRolls;

          if (die === 'd20') {
            dieRolls.forEach(r => {
              if (r.value === 20) hasNat20 = true;
              if (r.value === 1) hasNat1 = true;
            });
          }

          const rollValues = dieRolls.map(r => r.value).join(', ');
          const modeTag = (rollMode !== 'normal' && die === 'd20') 
            ? (rollMode === 'advantage' ? ' (ADV)' : ' (DIS)') 
            : '';
          rollDetails.push(`${count}${die}${modeTag}: [${rollValues}]`);
        }
      });

      const finalTotal = totalSum + parseInt(currentMod || 0);
      
      const resultObj = {
        total: finalTotal,
        breakdown: breakdown,
        modifier: parseInt(currentMod || 0),
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        detailsStr: rollDetails.join(' + '),
        rollMode: rollMode,
        label: label
      };

      setResult(resultObj);
      setHistory(prev => [resultObj, ...prev].slice(0, 50));
      setIsRolling(false);

      if (hasNat20) setSpecialEffect('crit');
      else if (hasNat1) setSpecialEffect('fail');
      
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 600);
  };

  const rollSkill = (skill) => {
    const statScore = stats[skill.stat];
    const statMod = calculateModifier(statScore);
    const isProficient = profs.has(skill.name);
    const totalMod = statMod + (isProficient ? parseInt(pb) : 0);
    
    // Construct dice set based on selected bonuses
    const checkCounts = {
      d4: skillBonuses.d4 ? 1 : 0,
      d6: skillBonuses.d6 ? 1 : 0,
      d8: skillBonuses.d8 ? 1 : 0,
      d10: skillBonuses.d10 ? 1 : 0,
      d12: skillBonuses.d12 ? 1 : 0,
      d20: 1,
      d100: 0
    };
    
    rollDice(checkCounts, totalMod, `${skill.name} Check`);
  };

  const hasSelections = Object.values(counts).some(v => v > 0);
  const isD20Roll = result?.breakdown?.d20?.length > 0;

  // Calculate stats for display
  const getCalculationData = () => {
    if (!result) return null;
    const naturalD20 = result.breakdown.d20 ? result.breakdown.d20.reduce((acc, r) => acc + r.value, 0) : 0;
    
    let otherDiceSum = 0;
    const otherDiceElements = [];
    
    Object.entries(result.breakdown).forEach(([dieType, rolls]) => {
      if (dieType !== 'd20') {
        const sum = rolls.reduce((a, b) => a + b.value, 0);
        otherDiceSum += sum;
        if (sum > 0) otherDiceElements.push({ type: dieType, value: sum, rolls: rolls });
      }
    });

    return { naturalD20, otherDiceSum, otherDiceElements };
  };

  const calcData = getCalculationData();

  return (
    <div className={`min-h-screen font-sans selection:bg-red-500 selection:text-white pb-20 transition-colors duration-500
      ${specialEffect === 'crit' ? 'bg-slate-900' : specialEffect === 'fail' ? 'bg-red-950/30' : 'bg-slate-900'} text-slate-100`}>
      
      <style>{`
        @keyframes shake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-4px) rotate(-1deg); } 40% { transform: translateX(4px) rotate(1deg); } 60% { transform: translateX(-4px) rotate(-1deg); } 80% { transform: translateX(4px) rotate(1deg); } }
        .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes pop-in { 0% { transform: scale(0); opacity: 0; } 70% { transform: scale(1.2); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        .animate-pop { animation: pop-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}</style>

      {/* Visual Effects */}
      {specialEffect === 'crit' && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-yellow-500/10 animate-pulse"></div>
          <div className="relative animate-pop flex flex-col items-center">
            <Sparkles className="w-16 h-16 text-yellow-400 mb-4 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]" />
            <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] stroke-black tracking-tighter">NATURAL 20!</h1>
          </div>
        </div>
      )}

      {specialEffect === 'fail' && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-red-900/20"></div>
          <div className="relative animate-pop flex flex-col items-center animate-shake">
            <Skull className="w-16 h-16 text-red-500 mb-4 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]" />
            <h1 className="text-6xl md:text-8xl font-black text-red-600 drop-shadow-[0_4px_0_rgba(0,0,0,1)] tracking-tighter border-black">CRITICAL MISS</h1>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4 shadow-lg sticky top-0 z-30">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-red-600 p-2 rounded-lg">
              <Dices className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent hidden sm:block">
              D&D Dice Roller
            </h1>
          </div>
          
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700">
            <button onClick={() => setActiveTab('dice')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'dice' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Dice</button>
            <button onClick={() => setActiveTab('skills')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'skills' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Skills</button>
          </div>

          <button onClick={() => setShowHistory(!showHistory)} className={`p-2 rounded-full transition-colors ${showHistory ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}><History className="w-6 h-6" /></button>
        </div>
      </div>

      <main className={`max-w-4xl mx-auto p-4 space-y-6 ${specialEffect === 'fail' ? 'animate-shake' : ''}`}>
        
        {/* History Modal */}
        {showHistory && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-end">
            <div className="w-full max-w-md bg-slate-800 h-full border-l border-slate-700 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
              <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <History className="w-5 h-5 text-slate-400" />
                  Roll History
                </h2>
                <button onClick={() => setShowHistory(false)} className="p-1 hover:bg-slate-700 rounded-full"><X className="w-6 h-6" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {history.map((h, idx) => (
                  <div key={idx} className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-400 font-mono">{h.timestamp}</span>
                        {h.label && <span className="text-xs text-orange-400 font-bold uppercase">{h.label}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                          {h.rollMode !== 'normal' && <span className={`text-[10px] uppercase px-1 rounded ${h.rollMode === 'advantage' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>{h.rollMode === 'advantage' ? 'ADV' : 'DIS'}</span>}
                          <span className="text-xl font-bold text-white">{h.total}</span>
                      </div>
                    </div>
                    <div className="text-sm text-slate-300 mb-1 break-words">
                        {h.detailsStr} {h.modifier !== 0 && (h.modifier > 0 ? ` + ${h.modifier}` : ` - ${Math.abs(h.modifier)}`)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Global Controls */}
        <div className="bg-slate-800 p-2 rounded-xl border border-slate-700 flex gap-1 shadow-sm">
          <button onClick={() => setRollMode('normal')} className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold uppercase transition-all ${rollMode === 'normal' ? 'bg-slate-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-700/50'}`}>Normal</button>
          <button onClick={() => setRollMode('advantage')} className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold uppercase transition-all ${rollMode === 'advantage' ? 'bg-green-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-700/50 hover:text-green-400'}`}>Advantage</button>
          <button onClick={() => setRollMode('disadvantage')} className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold uppercase transition-all ${rollMode === 'disadvantage' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-700/50 hover:text-red-400'}`}>Disadvantage</button>
        </div>

        {/* DICE TAB */}
        {activeTab === 'dice' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {DICE_TYPES.map((die) => (
                <div key={die.type} className={`relative bg-slate-800 rounded-xl border-2 transition-all duration-200 overflow-hidden ${counts[die.type] > 0 ? 'border-slate-500 ring-1 ring-slate-500/50' : 'border-slate-700 hover:border-slate-600'}`}>
                  <div className={`absolute top-0 left-0 w-1 h-full ${die.color} opacity-80`}></div>
                  <div className="p-3 pl-5 flex flex-col items-center justify-between h-full min-h-[110px]">
                    <div className="text-lg font-bold uppercase tracking-wider text-slate-300 mb-2 font-mono">{die.type}</div>
                    <div className="flex items-center gap-3 w-full justify-center">
                      <button onClick={() => updateCount(die.type, -1)} disabled={counts[die.type] === 0} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xl font-bold pb-1">-</button>
                      <div className={`text-2xl font-bold w-8 text-center ${counts[die.type] > 0 ? 'text-white' : 'text-slate-500'}`}>{counts[die.type]}</div>
                      <button onClick={() => updateCount(die.type, 1)} className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors text-xl font-bold pb-1 text-white shadow-lg ${die.color} ${die.hover}`}>+</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 items-center justify-between bg-slate-800 p-4 rounded-xl border border-slate-700">
              <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Modifier:</label>
                <div className="flex items-center bg-slate-900 rounded-lg border border-slate-600 overflow-hidden">
                  <button onClick={() => setModifier(m => parseInt(m) - 1)} className="px-3 py-2 hover:bg-slate-700 text-slate-300">-</button>
                  <input type="number" value={modifier} onChange={(e) => setModifier(e.target.value)} className="w-12 bg-transparent text-center font-bold outline-none text-white [appearance:textfield]" />
                  <button onClick={() => setModifier(m => parseInt(m) + 1)} className="px-3 py-2 hover:bg-slate-700 text-slate-300">+</button>
                </div>
              </div>
              <button onClick={resetSelections} disabled={!hasSelections && modifier === 0 && !result} className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-3 py-2 rounded-lg hover:bg-slate-700/50"><Trash2 className="w-4 h-4" /> Clear</button>
            </div>

            <button onClick={() => rollDice()} disabled={!hasSelections || isRolling} className={`w-full py-4 rounded-xl font-bold text-2xl uppercase tracking-widest shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-3 ${!hasSelections ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : isRolling ? 'bg-orange-600 cursor-wait animate-pulse' : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white ring-1 ring-white/10'}`}>
              {isRolling ? <><RotateCcw className="w-6 h-6 animate-spin" /> Rolling...</> : <><Dices className="w-8 h-8" /> ROLL</>}
            </button>
          </div>
        )}

        {/* SKILLS TAB */}
        {activeTab === 'skills' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Character Stats */}
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                  <User className="w-5 h-5 text-orange-400" /> Character Scores
                </h2>
                <div className="flex items-center gap-2">
                   <span className="text-xs uppercase text-slate-400 font-bold">Prof. Bonus:</span>
                   <input type="number" value={pb} onChange={(e) => setPb(e.target.value)} className="w-12 bg-slate-900 border border-slate-600 rounded p-1 text-center font-bold text-white" />
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {Object.keys(stats).map(stat => {
                  const mod = calculateModifier(stats[stat]);
                  const sign = mod >= 0 ? '+' : '';
                  
                  return (
                    <div key={stat} className="bg-slate-900 p-2 rounded-lg border border-slate-700 flex flex-col items-center relative group">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{stat}</label>
                      <input type="number" value={stats[stat]} onChange={(e) => updateStat(stat, e.target.value)} className="w-full bg-transparent text-center font-bold text-xl text-white outline-none focus:text-orange-400 transition-colors" />
                      <div className={`text-xs font-mono font-bold mt-1 px-2 py-0.5 rounded ${mod >= 0 ? 'bg-slate-800 text-slate-300' : 'bg-red-900/30 text-red-400'}`}>{sign}{mod}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bonus Dice Selection */}
            <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Plus className="w-3 h-3" /> Add Bonus Dice
              </div>
              <div className="flex flex-wrap gap-2">
                {['d4', 'd6', 'd8', 'd10', 'd12'].map((die) => (
                  <button
                    key={die}
                    onClick={() => toggleSkillBonus(die)}
                    className={`flex-1 min-w-[50px] py-1.5 rounded text-sm font-bold font-mono border transition-all
                      ${skillBonuses[die] 
                        ? 'bg-orange-600 border-orange-500 text-white shadow-lg' 
                        : 'bg-slate-900 border-slate-600 text-slate-400 hover:border-slate-500'}
                    `}
                  >
                    +{die}
                  </button>
                ))}
              </div>
              <div className="text-[10px] text-slate-500 mt-1.5 italic">
                (e.g., Guidance d4, Bardic Inspiration d6-d12)
              </div>
            </div>

            {/* Skills List */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col">
              <div className="grid grid-cols-1 lg:grid-cols-2 bg-slate-900 border-b border-slate-700">
                <div className="p-3 grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                   <div className="pl-2">Prof</div>
                   <div>Skill</div>
                   <div className="text-center">Mod</div>
                   <div className="w-20"></div>
                </div>
                <div className="hidden lg:grid p-3 border-l border-slate-700/50 grid-cols-[auto_1fr_auto_auto] gap-4 items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                   <div className="pl-2">Prof</div>
                   <div>Skill</div>
                   <div className="text-center">Mod</div>
                   <div className="w-20"></div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 bg-slate-800">
                {SKILLS_DATA.map((skill, index) => {
                  const isProficient = profs.has(skill.name);
                  const statMod = calculateModifier(stats[skill.stat]);
                  const totalMod = statMod + (isProficient ? parseInt(pb) : 0);
                  const sign = totalMod >= 0 ? '+' : '';
                  
                  return (
                    <div key={skill.name} className={`p-3 grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center hover:bg-slate-700/30 transition-colors border-b border-slate-700/50 ${index % 2 === 0 ? 'lg:border-r lg:border-slate-700/50' : ''}`}>
                      <button onClick={() => toggleProficiency(skill.name)} className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${isProficient ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-600 hover:border-slate-500'}`}>{isProficient && <Check className="w-3.5 h-3.5" />}</button>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span className="font-bold text-slate-200">{skill.name}</span>
                        <span className="text-[10px] uppercase text-slate-500 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700/50">{skill.stat}</span>
                      </div>
                      <div className={`font-mono font-bold text-center w-8 ${totalMod > 0 ? 'text-green-400' : totalMod < 0 ? 'text-red-400' : 'text-slate-500'}`}>{sign}{totalMod}</div>
                      <button onClick={() => rollSkill(skill)} disabled={isRolling} className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap"><Dices className="w-3 h-3" /> Roll</button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Results Area */}
        {result && (
          <div ref={resultsRef} className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-20">
            <div className={`bg-slate-800 rounded-2xl border-2 overflow-hidden shadow-2xl transition-colors duration-300 ${specialEffect === 'crit' ? 'border-yellow-500/50 ring-2 ring-yellow-500/20' : specialEffect === 'fail' ? 'border-red-500/50 ring-2 ring-red-500/20' : 'border-slate-600'}`}>
              
              <div className="bg-slate-900 p-6 text-center border-b border-slate-700 relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r opacity-50 ${result.rollMode === 'advantage' ? 'from-transparent via-green-500 to-transparent' : result.rollMode === 'disadvantage' ? 'from-transparent via-red-500 to-transparent' : 'from-transparent via-orange-500 to-transparent'}`}></div>
                
                {result.label && (
                   <div className="mb-2 inline-block px-3 py-1 rounded-full bg-slate-800 border border-slate-600 text-orange-400 text-xs font-bold uppercase tracking-widest">
                      {result.label}
                   </div>
                )}
                
                {isD20Roll ? (
                   // D20 SPECIFIC DISPLAY
                   <div className="flex flex-col items-center">
                     <h3 className="text-slate-400 uppercase tracking-widest text-xs font-semibold mb-2">Total Result</h3>
                     
                     {/* The BIG Total */}
                     <div className={`text-7xl md:text-8xl font-black drop-shadow-lg tracking-tighter mb-4 ${
                        result.breakdown.d20.some(r => !r.dropped && r.value === 20) ? 'text-yellow-400 animate-pulse' :
                        result.breakdown.d20.some(r => !r.dropped && r.value === 1) ? 'text-red-500' : 'text-white'
                     }`}>
                        {result.total}
                     </div>

                     {/* The Dice Visuals Container */}
                     <div className="flex flex-col items-center gap-3 mb-4">
                       
                       {/* D20s Row */}
                       <div className="flex items-center justify-center flex-wrap gap-4">
                         {result.breakdown.d20.map((rollObj, idx) => (
                           <React.Fragment key={idx}>
                             {/* Dropped Die */}
                             {rollObj.dropped !== undefined && (
                               <div className="relative opacity-40 grayscale scale-75">
                                  <div className="text-4xl md:text-5xl font-black text-slate-400 select-none">
                                    {rollObj.dropped}
                                  </div>
                                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-full h-1 bg-red-500/80 rotate-[-20deg]"></div>
                                  </div>
                               </div>
                             )}
                             {/* Kept Die */}
                             <div className="relative scale-90">
                                <div className={`text-4xl md:text-5xl font-black drop-shadow-lg tracking-tighter ${rollObj.value === 20 ? 'text-yellow-400' : rollObj.value === 1 ? 'text-red-500' : 'text-white'}`}>
                                  {rollObj.value}
                                </div>
                                <span className="text-[10px] uppercase text-slate-500 font-bold block text-center mt-1">d20</span>
                             </div>
                           </React.Fragment>
                         ))}
                       </div>

                       {/* Bonus Dice Row (Bless/Guidance/etc) */}
                       {calcData && calcData.otherDiceElements.length > 0 && (
                         <div className="flex items-center justify-center flex-wrap gap-3 mt-1 pb-2 border-b border-slate-700/50 w-full">
                           <Plus className="w-4 h-4 text-slate-500" />
                           {calcData.otherDiceElements.map((item, idx) => (
                             <div key={idx} className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded border border-slate-700">
                                <span className="text-xs font-bold text-slate-400 uppercase">{item.rolls.length}{item.type}</span>
                                <span className="font-bold text-white text-lg">{item.value}</span>
                             </div>
                           ))}
                         </div>
                       )}
                     </div>

                     {/* Calculation Formula */}
                     <div className="text-slate-400 font-mono text-sm bg-slate-800/50 px-3 py-1.5 rounded border border-slate-700/50">
                        {calcData.naturalD20} (d20)
                        {calcData.otherDiceSum > 0 && ` + ${calcData.otherDiceSum} (dice)`}
                        {result.modifier !== 0 && (result.modifier > 0 ? ` + ${result.modifier} (mod)` : ` - ${Math.abs(result.modifier)} (mod)`)}
                        <span className="text-slate-200 font-bold"> = {result.total}</span>
                     </div>
                   </div>
                ) : (
                  // STANDARD DISPLAY (Total Large)
                  <>
                    <h3 className="text-slate-400 uppercase tracking-widest text-xs font-semibold mb-2">{result.label ? 'Result' : 'Total'}</h3>
                    <div className={`text-6xl md:text-7xl font-black drop-shadow-lg tracking-tighter ${specialEffect === 'crit' ? 'text-yellow-400 animate-pulse' : specialEffect === 'fail' ? 'text-red-500 animate-shake' : 'text-white'}`}>
                      {result.total}
                    </div>
                    {result.modifier !== 0 && (
                      <div className="text-slate-400 mt-2 text-sm font-mono">
                        (Roll: {result.total - result.modifier}) {result.modifier > 0 ? ` + ${result.modifier}` : ` - ${Math.abs(result.modifier)}`}
                      </div>
                    )}
                  </>
                )}

              </div>

              {/* Dice Breakdown (For non-d20 only rolls) */}
              {!isD20Roll && (
                <div className="p-4 bg-slate-800 flex justify-center flex-wrap gap-2">
                   {Object.entries(result.breakdown).map(([dieType, rolls]) => (
                      <div key={dieType} className="flex gap-2">
                         {rolls.map((r, i) => (
                            <div key={i} className={`w-8 h-8 flex items-center justify-center rounded bg-slate-700 text-slate-200 font-bold text-sm ${r.dropped ? 'opacity-40 line-through' : ''} ${r.value === 20 ? 'text-yellow-400' : r.value === 1 ? 'text-red-400' : ''}`}>
                               {r.value}
                            </div>
                         ))}
                      </div>
                   ))}
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
