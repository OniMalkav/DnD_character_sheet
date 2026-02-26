const fs = require('fs');
const path = require('path');

// Make sure this points to exactly where your JSON file lives!
const inputPath = path.join(__dirname, '../../lib/spells/spells_2024.json');
// We will save it to a new file first, just to be safe
const outputPath = path.join(__dirname, '../../lib/spells/spells_2024_clean.json');

function removeDuplicates() {
  console.log("Reading the massive spellbook...");
  
  // 1. Load the giant JSON file
  const rawData = fs.readFileSync(inputPath, 'utf8');
  const allSpells = JSON.parse(rawData);
  
  // 2. We use a Map to keep track of names. Maps only allow unique keys!
  const uniqueSpellsMap = new Map();
  
  allSpells.forEach(spell => {
    // Make the name lowercase to ensure "Fireball" and "fireball" are treated as the same
    const safeName = spell.name.toLowerCase().trim();
    
    // If we haven't seen this spell name before, add it to our Map
    if (!uniqueSpellsMap.has(safeName)) {
      uniqueSpellsMap.set(safeName, spell);
    } 
    // If we HAVE seen it, we simply ignore it and move on!
  });
  
  // 3. Convert our clean Map back into a standard array
  const cleanSpellsList = Array.from(uniqueSpellsMap.values());
  
  // 4. Save the new, clean array to a file
  fs.writeFileSync(outputPath, JSON.stringify(cleanSpellsList, null, 2));
  
  console.log(`✨ Success! Removed duplicates.`);
  console.log(`Original count: ${allSpells.length} spells.`);
  console.log(`Clean count: ${cleanSpellsList.length} spells.`);
}

removeDuplicates();