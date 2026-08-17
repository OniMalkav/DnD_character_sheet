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
          ? 'text-primary border-b-2 border-primary rounded-none px-3 py-1.5'
          : 'text-muted-foreground hover:text-foreground px-3 py-1.5'
      )}
    >
      {children}
    </button>
  );
}
