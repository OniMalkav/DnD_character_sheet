import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import type { Stats, CharInfo, Currency, Consumable, EquipmentItem, InventoryItem, UntrackedItem, Spell, SpellSlots, Stat } from './types';

export interface CharacterDataPayload {
  characterName: string;
  charInfo: CharInfo;
  stats: Stats;
  pb: number;
  notes: string;
  inventoryItems: InventoryItem[];
  bagItems: InventoryItem[];
  consumables: Consumable[];
  equipmentItems: EquipmentItem[];
  untrackedItems: UntrackedItem[];
  currency: Currency;
  spellAbility: Stat;
  spellSlots: SpellSlots;
  spells: Spell[];
  doubleCarry: boolean;
  profs: string[];
}

/**
 * Saves character data to Firestore under a specific user and character ID
 * @param userId The authenticated user's ID
 * @param characterId A unique identifier (e.g. character name mapped to a slug)
 * @param characterData The data to be stored
 */
export async function saveCharacterToCloud(userId: string, characterId: string, characterData: CharacterDataPayload) {
  try {
    const docRef = doc(db, "users", userId, "characters", characterId);
    await setDoc(docRef, characterData, { merge: true });
    return true;
  } catch (error) {
    console.error("Error saving character to cloud: ", error);
    throw error;
  }
}

/**
 * Loads character data from Firestore for a specific user and character ID
 * @param userId The authenticated user's ID
 * @param characterId The unique identifier used when saving
 * @returns The character data if it exists, otherwise null
 */
export async function loadCharacterFromCloud(userId: string, characterId: string): Promise<CharacterDataPayload | null> {
  // THIS LINE IS THE KEY:
  console.log("DEBUG: Attempting to load from path:", `users/${userId}/characters/${characterId}`);

  try {
    const docRef = doc(db, "users", userId, "characters", characterId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("DEBUG: Success! Data found.");
      return docSnap.data() as CharacterDataPayload;
    } else {
      console.log("DEBUG: Failed. No document exists at that path.");
      return null;
    }
  } catch (error) {
    console.error("DEBUG: Error during fetch:", error);
    throw error;
  }
}

