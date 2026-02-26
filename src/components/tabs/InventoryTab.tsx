"use client";

import { Coins, Package, Plus, Sparkles, X, List, ShieldCheck, BicepsFlexed } from 'lucide-react';
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

export default function InventoryTab() {
  const { 
    stats,
    currency, updateCurrency, 
    consumables, updateConsumable, removeConsumable, addConsumable,
    equipmentItems, updateEquipmentItem, removeEquipmentItem, addEquipmentItem,
    inventoryItems, updateInventoryItem, removeInventoryItem, addInventoryItem,
    untrackedItems, updateUntrackedItem, removeUntrackedItem, addUntrackedItem,
    doubleCarry, setDoubleCarry
  } = useCharacter();

  // EFFECT: Live calculation of total carried load including all structured item categories
  const totalWeight = consumables.reduce((acc, item) => acc + ((item.weight || 0) * item.count), 0) + 
                      equipmentItems.reduce((acc, item) => acc + (item.weight || 0), 0) +
                      inventoryItems.reduce((acc, item) => acc + (item.weight || 0), 0);

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
              <Sparkles className="w-5 h-5 text-primary" /> Consumables
            </CardTitle>
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Qty / Lbs</span>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 h-64 pr-3">
              <div className="space-y-2">
                {consumables.length === 0 && (
                  <div className="text-center text-muted-foreground py-10 text-sm italic">
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
                      <span className="text-xs font-mono w-5 text-center font-bold text-primary">{item.count}</span>
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
                    <Button size="icon" variant="ghost" className="w-7 h-7 text-muted-foreground hover:text-destructive" onClick={() => removeConsumable(item.id)}><X className="w-4 h-4" /></Button>
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
              <ShieldCheck className="w-5 h-5 text-primary" /> Equipment
            </CardTitle>
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Wearing / Lbs</span>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 h-64 pr-3">
              <div className="space-y-2">
                {equipmentItems.length === 0 && (
                  <div className="text-center text-muted-foreground py-10 text-sm italic">
                    Add weapons, armor, and gear...
                  </div>
                )}
                {equipmentItems.map(item => (
                  <div key={item.id} className={cn("inventory-item-row gap-1", item.isWearing && "border-primary/40 bg-primary/5")}>
                    <div className="px-2 flex items-center">
                      <Checkbox 
                        checked={item.isWearing} 
                        onCheckedChange={(val) => updateEquipmentItem(item.id, 'isWearing', !!val)}
                        className="data-[state=checked]:bg-primary"
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
                    <Button size="icon" variant="ghost" className="w-7 h-7 text-muted-foreground hover:text-destructive" onClick={() => removeEquipmentItem(item.id)}><X className="w-4 h-4" /></Button>
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
              <Package className="w-5 h-5 text-primary" /> Inventory
            </CardTitle>
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Lbs</span>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 h-64 pr-3">
              <div className="space-y-2">
                {inventoryItems.length === 0 && (
                  <div className="text-center text-muted-foreground py-10 text-sm italic">
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
                    <Button size="icon" variant="ghost" className="w-7 h-7 text-muted-foreground hover:text-destructive" onClick={() => removeInventoryItem(item.id)}><X className="w-4 h-4" /></Button>
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

      {/* RIGHT COLUMN: WALLET, UNTRACKED, SUMMARY */}
      <div className="space-y-6">
        {/* TOTAL WEIGHT SUMMARY: Displays live calculation of current load vs capacity */}
        <div className={cn(
          "bg-card border-2 rounded-xl p-4 flex flex-col gap-3 shadow-lg transition-colors",
          isEncumbered ? "border-destructive/50 shadow-destructive/10" : "border-primary/20"
        )}>
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">
                Carried Load / Capacity (STR × 15{doubleCarry ? ' × 2' : ''})
              </span>
              <div className="flex items-baseline gap-2">
                <span className={cn("text-2xl font-black font-headline", isEncumbered ? "text-destructive" : "text-primary")}>
                  {totalWeight.toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground font-bold">/ {carryCapacity} Lbs</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setDoubleCarry(!doubleCarry)}
                className={cn("h-10 w-10 rounded-full transition-all border", doubleCarry ? "text-primary bg-primary/10 border-primary/30" : "text-muted-foreground border-transparent")}
                title="Double Carry Capacity (Powerful Build, Enlarge, etc.)"
              >
                <BicepsFlexed className="w-6 h-6" />
              </Button>
              <Package className={cn("w-8 h-8", isEncumbered ? "text-destructive/40" : "text-primary/40")} />
            </div>
          </div>
          
          <div className="space-y-1">
            <Progress value={weightPercentage} className={cn("h-2", isEncumbered && "bg-destructive/20 [&>div]:bg-destructive")} />
            {isEncumbered && (
              <p className="text-[10px] text-destructive font-bold uppercase animate-pulse">You are encumbered!</p>
            )}
          </div>
        </div>

        {/* WALLET CARD: Standard D&D currency tracking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-yellow-500" /> Wallet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2 bg-background/50 p-2 rounded-lg border">
              {(['cp', 'sp', 'ep', 'gp', 'pp'] as const).map(type => (
                <div key={type} className="flex flex-col items-center">
                  <label className={cn("text-[10px] font-bold uppercase mb-1", {
                    'text-orange-700': type === 'cp', 'text-slate-400': type === 'sp',
                    'text-blue-300': type === 'ep', 'text-yellow-500': type === 'gp',
                    'text-slate-200': type === 'pp'
                  })}>{type}</label>
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

        {/* UNTRACKED CONTENT: Miscellaneous loot without weight or quantity */}
        <Accordion type="single" collapsible defaultValue="untracked" className="w-full">
          <AccordionItem value="untracked" className="border-none">
            <Card className="overflow-hidden">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <CardTitle className="flex items-center gap-2 text-base">
                  <List className="w-5 h-5 text-indigo-400" /> Untracked Content
                </CardTitle>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="flex flex-col pt-0">
                  <ScrollArea className="inventory-scroll-area-sm">
                    <div className="space-y-2">
                      {untrackedItems.length === 0 && (
                        <div className="text-center text-muted-foreground py-6 text-sm italic">
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
                          <Button size="icon" variant="ghost" className="w-7 h-7 text-muted-foreground hover:text-destructive" onClick={() => removeUntrackedItem(item.id)}>
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
