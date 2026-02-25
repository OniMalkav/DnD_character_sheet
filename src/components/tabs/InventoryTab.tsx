"use client";

import { Coins, Package, Plus, Sparkles, X } from 'lucide-react';
import { useCharacter } from '@/contexts/CharacterContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export default function InventoryTab() {
  const { 
    currency, updateCurrency, 
    consumables, addConsumable, updateConsumable, removeConsumable,
    inventory, setInventory 
  } = useCharacter();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-yellow-500" /> Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="grid grid-cols-5 gap-2 mb-6 bg-background/50 p-2 rounded-lg border">
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

          <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4 pt-4 border-t">
            <Sparkles className="w-5 h-5 text-primary" /> Consumables
          </h3>
          <ScrollArea className="flex-1 h-64 pr-3">
            <div className="space-y-2">
              {consumables.map(item => (
                <div key={item.id} className="flex items-center gap-2 bg-background p-2 rounded-lg border">
                  <Input 
                    type="text" 
                    value={item.name}
                    onChange={(e) => updateConsumable(item.id, 'name', e.target.value)}
                    placeholder="Item name"
                    className="flex-1 bg-transparent border-0 h-8 focus-visible:ring-0"
                  />
                  <div className="flex items-center gap-1 bg-background rounded border">
                    <Button size="icon" variant="ghost" className="w-7 h-7" onClick={() => updateConsumable(item.id, 'count', Math.max(0, (item.count as number) - 1))}>-</Button>
                    <span className="text-sm font-mono w-6 text-center font-bold text-primary">{item.count}</span>
                    <Button size="icon" variant="ghost" className="w-7 h-7" onClick={() => updateConsumable(item.id, 'count', (item.count as number) + 1)}>+</Button>
                  </div>
                  <Button size="icon" variant="ghost" className="w-7 h-7 text-muted-foreground hover:text-destructive" onClick={() => removeConsumable(item.id)}><X className="w-4 h-4" /></Button>
                </div>
              ))}
            </div>
          </ScrollArea>
           <Button onClick={addConsumable} variant="outline" className="w-full mt-4 border-dashed">
            <Plus className="w-4 h-4 mr-2" /> Add Item
          </Button>
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" /> Equipment & Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex">
          <Textarea
            value={inventory}
            onChange={(e) => setInventory(e.target.value)}
            placeholder="Armor, weapons, and other items..."
            className="flex-1 w-full font-code text-sm resize-none leading-relaxed bg-background"
            spellCheck={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}
