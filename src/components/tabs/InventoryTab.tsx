"use client";

import { Coins, Package, Plus, Sparkles, X, List, ShieldCheck, BicepsFlexed, Briefcase } from 'lucide-react';
import { useCharacter } from '@/contexts/CharacterContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  Accordion, 
  AccordionItem, 
  AccordionTrigger,
  AccordionContent 
} from "@/components/ui/accordion";
import { cn } from '@/lib/utils';

// CENTRALIZED STYLE THEME FOR EASY EDITING
const THEME = {
  colors: {
    primary: '#c77c1aff',      // Amber (Main Theme Color)
    consumables: '#F48C25',    // Amber-ish
    equipment: '#60A5FA',      // Blue
    inventory: '#A8A29E',      // Gray
    encumbered: '#EF4444',     // Red
    wallet: '#EAB308',         // Yellow-500
    currency: {
      cp: '#C2410C',           // orange-700
      sp: '#94A3B8',           // slate-400
      ep: '#93C5FD',           // blue-300
      gp: '#EAB308',           // yellow-500
      pp: '#E2E8F0'            // slate-200
    },
    bag: '#818CF8',            // Indigo-400
    untracked: '#34D399',      // Emerald-400
    textMain: '#FFFFFF',       // White
    textMuted: '#A3A3A3',      // Neutral 400
  }
};

