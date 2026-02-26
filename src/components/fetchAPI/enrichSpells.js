const fs = require('fs');
const path = require('path');

// Point this to your current clean JSON file
const inputPath = path.join(__dirname, '../../lib/spells/spells_2024.json');
// We will save it as an "enriched" version
const outputPath = path.join(__dirname, '../../lib/spells/spells_2024_enriched.json');

function enrichSpellData() {
  console.log("Casting Identify on the spellbook...");
  const rawData = fs.readFileSync(inputPath, 'utf8');
  const spells = JSON.parse(rawData);

  // Regex patterns to find D&D mechanics in normal text
  const diceRegex = /\b(\d+d\d+)\b/; // Looks for "1d6", "8d6", "10d10", etc.
  const saveRegex = /(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma) saving throw/i;
  const damageTypeRegex = /(acid|bludgeoning|cold|fire|force|lightning|necrotic|piercing|poison|psychic|radiant|slashing|thunder) damage/i;

  const enrichedSpells = spells.map(spell => {
    // Make a copy of the spell to modify
    let enriched = { ...spell };
    
    // 1. Extract Damage Roll (e.g., 8d6)
    const diceMatch = spell.description.match(diceRegex);
    if (diceMatch) {
      enriched.damageRoll = diceMatch[1];
    }

    // 2. Extract Damage Type (e.g., fire)
    const typeMatch = spell.description.match(damageTypeRegex);
    if (typeMatch) {
      enriched.damageType = typeMatch[1].toLowerCase();
    }

    // 3. Extract Saving Throw (e.g., Dexterity)
    const saveMatch = spell.description.match(saveRegex);
    if (saveMatch) {
      enriched.saveRequired = saveMatch[1].substring(0, 3).toUpperCase(); // Turns "Dexterity" into "DEX"
    }

    return enriched;
  });

  fs.writeFileSync(outputPath, JSON.stringify(enrichedSpells, null, 2));
  console.log(`✨ Success! Enriched ${enrichedSpells.length} spells with accessible damage/save mechanics.`);
}

enrichSpellData();