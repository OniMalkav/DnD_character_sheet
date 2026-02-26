const fs = require('fs');

async function get2024Spells() {
  console.log("Gathering the magic... (Fetching 2024 spells from Open5e)");
  let allSpells = [];
  
  // The Open5e API uses pagination. We will loop through the pages until we have everything.
  // We use the 'srd-2024' document slug to ensure we only get the updated 5.2 rules.
  let url = "https://api.open5e.com/v2/spells/?document__slug=srd-2024";

  try {
    while (url) {
      const response = await fetch(url);
      const data = await response.json();
      
      // Add the spells from the current page to our master list
      allSpells.push(...data.results);
      
      // Move to the next page (will be null when we reach the end)
      url = data.next; 
    }

    // Write the final master list to a JSON file in your workspace
fs.writeFileSync('src/lib/spells_2024.json', JSON.stringify(allSpells, null, 2));
    
    console.log(`Success! Saved ${allSpells.length} spells into spells_2024.json.`);
    
  } catch (error) {
    console.error("Oops, a wild error appeared:", error);
  }
}

get2024Spells();