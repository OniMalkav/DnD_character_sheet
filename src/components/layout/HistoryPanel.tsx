"use client";

import { History, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { RollResult } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';

type HistoryPanelProps = {
  history: RollResult[];
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
};

export default function HistoryPanel({ history, showHistory, setShowHistory }: HistoryPanelProps) {
  return (
    <Sheet open={showHistory} onOpenChange={setShowHistory}>
      <SheetContent className="w-full max-w-md bg-card border-l border-border flex flex-col p-0">
        <SheetHeader className="p-4 border-b border-border flex-row justify-between items-center space-y-0">
          <SheetTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-muted-foreground" />
            Roll History
          </SheetTitle>
          <SheetClose asChild>
            <Button variant="ghost" size="icon">
              <X className="w-6 h-6" />
            </Button>
          </SheetClose>
        </SheetHeader>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
          {history.length === 0 && (
            <div className="text-center text-muted-foreground py-10">No rolls yet.</div>
          )}
          {history.map((h, idx) => (
            <div key={idx} className="bg-background/50 p-3 rounded-lg border border-border/50">
              <div className="flex justify-between items-start mb-1">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground font-code">{h.timestamp}</span>
                  {h.label && <span className="text-xs text-primary font-bold uppercase">{h.label}</span>}
                </div>
                <div className="flex items-center gap-2">
                  {h.rollMode !== 'normal' && (
                    <Badge variant={h.rollMode === 'advantage' ? 'secondary' : 'destructive'} className={`text-[10px] uppercase ${h.rollMode === 'advantage' ? 'bg-green-800 text-green-300' : 'bg-red-900 text-red-300'}`}>{h.rollMode.substring(0,3)}</Badge>
                  )}
                  <span className="text-2xl font-bold font-code">
                    {h.hasD20 ? h.totalHit : h.totalDamage}
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1 break-words font-code">
                {h.detailsStr}
                {h.hitMod !== 0 && ` + ${h.hitMod}`}
                {h.dmgMod !== 0 && ` (Dmg + ${h.dmgMod})`}
              </p>
            </div>
          ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
