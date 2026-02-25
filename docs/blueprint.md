# **App Name**: Adventurer's Tome

## Core Features:

- Intuitive Dice Roller: Select multiple dice (d4, d6, d8, d10, d12, d20, d100), apply positive or negative modifiers, and roll with advantage or disadvantage. Critical successes and failures are visually highlighted.
- Character Sheet Management: Manage core character statistics (STR, DEX, CON, INT, WIS, CHA) and proficiency bonus, along with bio details like name, race, classes, levels, background, alignment, and experience points.
- Skill Check Automation: Automatically calculate skill check modifiers based on character stats and proficiencies. Optionally apply bonus dice for abilities like Guidance or Bardic Inspiration before rolling.
- Inventory & Currency Tracker: Maintain a text-based inventory for gear and notes, track specific consumables with quantity management, and keep a ledger of various currency types (CP, SP, EP, GP, PP).
- Interactive Spellbook & Spell Slot Manager: Track available and expended spell slots across all levels. Add custom spells to a personal spellbook, categorized by level, and dynamically calculate spell save DCs and attack bonuses based on selected spellcasting ability.
- Character Import/Export: Save and load character data to and from local JSON files, enabling easy backup and sharing of character sheets.
- Lore & Encounter Generator Tool: Utilize a generative AI tool to assist in world-building by generating quick lore snippets, character descriptions, or minor encounter ideas based on user input, to inspire roleplaying sessions.

## Style Guidelines:

- Dark color scheme for an immersive fantasy atmosphere. Primary accent: A vibrant, adventurous orange (#F48C25), reminiscent of magic or courage, contrasting with a very dark desaturated earthy background (#2E261F). A magical indigo (#2626DC) will serve as a secondary accent for spell-related elements.
- Body and headline font: 'PT Sans' (humanist sans-serif) for excellent readability and a modern, personable feel. Utilize 'Source Code Pro' (monospace sans-serif) for character statistics, dice breakdown, and numerical input fields to give a distinct, clear data display.
- Consistent use of clear, vector-based icons from 'Lucide React' (e.g., Dices for rolls, Book for spells, Package for inventory, User for character profile) to visually delineate sections and actions effectively.
- Clean, component-based layout organized around a primary tabbed navigation. Implement responsive grid structures for dice selection, character stats, and skill lists, ensuring usability across various screen sizes. Important information like roll results will be presented prominently.
- Retain engaging visual effects such as 'crit' and 'fail' animations with sparkles/shaking. Incorporate subtle transition animations for tab switching and form interactions to provide dynamic and responsive user feedback.