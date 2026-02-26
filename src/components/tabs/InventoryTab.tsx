"use client";

import { Coins, Package, Plus, Sparkles, X, List, ScrollText, ShieldCheck } from 'lucide-react';
import { useCharacter } from '@/contexts/CharacterContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { cn } from '@/lib/utils';

export default function InventoryTab() {
  const { 
    currency, updateCurrency, 
    consumables, addConsumable, updateConsumable, removeConsumable,
    equipmentItems, addEquipmentItem, updateEquipmentItem, removeEquipmentItem,
    untrackedItems, addUntrackedItem, updateUntrackedItem, removeUntrackedItem,
    inventory, setInventory 
  } = useCharacter();

  // Effect: Calculates total carried weight for the UI header
  const totalWeight = consumables.reduce((acc, item) => acc + ((item.weight || 0) * item.count), 0) + 
                      equipmentItems.reduce((acc, item) => acc + (item.weight || 0), 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      
      {/* LEFT COLUMN: CONSUMABLES, EQUIPMENT, AND NOTES */}
      <div className="space-y-6">
        {/* CONSUMABLES CARD: Structure updated to include weight input per item */}
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
                    {/* Quantity controls */}
                    <div className="flex items-center bg-background rounded border h-8 px-1">
                      <Button size="icon" variant="ghost" className="w-6 h-6" onClick={() => updateConsumable(item.id, 'count', Math.max(0, (item.count as number) - 1))}>-</Button>
                      <span className="text-xs font-mono w-5 text-center font-bold text-primary">{item.count}</span>
                      <Button size="icon" variant="ghost" className="w-6 h-6" onClick={() => updateConsumable(item.id, 'count', (item.count as number) + 1)}>+</Button>
                    </div>
                    {/* Weight input for consumables */}
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

        {/* EQUIPMENT CARD: Structured list for armor/weapons with Wearing status and Weight */}
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
                    {/* Wearing Toggle (Checkbox) */}
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
                    {/* Weight input for equipment */}
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

        {/* NOTES CONTAINER: Separate from structured items for free-form character details */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ScrollText className="w-5 h-5 text-primary" /> Adventure Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex min-h-[150px]">
            <Textarea
              value={inventory}
              onChange={(e) => setInventory(e.target.value)}
              placeholder="Record quest notes, NPC names, and other details..."
              className="flex-1 w-full font-code text-sm resize-none leading-relaxed bg-background"
              spellCheck={false}
            />
          </CardContent>
        </Card>
      </div>

      {/* RIGHT COLUMN: WALLET, UNTRACKED, AND TOTAL WEIGHT SUMMARY */}
      <div className="space-y-6">
        {/* TOTAL WEIGHT SUMMARY: Effect displays live calculation of current load */}
        <div className="bg-card border-2 border-primary/20 rounded-xl p-4 flex justify-between items-center shadow-lg">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Total Carried Load</span>
            <span className="text-2xl font-black text-primary font-headline">{totalWeight.toFixed(1)} Lbs</span>
          </div>
          <Package className="w-8 h-8 text-primary/40" />
        </div>

        {/* WALLET CARD */}
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

        {/* UNTRACKED CONTENT: Collapsible accordion for miscellaneous loot */}
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
