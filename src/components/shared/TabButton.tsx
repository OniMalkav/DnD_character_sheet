"use client";

import { cn } from "@/lib/utils";

type TabButtonProps = {
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
};

export default function TabButton({ onClick, isActive, children }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-md text-sm font-bold transition-all",
        isActive
          ? 'bg-muted text-foreground shadow'
          : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {children}
    </button>
  );
}
