import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculates the D&D 5e ability score modifier.
 * @param score The ability score (e.g., Strength, Dexterity).
 * @returns The modifier for that score.
 */
export const calculateModifier = (score: number): number => {
  return Math.floor((score - 10) / 2);
}
