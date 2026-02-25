"use client";

import { useState } from 'react';
import { Sparkles, WandSparkles } from 'lucide-react';
import { generateLoreAction } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function LoreGeneratorTab() {
  const [prompt, setPrompt] = useState('');
  const [lore, setLore] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsLoading(true);
    setLore('');
    const result = await generateLoreAction(prompt);
    setIsLoading(false);

    if (result.success && result.lore) {
      setLore(result.lore);
    } else {
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: result.error,
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <WandSparkles className="w-6 h-6 text-primary" />
            Lore & Encounter Generator
          </CardTitle>
          <CardDescription>
            Need a spark of inspiration? Generate a lore snippet, character idea, or minor encounter.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A cursed locket found in a sunken ship, a mischievous goblin merchant with a strange cart, a tavern that only appears on foggy nights..."
            className="min-h-[100px] text-base"
          />
          <Button onClick={handleGenerate} disabled={isLoading || !prompt} className="w-full sm:w-auto">
            {isLoading ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Idea
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {(isLoading || lore) && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Idea</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded-full w-full animate-pulse"></div>
                <div className="h-4 bg-muted rounded-full w-5/6 animate-pulse"></div>
                <div className="h-4 bg-muted rounded-full w-3/4 animate-pulse"></div>
              </div>
            ) : (
                <Alert>
                    <AlertTitle>Adventure Hook</AlertTitle>
                    <AlertDescription>
                        <p className="whitespace-pre-wrap font-body text-base leading-relaxed">{lore}</p>
                    </AlertDescription>
                </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
