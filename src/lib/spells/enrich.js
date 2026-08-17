const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'spells-xphb.json');
const outputPath = path.join(__dirname, 'spells_2024_enriched.json');

// Maps 5etools single letters to full School names
const SCHOOL_MAP = {
  "A": "Abjuration", "C": "Conjuration", "D": "Divination",
  "E": "Enchantment", "V": "Evocation", "I": "Illusion",
  "N": "Necromancy", "T": "Transmutation"
};

// Strips out the 5etools {@damage 1d10} formatting and just returns "1d10"
function cleanText(text) {
  if (!text) return text;
  // Matches {@tag text|other|stuff} and keeps just the first useful 'text' part
  return text.replace(/\{@[a-zA-Z0-9_-]+\s+([^}|]+).*?\}/gi, '$1');
}

function flattenEntries(entries) {
  let text = "";
  if (!entries) return text;

  for (const entry of entries) {
    if (typeof entry === 'string') {
      text += entry + "\n\n";
    } else if (typeof entry === 'object') {
      if (entry.entries) {
        text += flattenEntries(entry.entries);
      } else if (entry.items) {
        text += flattenEntries(entry.items);
      }
    }
  }
  return text.trim();
}

function enrich5eToolsData() {
  console.log("Casting Identify at 9th Level on the 5etools spellbook...");

  const rawData = fs.readFileSync(inputPath, 'utf8');
  const parsedData = JSON.parse(rawData);
  const spells = parsedData.spell || [];

  const damageComboRegex = /(\d+d\d+)\s+(acid|bludgeoning|cold|fire|force|lightning|necrotic|piercing|poison|psychic|radiant|slashing|thunder)\s+damage/gi;
  const saveRegex = /(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma) saving throw/i;

  const enrichedSpells = spells.map(spell => {
    // 1. Clean the main description
    let fullDescription = cleanText(flattenEntries(spell.entries));

    // 2. Map Time/Action
    let actionType = "Action";
    if (spell.time && spell.time.length > 0) {
      actionType = `${spell.time[0].number || ''} ${spell.time[0].unit || ''}`.trim();
    }

    // 3. Map Range
    let rangeStr = "Self";
    if (spell.range && spell.range.distance) {
      rangeStr = `${spell.range.distance.amount || ''} ${spell.range.distance.type || ''}`.trim();
      if (rangeStr === 'touch') rangeStr = "Touch";
    }

    // 4. Map Duration & Concentration
    let durationStr = "Instantaneous";
    let isConcentration = false;
    if (spell.duration && spell.duration.length > 0) {
      const d = spell.duration[0];
      isConcentration = !!d.concentration;
      if (d.type === 'timed') {
        durationStr = `${d.duration.amount} ${d.duration.type}`;
      } else if (d.type === 'instant') {
        durationStr = "Instantaneous";
      } else if (d.type === 'permanent') {
        durationStr = "Permanent";
      }
    }

    // 5. Map Components
    let componentsArr = [];
    let materialStr = null;
    if (spell.components) {
      if (spell.components.v) componentsArr.push('v');
      if (spell.components.s) componentsArr.push('s');
      if (spell.components.m) {
        componentsArr.push('m');
        // Material can be a string or an object with text/cost
        materialStr = typeof spell.components.m === 'object' ? spell.components.m.text : spell.components.m;
        materialStr = cleanText(materialStr);
      }
    }

    // 6. Map "At Higher Levels"
    let higherLevelStr = null;
    if (spell.entriesHigherLevel && spell.entriesHigherLevel.length > 0) {
      higherLevelStr = cleanText(flattenEntries(spell.entriesHigherLevel[0].entries));
    }

    // Construct the finalized spell object matching your React props exactly
    let enriched = {
      id: spell.name.toLowerCase().replace(/\s+/g, '-'),
      name: spell.name,
      level: spell.level,
      school: SCHOOL_MAP[spell.school] || spell.school,
      description: fullDescription,
      actionType: actionType,
      range: rangeStr,
      duration: durationStr,
      concentration: isConcentration,
      ritual: !!(spell.meta && spell.meta.ritual),
      components: componentsArr,
      material: materialStr,
      higherLevelSlot: higherLevelStr,
      damageRolls: [],
      saves: []
    };

    // Extract mechanics for your custom damage/save UI highlighting
    let match;
    while ((match = damageComboRegex.exec(fullDescription)) !== null) {
      enriched.damageRolls.push({
        dice: match[1],
        type: match[2].toLowerCase()
      });
    }

    // Standardize Save Required (e.g. "DEX")
    const saveMatch = fullDescription.match(saveRegex);
    if (saveMatch) {
      enriched.saveRequired = saveMatch[1].substring(0, 3).toUpperCase();
    }

    // As a bonus, grab the first damage roll for the unified UI box you have
    if (enriched.damageRolls.length > 0) {
      enriched.damageRoll = enriched.damageRolls[0].dice;
      enriched.damageType = enriched.damageRolls[0].type;
    }

    return enriched;
  });

  fs.writeFileSync(outputPath, JSON.stringify(enrichedSpells, null, 2));
  console.log(`✨ Success! Enriched ${enrichedSpells.length} spells. They are ready for your character sheet!`);
}

enrich5eToolsData();