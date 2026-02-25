// @/app/actions.ts
"use server";

import { generateAdventureLore } from "@/ai/flows/generate-adventure-lore-flow";

export async function generateLoreAction(prompt: string) {
  if (!prompt) {
    return { success: false, error: "Prompt cannot be empty." };
  }
  
  try {
    const lore = await generateAdventureLore(prompt);
    return { success: true, lore };
  } catch (error) {
    console.error("Error generating lore:", error);
    return { success: false, error: "Failed to generate lore. Please try again." };
  }
}
