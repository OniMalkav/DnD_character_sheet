"use client";

import { Coins, Package, Plus, Sparkles, X, List } from 'lucide-react';
import { useCharacter } from '@/contexts/CharacterContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
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
    untrackedItems, addUntrackedItem, updateUntrackedItem, removeUntrackedItem,
    inventory, setInventory 
  } = useCharacter();

  return (
    /* Main layout grid: Swaps to a single column on mobile and 2 columns on large screens */
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      
      {/* LEFT COLUMN: PRIMARY GEAR AND CONSUMABLES */}
      <div className="space-y-6">
        {/* CONSUMABLES CARD: For items with specific quantities like Potions or Arrows */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="w-5 h-5 text-primary" /> Consumables
            </CardTitle>
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
                  <div key={item.id} className="inventory-item-row">
                    {/* Item name input */}
                    <Input 
                      type="text" 
                      value={item.name}
                      onChange={(e) => updateConsumable(item.id, 'name', e.target.value)}
                      placeholder="Item name"
                      className="inventory-item-input"
                    />
                    {/* Quantity controls */}
                    <div className="flex items-center gap-1 bg-background rounded border">
                      <Button size="icon" variant="ghost" className="w-7 h-7" onClick={() => updateConsumable(item.id, 'count', Math.max(0, (item.count as number) - 1))}>-</Button>
                      <span className="text-sm font-mono w-6 text-center font-bold text-primary">{item.count}</span>
                      <Button size="icon" variant="ghost" className="w-7 h-7" onClick={() => updateConsumable(item.id, 'count', (item.count as number) + 1)}>+</Button>
                    </div>
                    {/* Remove button */}
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

        {/* EQUIPMENT & NOTES: Large text area for armor, weapons, and general inventory details */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="w-5 h-5 text-primary" /> Equipment & Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex min-h-[250px]">
            <Textarea
              value={inventory}
              onChange={(e) => setInventory(e.target.value)}
              placeholder="Armor, weapons, and other long-form notes..."
              className="flex-1 w-full font-code text-sm resize-none leading-relaxed bg-background"
              spellCheck={false}
            />
          </CardContent>
        </Card>
      </div>

      {/* RIGHT COLUMN: CURRENCY AND MISCELLANEOUS ITEMS */}
      <div className="space-y-6">
        {/* WALLET CARD: For tracking copper, silver, electrum, gold, and platinum */}
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

        {/* UNTRACKED CONTENT: Collapsible list for general loot and miscellaneous items */}
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
