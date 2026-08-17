"use client";

import React, { useRef } from 'react';
import { Camera, X } from 'lucide-react';
import { useCharacter } from '@/contexts/CharacterContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function PortraitUpload() {
  const { charInfo, updateCharInfo } = useCharacter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // COMPRESSION LOGIC: Resize to max 512px and compress
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Quality 0.7 is usually plenty for a portrait and keeps size small
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          updateCharInfo('portraitUrl', compressedDataUrl);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    updateCharInfo('portraitUrl', '');
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className={cn(
        "relative w-72 h-72 md:w-[450px] md:h-[550px] rounded-3xl border-2 border-dashed border-muted-foreground/30 overflow-hidden flex items-center justify-center transition-all bg-muted/20 hover:border-primary/50 group shadow-2xl",
        charInfo.portraitUrl && "border-solid border-primary/20"
      )}>
        {charInfo.portraitUrl ? (
          <>
            <img 
              src={charInfo.portraitUrl} 
              alt="Character Portrait" 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                className="h-8 text-xs" 
                onClick={() => fileInputRef.current?.click()}
              >
                Change
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                className="h-8 text-xs" 
                onClick={removeImage}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </>
        ) : (
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <Camera className="w-10 h-10 opacity-20" />
            <span className="text-xs font-bold uppercase tracking-widest opacity-60">Upload Portrait</span>
          </button>
        )}
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />
      
      {!charInfo.portraitUrl && (
        <p className="text-[10px] text-muted-foreground italic max-w-[200px] text-center">
            Upload your character's likeness to personalize your Tome.
        </p>
      )}
    </div>
  );
}