export default function InventoryTab() {
  const { 
    stats,
    currency, updateCurrency, 
    consumables, updateConsumable, removeConsumable, addConsumable,
    equipmentItems, updateEquipmentItem, removeEquipmentItem, addEquipmentItem,
    inventoryItems, updateInventoryItem, removeInventoryItem, addInventoryItem,
    bagItems, updateBagItem, removeBagItem, addBagItem,
    untrackedItems, updateUntrackedItem, removeUntrackedItem, addUntrackedItem,
    doubleCarry, setDoubleCarry
  } = useCharacter();

  // EFFECT: Live calculation of total carried load including all structured item categories
  const totalWeight = consumables.reduce((acc, item) => acc + ((item.weight || 0) * item.count), 0) + 
                      equipmentItems.reduce((acc, item) => acc + (item.weight || 0), 0) +
                      inventoryItems.reduce((acc, item) => acc + (item.weight || 0), 0);

  // EFFECT: Independent calculation for Bag of Holding contents (usually max 500 lbs)
  const totalBagWeight = bagItems.reduce((acc, item) => acc + (item.weight || 0), 0);

  // FORMULA: 2024 Carry Rules - Capacity = Strength Score * 15. 
  // EFFECT: Multiplied by 2 if doubleCarry is active (Powerful Build trait, Enlarge spell, etc.)
  const carryCapacity = (stats.str || 10) * 15 * (doubleCarry ? 2 : 1);
  const isEncumbered = totalWeight > carryCapacity;
  const weightPercentage = Math.min(100, (totalWeight / carryCapacity) * 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      
      {/* LEFT COLUMN: CONSUMABLES, EQUIPMENT, AND STRUCTURED INVENTORY */}
      <div className="space-y-6">
        {/* CONSUMABLES CARD: Quantity tracking with per-item weight */}
        <Card className="flex flex-col">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="w-5 h-5" style={{ color: THEME.colors.consumables }} /> Consumables
            </CardTitle>
            <span className="text-[10px] uppercase font-bold" style={{ color: THEME.colors.textMuted }}>Qty / Lbs</span>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 h-64 pr-3">
              <div className="space-y-2">
                {consumables.length === 0 && (
                  <div className="text-center py-10 text-sm italic" style={{ color: THEME.colors.textMuted }}>
                    Add items with quantity tracking...
                  </div>
                )}
                {consumables.map(item => (
                  <div key={item.id} className="inventory-item-row gap-1">
                    <Input 
                      type="text" 
                      value={item.name}
                      onChange={(e) => updateConsumable(item.id, 'name', e.target.value)}
                      placeholder="Item name"
                      className="inventory-item-input"
                    />
                    <div className="flex items-center bg-background rounded border h-8 px-1">
                      <Button size="icon" variant="ghost" className="w-6 h-6" onClick={() => updateConsumable(item.id, 'count', Math.max(0, (item.count as number) - 1))}>-</Button>
                      <span className="text-xs font-mono w-5 text-center font-bold" style={{ color: THEME.colors.primary }}>{item.count}</span>
                      <Button size="icon" variant="ghost" className="w-6 h-6" onClick={() => updateConsumable(item.id, 'count', (item.count as number) + 1)}>+</Button>
                    </div>
                    <div className="flex items-center bg-background rounded border h-8 w-14 overflow-hidden">
                      <Input 
                        type="number"
                        value={item.weight}
                        onChange={(e) => updateConsumable(item.id, 'weight', parseFloat(e.target.value) || 0)}
                        className="w-full h-full border-0 bg-transparent text-center text-xs font-mono px-1 focus-visible:ring-0"
                        placeholder="Lbs"
                      />
                    </div>
                    <Button size="icon" variant="ghost" className="w-7 h-7 hover:text-destructive" style={{ color: THEME.colors.textMuted }} onClick={() => removeConsumable(item.id)}><X className="w-4 h-4" /></Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Button onClick={addConsumable} variant="outline" className="w-full mt-4 border-dashed">
              <Plus className="w-4 h-4 mr-2" /> Add Consumable
            </Button>
          </CardContent>
        </Card>

        {/* EQUIPMENT CARD: Items with "isWearing" status and Weight */}
        <Card className="flex flex-col">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="w-5 h-5" style={{ color: THEME.colors.equipment }} /> Equipment
            </CardTitle>
            <span className="text-[10px] uppercase font-bold" style={{ color: THEME.colors.textMuted }}>Wearing / Lbs</span>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 h-64 pr-3">
              <div className="space-y-2">
                {equipmentItems.length === 0 && (
                  <div className="text-center py-10 text-sm italic" style={{ color: THEME.colors.textMuted }}>
                    Add weapons, armor, and gear...
                  </div>
                )}
                {equipmentItems.map(item => (
                  <div 
                    key={item.id} 
                    className="inventory-item-row gap-1"
                    style={item.isWearing ? { borderColor: 'rgba(199, 124, 26, 0.4)', backgroundColor: 'rgba(199, 124, 26, 0.05)' } : {}}
                  >
                    <div className="px-2 flex items-center">
                      <Checkbox 
                        checked={item.isWearing} 
                        onCheckedChange={(val) => updateEquipmentItem(item.id, 'isWearing', !!val)}
                        className="data-[state=checked]:bg-primary"
                        style={item.isWearing ? { backgroundColor: THEME.colors.primary, borderColor: THEME.colors.primary } : {}}
                      />
                    </div>
                    <Input 
                      type="text" 
                      value={item.name}
                      onChange={(e) => updateEquipmentItem(item.id, 'name', e.target.value)}
                      placeholder="Equipment name"
                      className="inventory-item-input"
                    />
                    <div className="flex items-center bg-background rounded border h-8 w-14 overflow-hidden">
                      <Input 
                        type="number"
                        value={item.weight}
                        onChange={(e) => updateEquipmentItem(item.id, 'weight', parseFloat(e.target.value) || 0)}
                        className="w-full h-full border-0 bg-transparent text-center text-xs font-mono px-1 focus-visible:ring-0"
                        placeholder="Lbs"
                      />
                    </div>
                    <Button size="icon" variant="ghost" className="w-7 h-7 hover:text-destructive" style={{ color: THEME.colors.textMuted }} onClick={() => removeEquipmentItem(item.id)}><X className="w-4 h-4" /></Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Button onClick={addEquipmentItem} variant="outline" className="w-full mt-4 border-dashed">
              <Plus className="w-4 h-4 mr-2" /> Add Equipment
            </Button>
          </CardContent>
        </Card>

        {/* INVENTORY CARD: Structured list for general items with weight */}
        <Card className="flex flex-col">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="w-5 h-5" style={{ color: THEME.colors.inventory }} /> Inventory
            </CardTitle>
            <span className="text-[10px] uppercase font-bold" style={{ color: THEME.colors.textMuted }}>Lbs</span>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 h-64 pr-3">
              <div className="space-y-2">
                {inventoryItems.length === 0 && (
                  <div className="text-center py-10 text-sm italic" style={{ color: THEME.colors.textMuted }}>
                    Add other gear and items...
                  </div>
                )}
                {inventoryItems.map(item => (
                  <div key={item.id} className="inventory-item-row gap-1">
                    <Input 
                      type="text" 
                      value={item.name}
                      onChange={(e) => updateInventoryItem(item.id, 'name', e.target.value)}
                      placeholder="Item name"
                      className="inventory-item-input"
                    />
                    <div className="flex items-center bg-background rounded border h-8 w-14 overflow-hidden">
                      <Input 
                        type="number"
                        value={item.weight}
                        onChange={(e) => updateInventoryItem(item.id, 'weight', parseFloat(e.target.value) || 0)}
                        className="w-full h-full border-0 bg-transparent text-center text-xs font-mono px-1 focus-visible:ring-0"
                        placeholder="Lbs"
                      />
                    </div>
                    <Button size="icon" variant="ghost" className="w-7 h-7 hover:text-destructive" style={{ color: THEME.colors.textMuted }} onClick={() => removeInventoryItem(item.id)}><X className="w-4 h-4" /></Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Button onClick={addInventoryItem} variant="outline" className="w-full mt-4 border-dashed">
              <Plus className="w-4 h-4 mr-2" /> Add Item
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* RIGHT COLUMN: WALLET, BAG OF HOLDING, UNTRACKED, SUMMARY */}
      <div className="space-y-6">
        {/* TOTAL WEIGHT SUMMARY: Displays live calculation of current load vs capacity */}
        <div 
          className="bg-card border-2 rounded-xl p-4 flex flex-col gap-3 shadow-lg transition-colors"
          style={{ borderColor: isEncumbered ? 'rgba(239, 68, 68, 0.5)' : 'rgba(199, 124, 26, 0.2)' }}
        >
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold" style={{ color: THEME.colors.textMuted }}>
                Carried Load / Capacity (STR × 15{doubleCarry ? ' × 2' : ''})
              </span>
              <div className="flex items-baseline gap-2">
                <span 
                  className="text-2xl font-black font-headline" 
                  style={{ color: isEncumbered ? THEME.colors.encumbered : THEME.colors.primary }}
                >
                  {totalWeight.toFixed(1)}
                </span>
                <span className="text-sm font-bold" style={{ color: THEME.colors.textMuted }}>/ {carryCapacity} Lbs</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setDoubleCarry(!doubleCarry)}
                className="h-10 w-10 rounded-full transition-all border"
                style={doubleCarry ? { color: THEME.colors.primary, backgroundColor: 'rgba(199, 124, 26, 0.1)', borderColor: 'rgba(199, 124, 26, 0.3)' } : { color: THEME.colors.textMuted, borderColor: 'transparent' }}
                title="Double Carry Capacity (Powerful Build, Enlarge, etc.)"
              >
                <BicepsFlexed className="w-6 h-6" />
              </Button>
              <Package className="w-8 h-8" style={{ color: isEncumbered ? 'rgba(239, 68, 68, 0.4)' : 'rgba(199, 124, 26, 0.4)' }} />
            </div>
          </div>
          
          <div className="space-y-1">
            <Progress 
              value={weightPercentage} 
              className={cn("h-2", isEncumbered && "bg-destructive/20 [&>div]:bg-destructive")} 
            />
            {isEncumbered && (
              <p className="text-[10px] font-bold uppercase animate-pulse" style={{ color: THEME.colors.encumbered }}>You are encumbered!</p>
            )}
          </div>
        </div>

        {/* WALLET CARD: Standard D&D currency tracking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="w-5 h-5" style={{ color: THEME.colors.wallet }} /> Wallet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2 bg-background/50 p-2 rounded-lg border">
              {(['cp', 'sp', 'ep', 'gp', 'pp'] as const).map(type => (
                <div key={type} className="flex flex-col items-center">
                  <label className="text-[10px] font-bold uppercase mb-1" style={{ color: THEME.colors.currency[type] }}>{type}</label>
                  <Input
                    type="number"
                    value={currency[type]}
                    onChange={(e) => updateCurrency(type, parseInt(e.target.value))}
                    className="w-full text-center font-code text-sm py-1 h-8"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* BAG OF HOLDING: Independent list with its own weight tracker */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="bag" className="border-none">
            <Card className="overflow-hidden">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center justify-between w-full pr-2">
                  <CardTitle className="flex items-center gap-2 text-base m-0">
                    <Briefcase className="w-5 h-5" style={{ color: THEME.colors.bag }} /> Bag of Holding
                  </CardTitle>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase font-bold" style={{ color: THEME.colors.textMuted }}>Internal Weight</span>
                    <span className="text-xs font-mono font-bold" style={{ color: THEME.colors.bag }}>{totalBagWeight.toFixed(1)} / 500.0</span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="flex flex-col pt-0">
                  <ScrollArea className="h-64 pr-3">
                    <div className="space-y-2">
                      {bagItems.length === 0 && (
                        <div className="text-center py-10 text-sm italic" style={{ color: THEME.colors.textMuted }}>
                          The bag is empty...
                        </div>
                      )}
                      {bagItems.map(item => (
                        <div key={item.id} className="inventory-item-row gap-1" style={{ borderColor: 'rgba(129, 140, 248, 0.2)' }}>
                          <Input 
                            type="text" 
                            value={item.name}
                            onChange={(e) => updateBagItem(item.id, 'name', e.target.value)}
                            placeholder="Item name"
                            className="inventory-item-input"
                          />
                          <div className="flex items-center bg-background rounded border h-8 w-14 overflow-hidden">
                            <Input 
                              type="number"
                              value={item.weight}
                              onChange={(e) => updateBagItem(item.id, 'weight', parseFloat(e.target.value) || 0)}
                              className="w-full h-full border-0 bg-transparent text-center text-xs font-mono px-1 focus-visible:ring-0"
                              placeholder="Lbs"
                            />
                          </div>
                          <Button size="icon" variant="ghost" className="w-7 h-7 hover:text-destructive" style={{ color: THEME.colors.textMuted }} onClick={() => removeBagItem(item.id)}><X className="w-4 h-4" /></Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <Button onClick={addBagItem} variant="outline" className="w-full mt-4 border-dashed" style={{ borderColor: 'rgba(129, 140, 248, 0.3)' }}>
                    <Plus className="w-4 h-4 mr-2" /> Add to Bag
                  </Button>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>
        </Accordion>

        {/* UNTRACKED CONTENT: Miscellaneous loot without weight or quantity */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="untracked" className="border-none">
            <Card className="overflow-hidden">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <CardTitle className="flex items-center gap-2 text-base">
                  <List className="w-5 h-5" style={{ color: THEME.colors.untracked }} /> Untracked Content
                </CardTitle>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="flex flex-col pt-0">
                  <ScrollArea className="inventory-scroll-area-sm">
                    <div className="space-y-2">
                      {untrackedItems.length === 0 && (
                        <div className="text-center py-6 text-sm italic" style={{ color: THEME.colors.textMuted }}>
                          Add miscellaneous items here...
                        </div>
                      )}
                      {untrackedItems.map(item => (
                        <div key={item.id} className="inventory-item-row">
                          <Input 
                            type="text" 
                            value={item.name}
                            onChange={(e) => updateUntrackedItem(item.id, e.target.value)}
                            placeholder="Item description"
                            className="inventory-item-input"
                          />
                          <Button size="icon" variant="ghost" className="w-7 h-7 hover:text-destructive" style={{ color: THEME.colors.textMuted }} onClick={() => removeUntrackedItem(item.id)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <Button onClick={addUntrackedItem} variant="outline" className="w-full mt-4 border-dashed h-8 text-xs">
                    <Plus className="w-3 h-3 mr-2" /> Add Item
                  </Button>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
