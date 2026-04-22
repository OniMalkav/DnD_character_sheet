"use client";
import { Sparkles, Skull } from 'lucide-react';

type CritFailFXProps = {
  specialEffect: 'crit' | 'fail' | null;
};

export default function CritFailFX({ specialEffect }: CritFailFXProps) {
  if (!specialEffect) return null;

  if (specialEffect === 'crit') {
    return (
      <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-yellow-500/10 animate-pulse"></div>
        <div className="relative animate-pop flex flex-col items-center">
          <Sparkles className="w-16 h-16 mb-4 drop-shadow-[0_0_15px_rgba(var(--color-crit),0.8)]" style={{ color: 'rgb(var(--color-crit))' }} />
          <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-500 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] tracking-tighter font-headline" style={{ backgroundImage: 'linear-gradient(to bottom, #fef08a, rgb(var(--color-crit)))' }}>
            NATURAL 20!
          </h1>
        </div>
      </div>
    );
  }

  if (specialEffect === 'fail') {
    return (
      <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-red-900/20"></div>
        <div className="relative animate-pop flex flex-col items-center animate-shake">
          <Skull className="w-16 h-16 mb-4 drop-shadow-[0_0_15px_rgba(var(--color-fail),0.8)]" style={{ color: 'rgb(var(--color-fail))' }} />
          <h1 className="text-6xl md:text-8xl font-black drop-shadow-[0_4px_0_rgba(0,0,0,1)] tracking-tighter font-headline" style={{ color: 'rgb(var(--color-fail))' }}>
            CRITICAL MISS
          </h1>
        </div>
      </div>
    );
  }

  return null;
}
